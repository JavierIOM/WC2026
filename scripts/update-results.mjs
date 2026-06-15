// Auto-update WC2026 match results from football-data.org + Claude Haiku
// Runs every 3 hours via GitHub Actions (.github/workflows/update-results.yml)

import Anthropic from '@anthropic-ai/sdk';
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const PREDICTIONS_PATH = join(ROOT, 'src/data/predictions.ts');
const CHANGELOG_PATH = join(ROOT, 'CHANGELOG.md');
const PACKAGE_PATH = join(ROOT, 'package.json');

const FD_KEY = process.env.FOOTBALL_DATA_API_KEY;
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;

if (!FD_KEY) { console.error('Missing FOOTBALL_DATA_API_KEY'); process.exit(1); }
if (!ANTHROPIC_KEY) { console.error('Missing ANTHROPIC_API_KEY'); process.exit(1); }

const client = new Anthropic({ apiKey: ANTHROPIC_KEY });

// ── Team name mapping: football-data.org names → predictions.ts names ────────
const API_TO_LOCAL = {
  'United States':       'USA',
  'Bosnia-Herzegovina':  'Bosnia',
  'Cape Verde Islands':  'Cape Verde',
  'Congo DR':            'DR Congo',
  'Turkey':              'Türkiye',
};

function apiToLocal(name) {
  return API_TO_LOCAL[name] || name;
}

function norm(name) {
  return apiToLocal(name).toLowerCase().trim();
}

// ── Parse predictions.ts to find pending matches ─────────────────────────────
function parsePendingMatches(content) {
  const pending = [];
  const idPattern = /id:\s*'([^']+)'/g;
  let m;

  while ((m = idPattern.exec(content)) !== null) {
    const id = m[1];
    const rest = content.slice(m.index);
    const endMatch = rest.match(/\n  \},/);
    if (!endMatch) continue;

    const block = rest.slice(0, endMatch.index + endMatch[0].length);

    if (block.includes('actualHome:')) continue;
    if (block.includes('informalOnly: true')) continue;

    const dateMatch    = block.match(/dateISO:\s*'([^']+)'/);
    const homeMatch    = block.match(/home:\s*'([^']+)'/);
    const awayMatch    = block.match(/away:\s*'([^']+)'/);
    const scorerMatch  = block.match(/scorerCall:\s*'([^']+)'/);

    if (!dateMatch || !homeMatch || !awayMatch) continue;

    pending.push({
      id,
      dateISO:     dateMatch[1],
      home:        homeMatch[1],
      away:        awayMatch[1],
      scorerCall:  scorerMatch ? scorerMatch[1] : null,
    });
  }

  return pending;
}

// ── Inject actual result fields into the match block ─────────────────────────
function injectActuals(content, id, actuals) {
  const idIdx = content.indexOf(`id: '${id}'`);
  if (idIdx === -1) {
    console.warn(`Cannot find match ${id} in predictions.ts`);
    return content;
  }

  const rest = content.slice(idIdx);
  const endMatch = rest.match(/\n  \},/);
  if (!endMatch) {
    console.warn(`Cannot find end of block for match ${id}`);
    return content;
  }

  const insertAt = idIdx + endMatch.index;

  const lines = [
    `    actualHome: ${actuals.actualHome},`,
    `    actualAway: ${actuals.actualAway},`,
  ];

  if (actuals.scorers?.length) {
    const list = actuals.scorers.map(s => `'${s.replace(/'/g, "\\'")}'`).join(', ');
    lines.push(`    scorers: [${list}],`);
  } else {
    lines.push(`    scorers: [],`);
  }

  if (actuals.actualNotes) {
    const safe = actuals.actualNotes
      .replace(/'/g, "\\'")
      .replace(/[—–]/g, ',');
    lines.push(`    actualNotes: '${safe}',`);
  }

  return content.slice(0, insertAt) + '\n' + lines.join('\n') + content.slice(insertAt);
}

// ── football-data.org API calls ───────────────────────────────────────────────
async function fetchFinishedMatches() {
  const res = await fetch(
    'https://api.football-data.org/v4/competitions/WC/matches?season=2026&status=FINISHED',
    { headers: { 'X-Auth-Token': FD_KEY } }
  );
  const data = await res.json();
  if (!data.matches) {
    console.error('football-data.org error:', JSON.stringify(data));
    return [];
  }
  return data.matches;
}

async function fetchTournamentScorers() {
  const res = await fetch(
    'https://api.football-data.org/v4/competitions/WC/scorers?season=2026&limit=100',
    { headers: { 'X-Auth-Token': FD_KEY } }
  );
  const data = await res.json();
  return data.scorers || [];
}

// ── Claude Haiku: figure out scorers + write match note ──────────────────────
async function claudeAnalyse(match, apiMatch, allScorers) {
  const { home, away } = match;
  const homeScore = apiMatch.score.fullTime.home;
  const awayScore = apiMatch.score.fullTime.away;

  const homeScorers = allScorers
    .filter(s => norm(s.team.name) === norm(home))
    .map(s => `${s.player.name} (${s.goals} goals in tournament so far)`);

  const awayScorers = allScorers
    .filter(s => norm(s.team.name) === norm(away))
    .map(s => `${s.player.name} (${s.goals} goals in tournament so far)`);

  const prompt = `You are helping update a World Cup 2026 prediction tracker website.

Match: ${home} vs ${away} on ${match.dateISO}
Final score: ${home} ${homeScore}-${awayScore} ${away}

Tournament scorer data for these teams (cumulative across all their matches so far):
${home}: ${homeScorers.length ? homeScorers.join(', ') : 'no scorers recorded yet'}
${away}: ${awayScorers.length ? awayScorers.join(', ') : 'no scorers recorded yet'}

Task: provide the likely scorers for THIS specific match and write a one-line match note.

If teams have only played one match so far, the cumulative scorer data IS the per-match data.
If teams have played multiple matches, use context to distribute goals across matches as best you can.

Return ONLY valid JSON in this exact shape — no other text:
{
  "scorers": ["Full Player Name", "Full Player Name"],
  "actualNotes": "Brief match note here."
}

RULES for actualNotes:
- NEVER use an em-dash (the character —). Use a comma, colon or semicolon instead.
- British English only
- Maximum 120 characters
- Factual and concise, based on the score and scorer data provided
- Style: "Balogun brace; Reyna late. Pulisic assisted opener." / "Amad Diallo 90 (Singo). Ecuador hit the bar twice."`;

  try {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 300,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = response.content[0].text.trim();
    const jsonMatch = text.match(/\{[\s\S]+\}/);
    if (!jsonMatch) throw new Error(`No JSON in response: ${text}`);

    const parsed = JSON.parse(jsonMatch[0]);

    if (parsed.actualNotes) {
      parsed.actualNotes = parsed.actualNotes.replace(/[—–]/g, ',').trim();
    }

    return parsed;
  } catch (err) {
    console.error(`Claude error for ${match.id}:`, err.message);
    return {
      scorers: [],
      actualNotes: `${home} ${homeScore}-${awayScore} ${away}. Auto-logged.`,
    };
  }
}

// ── CHANGELOG + version bump ──────────────────────────────────────────────────
function bumpVersion(version) {
  const [major, minor, patch] = version.split('.').map(Number);
  return `${major}.${minor}.${patch + 1}`;
}

function prependChangelog(content, version, entries) {
  const today = new Date().toISOString().slice(0, 10);
  const items = entries.map(e => `- ${e}`).join('\n');
  const block = `## [${version}] — ${today}\n\n### Added\n${items}\n\n`;
  return content.replace(/^(## \[)/m, block + '$1');
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log('Fetching finished WC2026 matches from football-data.org...');
  const finishedMatches = await fetchFinishedMatches();
  console.log(`  ${finishedMatches.length} finished matches found`);

  console.log('Fetching tournament scorers...');
  const allScorers = await fetchTournamentScorers();
  console.log(`  ${allScorers.length} scorers found`);

  const content = readFileSync(PREDICTIONS_PATH, 'utf8');
  const pending = parsePendingMatches(content);
  console.log(`  ${pending.length} pending matches in predictions.ts`);

  if (pending.length === 0) {
    console.log('Nothing to update.');
    return;
  }

  let updatedContent = content;
  const changelogEntries = [];

  for (const match of pending) {
    const apiMatch = finishedMatches.find(fm =>
      norm(fm.homeTeam.name) === norm(match.home) &&
      norm(fm.awayTeam.name) === norm(match.away)
    );

    if (!apiMatch) {
      console.log(`  ${match.id}: not finished yet (${match.home} vs ${match.away})`);
      continue;
    }

    const h = apiMatch.score.fullTime.home;
    const a = apiMatch.score.fullTime.away;
    console.log(`  ${match.id}: ${match.home} ${h}-${a} ${match.away} — calling Claude...`);

    const { scorers, actualNotes } = await claudeAnalyse(match, apiMatch, allScorers);

    updatedContent = injectActuals(updatedContent, match.id, {
      actualHome: h,
      actualAway: a,
      scorers,
      actualNotes,
    });

    changelogEntries.push(
      `${match.home} ${h}-${a} ${match.away} result auto-logged (scorers: ${scorers.join(', ') || 'none'})`
    );
  }

  if (changelogEntries.length === 0) {
    console.log('No new results to log.');
    return;
  }

  writeFileSync(PREDICTIONS_PATH, updatedContent, 'utf8');
  console.log(`Wrote ${changelogEntries.length} result(s) to predictions.ts`);

  const pkg = JSON.parse(readFileSync(PACKAGE_PATH, 'utf8'));
  const newVersion = bumpVersion(pkg.version);
  pkg.version = newVersion;
  writeFileSync(PACKAGE_PATH, JSON.stringify(pkg, null, 2) + '\n', 'utf8');

  const changelog = readFileSync(CHANGELOG_PATH, 'utf8');
  writeFileSync(CHANGELOG_PATH, prependChangelog(changelog, newVersion, changelogEntries), 'utf8');

  console.log(`Done — version bumped to ${newVersion}`);
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});

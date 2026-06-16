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

// ── Build scorer strings directly from API goals array ────────────────────────
// Format: "Player Name MM' (Team)" or "Player Name MM' OG (Team)"
function buildScorers(goals) {
  return (goals || []).map(g => {
    const name = g.scorer?.name || 'Unknown';
    const min  = g.injuryTime ? `${g.minute}+${g.injuryTime}'` : `${g.minute}'`;
    const team = apiToLocal(g.team?.name || '');
    if (g.type === 'OWN_GOAL') return `${name} ${min} OG (${team})`;
    return `${name} ${min} (${team})`;
  });
}

// ── Parse pending matches (no actuals yet) ────────────────────────────────────
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

    const dateMatch   = block.match(/dateISO:\s*'([^']+)'/);
    const homeMatch   = block.match(/home:\s*'([^']+)'/);
    const awayMatch   = block.match(/away:\s*'([^']+)'/);
    const scorerMatch = block.match(/scorerCall:\s*'([^']+)'/);

    if (!dateMatch || !homeMatch || !awayMatch) continue;

    pending.push({
      id,
      dateISO:    dateMatch[1],
      home:       homeMatch[1],
      away:       awayMatch[1],
      scorerCall: scorerMatch ? scorerMatch[1] : null,
    });
  }

  return pending;
}

// ── Parse already-logged matches that have empty scorers (backfill pass) ──────
function parseEmptyScorerMatches(content) {
  const matches = [];
  const idPattern = /id:\s*'([^']+)'/g;
  let m;

  while ((m = idPattern.exec(content)) !== null) {
    const id = m[1];
    const rest = content.slice(m.index);
    const endMatch = rest.match(/\n  \},/);
    if (!endMatch) continue;

    const block = rest.slice(0, endMatch.index + endMatch[0].length);

    if (!block.includes('actualHome:')) continue;
    if (block.includes('informalOnly: true')) continue;

    // Only process if scorers is empty array
    if (!block.includes('scorers: [],')) continue;

    const dateMatch  = block.match(/dateISO:\s*'([^']+)'/);
    const homeMatch  = block.match(/home:\s*'([^']+)'/);
    const awayMatch  = block.match(/away:\s*'([^']+)'/);

    if (!dateMatch || !homeMatch || !awayMatch) continue;

    matches.push({
      id,
      dateISO: dateMatch[1],
      home:    homeMatch[1],
      away:    awayMatch[1],
    });
  }

  return matches;
}

// ── Inject actual result fields into a pending match block ───────────────────
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
    const safe = actuals.actualNotes.replace(/'/g, "\\'").replace(/[—–]/g, ',');
    lines.push(`    actualNotes: '${safe}',`);
  }

  return content.slice(0, insertAt) + '\n' + lines.join('\n') + content.slice(insertAt);
}

// ── Replace empty scorers on an already-logged match ─────────────────────────
function patchScorers(content, id, scorers, actualNotes) {
  const idIdx = content.indexOf(`id: '${id}'`);
  if (idIdx === -1) {
    console.warn(`Cannot find match ${id} in predictions.ts`);
    return content;
  }

  const rest = content.slice(idIdx);
  const endMatch = rest.match(/\n  \},/);
  if (!endMatch) return content;

  const blockStart = idIdx;
  const blockEnd   = idIdx + endMatch.index + endMatch[0].length;
  let block = content.slice(blockStart, blockEnd);

  if (scorers.length > 0) {
    const list = scorers.map(s => `'${s.replace(/'/g, "\\'")}'`).join(', ');
    block = block.replace(/scorers: \[\],/, `scorers: [${list}],`);
  }

  if (actualNotes) {
    const safe = actualNotes.replace(/'/g, "\\'").replace(/[—–]/g, ',');
    // Replace the auto-logged placeholder note
    block = block.replace(
      /actualNotes: '[^']*Auto-logged\.',/,
      `actualNotes: '${safe}',`
    );
  }

  return content.slice(0, blockStart) + block + content.slice(blockEnd);
}

// ── football-data.org: finished matches (includes goals array) ────────────────
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

// ── Claude Haiku: write a concise match note from verified goal data ──────────
async function buildActualNotes(match, homeScore, awayScore, scorers) {
  const { home, away } = match;

  if (scorers.length === 0) {
    return `${home} ${homeScore}-${awayScore} ${away}.`;
  }

  const goalsList = scorers.join(', ');

  const prompt = `Write a concise one-line match note for a World Cup 2026 prediction tracker.

Match: ${home} ${homeScore}-${awayScore} ${away}
Goals: ${goalsList}

Rules:
- NEVER use an em-dash (—). Use commas, colons or semicolons instead.
- British English only.
- Maximum 120 characters.
- Factual and concise. Name the key moments.
- Style examples: "Balogun brace; Reyna late. Pulisic assisted opener." / "Amad Diallo 90 (Singo assist). Ecuador hit the bar twice."
- Return ONLY the note string, no quotes, no JSON.`;

  try {
    const response = await client.messages.create({
      model:      'claude-haiku-4-5-20251001',
      max_tokens: 150,
      messages:   [{ role: 'user', content: prompt }],
    });

    const text = response.content[0].text.trim().replace(/[—–]/g, ',');
    return text.length > 0 ? text : `${home} ${homeScore}-${awayScore} ${away}. Goals: ${goalsList}.`;
  } catch (err) {
    console.error(`Haiku error for ${match.id}:`, err.message);
    return `${home} ${homeScore}-${awayScore} ${away}. Goals: ${goalsList}.`;
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
// DISABLED: score/goal fetching from football-data.org is turned off.
// Results and scorers must be entered manually by the maintainer.
// The bot now only handles changelog/version bumps when changelogEntries is non-empty,
// which requires re-enabling Pass 1 or Pass 2 below.
async function main() {
  let content = readFileSync(PREDICTIONS_PATH, 'utf8');
  const changelogEntries = [];

  // ── Pass 1: log new results — DISABLED (maintainer enters results manually) ─
  // const finishedMatches = await fetchFinishedMatches();
  // const pending = parsePendingMatches(content);
  // for (const match of pending) { ... }

  // ── Pass 2: backfill empty scorers — DISABLED ────────────────────────────
  // const emptyScorerMatches = parseEmptyScorerMatches(content);
  // for (const match of emptyScorerMatches) { ... }

  if (changelogEntries.length === 0) {
    console.log('No new results to log (auto-fetch disabled).');
    return;
  }

  writeFileSync(PREDICTIONS_PATH, content, 'utf8');
  console.log(`Wrote ${changelogEntries.length} update(s) to predictions.ts`);

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

#!/usr/bin/env node
/**
 * Validates prediction integrity in src/data/predictions.ts.
 *
 * Exits 1 (error) if:
 *   - Any prediction field (predHome, predAway, predType, scorerCall,
 *     confidence, conditions) was changed on a match that already has
 *     actuals recorded in the last commit.
 *
 * Warns (exit 0) on:
 *   - Duplicate match ids
 *   - Invalid predType values
 *   - Played matches with no scorers array
 *
 * Stats fields (possessionHome, shotsOnTargetHome, shotsOnTargetAway)
 * are intentionally NOT in the frozen list — they're reference data,
 * not predictions.
 */

import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const FILE = 'src/data/predictions.ts';

const FROZEN_FIELDS = ['predHome', 'predAway', 'predType', 'scorerCall', 'confidence', 'conditions'];
const VALID_PRED_TYPES = new Set(['mismatch', 'favourite', 'favourite-tight', 'draw', 'rule-bend']);

const errors = [];
const warnings = [];

// ── Parser ────────────────────────────────────────────────────────────────────

function extractMatchBlocks(src) {
  const arrayStart = src.indexOf('export const matches');
  if (arrayStart === -1) throw new Error('Could not find matches array');

  const eqBracket = src.slice(arrayStart).match(/=\s*\[/);
  if (!eqBracket) throw new Error('Could not find matches array opening bracket');

  let i = arrayStart + eqBracket.index + eqBracket[0].length;
  const blocks = [];
  let depth = 0;
  let objStart = -1;

  while (i < src.length) {
    const ch = src[i];

    if (ch === '/' && src[i + 1] === '/') {
      // Single-line comment — skip to end of line
      while (i < src.length && src[i] !== '\n') i++;
    } else if (ch === '/' && src[i + 1] === '*') {
      // Multi-line comment
      i += 2;
      while (i + 1 < src.length && !(src[i] === '*' && src[i + 1] === '/')) i++;
      i++;
    } else if (ch === '"' || ch === "'") {
      // String literal — skip to matching close quote
      const q = ch;
      i++;
      while (i < src.length && src[i] !== q) {
        if (src[i] === '\\') i++;
        i++;
      }
    } else if (ch === '`') {
      // Template literal (simplified, no nested ${})
      i++;
      while (i < src.length && src[i] !== '`') {
        if (src[i] === '\\') i++;
        i++;
      }
    } else if (ch === '{') {
      if (depth === 0) objStart = i;
      depth++;
    } else if (ch === '}') {
      depth--;
      if (depth === 0 && objStart !== -1) {
        blocks.push(src.slice(objStart, i + 1));
        objStart = -1;
      } else if (depth < 0) {
        break; // Closed the matches array
      }
    }

    i++;
  }

  return blocks;
}

function getField(block, field) {
  // Number (0, negative, decimal — checked first so '0' isn't missed)
  const numM = block.match(new RegExp(`\\b${field}\\s*:\\s*(-?\\d+(?:\\.\\d+)?)`));
  if (numM) return numM[1];

  // Single-quoted string
  const sqM = block.match(new RegExp(`\\b${field}\\s*:\\s*'((?:[^'\\\\]|\\\\.)*)'`));
  if (sqM) return sqM[1];

  // Double-quoted string (multiline)
  const dqM = block.match(new RegExp(`\\b${field}\\s*:\\s*"((?:[^"\\\\]|\\\\.)*)"`, 's'));
  if (dqM) return dqM[1];

  return undefined;
}

function parseMatches(src) {
  return extractMatchBlocks(src).map(block => {
    const m = {};
    for (const f of ['id', 'predHome', 'predAway', 'predType', 'scorerCall', 'confidence', 'conditions', 'actualHome', 'actualAway']) {
      m[f] = getField(block, f);
    }
    m._hasScorers = /\bscorers\s*:\s*\[/.test(block);
    return m;
  });
}

// ── Warnings (run on working-tree matches) ────────────────────────────────────

function runWarnings(matches) {
  const seen = new Set();
  for (const m of matches) {
    if (!m.id) { warnings.push('WARNING: match object with no id'); continue; }

    if (seen.has(m.id)) warnings.push(`WARNING: duplicate match id '${m.id}'`);
    seen.add(m.id);

    if (m.predType && !VALID_PRED_TYPES.has(m.predType)) {
      warnings.push(`WARNING: match '${m.id}' has unknown predType '${m.predType}'`);
    }

    if (m.actualHome !== undefined && !m._hasScorers) {
      warnings.push(`WARNING: played match '${m.id}' has no scorers array`);
    }
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────

// Fast exit: if predictions.ts is unchanged vs HEAD, nothing to check
try {
  const diff = execSync(`git diff HEAD -- ${FILE}`, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
  if (!diff.trim()) process.exit(0);
} catch {
  // git unavailable or no HEAD — fall through
}

let wtSrc, headSrc;

try {
  wtSrc = readFileSync(FILE, 'utf8');
} catch {
  // File unreadable — nothing to validate
  process.exit(0);
}

try {
  headSrc = execSync(`git show HEAD:${FILE}`, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
} catch {
  // No HEAD commit yet — just run warnings
  console.log('validate-predictions: no HEAD commit — running warnings only');
  runWarnings(parseMatches(wtSrc));
  if (warnings.length) warnings.forEach(w => console.warn(w));
  process.exit(0);
}

const wtMatches = parseMatches(wtSrc);
const headMatches = parseMatches(headSrc);

// ── Frozen-field integrity check ──────────────────────────────────────────────

const wtMap = new Map(wtMatches.map(m => [m.id, m]));

for (const hm of headMatches) {
  // Only check matches that are already played in HEAD
  if (hm.actualHome === undefined && hm.actualAway === undefined) continue;

  const wm = wtMap.get(hm.id);
  if (!wm) {
    warnings.push(`WARNING: played match '${hm.id}' is missing from working tree`);
    continue;
  }

  for (const field of FROZEN_FIELDS) {
    if (hm[field] !== wm[field]) {
      errors.push(
        `INTEGRITY VIOLATION: prediction on played match '${hm.id}' was modified — ` +
        `predictions are frozen once a result is recorded. Revert this change.\n` +
        `  field: ${field} | was: '${hm[field]}' | now: '${wm[field]}'`
      );
    }
  }
}

// ── Warnings ──────────────────────────────────────────────────────────────────

runWarnings(wtMatches);

// ── Report ────────────────────────────────────────────────────────────────────

if (warnings.length) warnings.forEach(w => console.warn(w));

if (errors.length) {
  errors.forEach(e => console.error('\n' + e));
  process.exit(1);
}

const playedCount = headMatches.filter(m => m.actualHome !== undefined).length;
console.log(`validate-predictions: OK — ${wtMatches.length} matches, ${playedCount} played, no frozen-field violations`);
process.exit(0);

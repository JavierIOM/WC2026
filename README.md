# WC2026

World Cup 2026 prediction tracker. Built with Astro + Vite + Tailwind CSS v4, deployed on Netlify.

All match data lives in one file: `src/data/predictions.ts`. Verdict badges, tallies, and the accuracy chart are all derived from that data — nothing is hardcoded.

## Daily update workflow

When results come in, open Claude Code in this project and describe the result in plain English:

> "Mark Germany vs Curaçao played: 7–1, scorers Havertz 12, Musiala 23 45, Wirtz 67 78, Gnabry 88, Havertz assist on first"

Claude Code will find the right object and fill in the four fields. Or edit `src/data/predictions.ts` directly.

### The four fields to add

```ts
actualHome: 7,         // home team goals (number)
actualAway: 1,         // away team goals (number)
scorers: [             // array of goalscorer strings, either side
  'Havertz 12',
  'Musiala 23',
  'Musiala 45',
],
assisters: [           // optional — players who assisted (used for scorer verdict)
  'Gnabry',
],
actualNotes: 'Havertz brace, Musiala double. Curaçao never threatened.', // optional
```

Omitting `actualHome` / `actualAway` keeps the match PENDING. Once both are present, verdicts compute automatically:

- **Result verdict** — `EXACT` if scoreline matches, `CORRECT` if outcome matches, `MISS` otherwise
- **Scorer verdict** — `HIT` if named player is in `scorers[]`; `HIT` if `scorerCallType` is `score-or-assist` and player is in `assisters[]`; `ASSIST` if in `assisters[]` only; `MISS` otherwise

After editing, commit and push — Netlify rebuilds on its own.

### Adding a new match

Append one object to the `matches` array. Minimum required fields:

```ts
{
  id: 'esp-cpv',
  matchday: 5,
  dateISO: '2026-06-15',
  kickoffBST: '18:00',
  group: 'K',
  venue: 'SoFi Stadium, Los Angeles',
  home: 'Spain',
  away: 'Cape Verde',
  predHome: 3,
  predAway: 0,
  predType: 'mismatch',           // 'mismatch' | 'favourite-tight' | 'draw' | 'rule-bend'
  scorerCall: 'Yamal',
  scorerCallType: 'score',        // 'score' | 'score-or-assist'
  reasoning: 'Spain dominant...',
}
```

Add `actualHome`, `actualAway`, `scorers`, `assisters`, `actualNotes` when the result is known.

## Getting started

```bash
npm install
npm run dev
```

Build for production:

```bash
npm run build
npm run preview
```

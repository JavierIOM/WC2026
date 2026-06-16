# WC2026 — World Cup 2026 Prediction Website

## Project Overview

A World Cup 2026 prediction website built with Astro, Vite, and Tailwind CSS, hosted on Netlify.

## Tech Stack

- **Framework**: Astro 6.0+
- **Styling**: Tailwind CSS + custom light palette
- **Deployment**: Netlify
- **Node**: 22 (see .nvmrc)

## Design System

- Dark theme default, light theme toggle
- Light palette: page `#FAF7F4`, cards `#FFF`, text `#222`, accent `#F56400`, borders `#D9D9D9`
- No emojis on site
- Create favicons for all pages

## Key Rules

- Always commit and push without asking
- Update CHANGELOG.md before every commit
- Never push `.claude/` to GitHub

## Prediction lifecycle (immutable record)

Each fixture moves through four states:

1. **AWAITING PREDICTION** — no `predHome`/`predAway` (schedule-only entry, displayed as "Prediction closer to kickoff")
2. **PROVISIONAL** — a directional call is in place, may still change before kickoff
3. **LOCKED** — final call once team news is confirmed (~1 day before kickoff)
4. **PLAYED** — `actualHome`/`actualAway` set; all prediction fields frozen permanently

**THE HARD RULE:** Once a match has `actualHome` or `actualAway` set, its prediction fields (`predHome`, `predAway`, `predType`, `scorerCall`, `confidence`, `conditions`) are **frozen** and must never be modified by anyone or any script. The accuracy record depends on predictions being fixed before the result is known. A prediction only counts if it was made before kickoff.

Predictions may be freely revised while a match is pending (no actuals). This is expected — calls firm up 2-3 days before kickoff.

**Policy:** Overwrite-in-place — the file holds only the current prediction. There is no version history for calls in the repo. The narrative of why a call changed lives in an external Craft doc, not here.

**Results rule (reaffirmed):** Results and goal data come only from the maintainer — never fetched from an external source. The auto-update bot (`scripts/update-results.mjs`) has this fetching disabled.

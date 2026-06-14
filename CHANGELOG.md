# Changelog

All notable changes to this project will be documented in this file.

## [0.2.6] — 2026-06-15

### Changed
- About page: added detail on prediction engine (Claude Opus, Max Effort) and note that it previously ran on Claude Fable

## [0.2.5] — 2026-06-15

### Changed
- About page rewritten to accurately attribute predictions to Claude AI and site management to Claude Code

## [0.2.4] — 2026-06-14

### Changed
- Hero title updated to "Fifa World Cup 2026 Prediction Engine"

## [0.2.3] — 2026-06-15

### Added
- 19 new match predictions seeded across MD5 (Jun 15), MD6 (Jun 16), MD7 (Jun 17), MD8 (Jun 18), MD9 (Jun 19)
- Covers Spain, Belgium, Saudi Arabia, Iran, France, Iraq, Argentina, Austria, Portugal, Ghana, Uzbekistan, Switzerland, Canada, Mexico, USA, Scotland, Brazil, Türkiye
- England vs Croatia updated from MD5 to MD7 to reflect correct tournament scheduling

## [0.2.2] — 2026-06-15

### Added
- About page explaining the site, scoring system, prediction types, and AI role
- About link in nav (highlighted in accent blue)
- Nav anchor links updated to work from any page (/#section)

## [0.2.1] — 2026-06-14

### Added
- Germany 7–1 Curaçao result logged (CORRECT, Havertz scorer HIT)
- Netherlands 2–2 Japan result logged (MISS result, Gakpo scorer MISS)

## [0.2.0] — 2026-06-14

### Added
- Full prediction tracker site built on Astro 6 + Tailwind CSS v4
- `src/data/predictions.ts` — single source of truth for all match data; adding a match is one object
- All 13 matches seeded (MD1–MD5), 7 played with actuals, 5 pending
- Auto-computed result verdicts (EXACT / CORRECT / MISS / PENDING) — nothing hardcoded
- Auto-computed scorer verdicts (HIT / ASSIST / MISS / PENDING) with score-or-assist call type
- Hero section: Spain outright call, live accuracy stats, reasoning
- Collapsible method panel with the rule and lessons-learned list
- Match log grouped by matchday with colour-coded verdict badges and left-border accents
- Accuracy dashboard: result record, exact scoreline count, scorer call record
- SVG bar chart showing result accuracy trend by matchday (server-rendered, no client JS)
- Upcoming section listing all pending formal predictions
- Sticky nav with anchor links to all sections
- Dark editorial sports-desk design — Barlow Condensed display font, Inter body
- Favicon (SVG football icon)
- Vite 7 pinned via `overrides` to resolve `@tailwindcss/vite` / Vite 8 incompatibility

## [0.1.0] - 2026-06-14

### Added
- Initial project setup with Astro, Tailwind CSS, and Vite
- Git structure and repository initialized

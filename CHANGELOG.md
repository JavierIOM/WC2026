# Changelog

All notable changes to this project will be documented in this file.

## [0.5.6] — 2026-06-16

### Added
- Saudi Arabia 1-1 Uruguay result auto-logged (scorers: none)

## [0.5.5] — 2026-06-15

### Fixed
- Corrected dateISO for kor-cze (Jun 11 to Jun 12), usa-par (Jun 12 to Jun 13), hai-sco (Jun 13 to Jun 14) — all three kick off after midnight BST
- Corrected kickoffBST for 14 matches cross-referenced against football-data.org API (mex-rsa, kor-cze, can-bih, usa-par, qat-sui, bra-mar, hai-sco, aus-tur, civ-ecu, esp-cpv, irn-nzl, mex-kor, bra-hai, tur-par)

## [0.5.4] — 2026-06-15

### Fixed
- Upcoming calls section now sorted by date then kickoff time — previously the file order meant MD7 matches (June 17) appeared above tonight's Saudi Arabia vs Uruguay (June 15)

## [0.5.3] — 2026-06-15

### Fixed
- Hero banner: escapes side padding (width: calc(100% + 2.5rem), margin-left: -1.25rem) for a full-bleed look
- Hero banner: image centering corrected (object-position: center center, was center top)
- Hero banner: border and border-radius removed so it reads as a banner, not a card
- Hero banner: height increased to clamp(280px, 50vw, 480px) for more visual impact

## [0.5.2] — 2026-06-15

### Added
- `confidence` field (optional 0-100) on Match interface: probability that the result call (H/D/A) is correct
- Confidence backfilled on all 32 matches (mismatches 80, Mexico/USA 70, Korea/Haiti-Sco 65, even-game misses 55, CIV-ECU draw call 40, pending defaults 60)
- Calibration section on dashboard: reliability plot SVG (predicted confidence vs actual hit rate, perfect-calibration diagonal) + summary table

### Changed
- Method panel Rule updated: even game default is now the draw, confidence anchoring noted
- Method panel Lessons replaced with 4 Day-5 recalibration points: outcome calls, opener draw rate, scorer calls, confidence anchoring

## [0.5.1] — 2026-06-15

### Added
- Spain 0-0 Cape Verde: actuals updated with full match notes (27 shots, Vozinha 8 saves, Torres hit bar, Yamal off bench no goal; result MISS, scorer MISS)
- Belgium 1-1 Egypt: actuals logged (Ashour 19, Hany 66 OG; result MISS, scorer MISS)

### Fixed
- Belgium vs Egypt kickoff corrected to 20:00 BST (was 23:00)

## [0.5.0] — 2026-06-15

### Added
- `/archive` page: all played matches older than 1 day, grouped by matchday newest-first, using MatchCard component
- Archive link added to nav between Matches and Dashboard

### Changed
- Homepage match log renamed "Recent results": now shows only played matches from yesterday and today
- Archive count + link shown in the match log header when historical results exist
- Informal match note removed from homepage (Australia-Türkiye now in archive)

## [0.4.9] — 2026-06-15

### Added
- Spain 0-0 Cape Verde result auto-logged (scorers: none)

## [0.4.8] — 2026-06-15

### Changed
- Belgium vs Egypt scorer call switched from Lukaku (benched) to De Bruyne (score-or-assist)

## [0.4.7] — 2026-06-15

### Changed
- ger-cur, ned-jpn, civ-ecu, swe-tun scorer data updated with goal minutes to match verified state
- Germany vs Curaçao notes updated: Havertz scored twice (pen 45+5 + 88')
- Ivory Coast vs Ecuador notes updated: Ecuador hit woodwork 3x, Amad Diallo 90' off the bench
- Sweden vs Tunisia notes updated: confirmed 5-1 scorers with minutes
- Method panel: Rule box updated to remove blanket draw lean; Lessons replaced with 3 post-Day-4 recalibration points (mismatch boldness, draw coin-flip, scorer call strength)

## [0.4.6] — 2026-06-15

### Changed
- Scotland vs Morocco (MD9) revised from draw (1-1) to Morocco 1-0: Morocco are the stronger side and calling the draw was optimism, not analysis. Lesson from CIV-ECU: even games resolve narrow, not flat.

## [0.4.5] — 2026-06-15

### Added
- `scripts/update-results.mjs`: auto-update bot fetches finished results from football-data.org and uses Claude Haiku to populate scorers and match notes in predictions.ts
- `.github/workflows/update-results.yml`: GitHub Actions cron job runs the bot every 3 hours and commits any changes, triggering a Netlify rebuild automatically
- `@anthropic-ai/sdk` added to devDependencies

## [0.4.4] — 2026-06-15

### Added
- Ivory Coast 1-0 Ecuador result logged (MISS result, Scorer HIT: Amad Diallo 90, Singo assist)
- Sweden 5-1 Tunisia result logged (CORRECT result, Scorer HIT: Gyokeres scored)

## [0.4.3] — 2026-06-15

### Added
- Disclaimer page (/disclaimer) with gambling responsibility notice and no-affiliation statement
- Disclaimer link added to nav

## [0.4.2] — 2026-06-15

### Added
- Fifth lesson in Method panel: mismatch margins consistently under-predicted (Germany 7-1, USA 4-1)

## [0.4.1] — 2026-06-15

### Changed
- Threats section in outright reasoning now displayed as bullet points

## [0.4.0] — 2026-06-15

### Changed
- Gold outright tile enlarged: bigger display font, more padding

## [0.3.9] — 2026-06-15

### Changed
- Added "Why?" label to the outright reasoning tile

## [0.3.8] — 2026-06-15

### Changed
- Method panel is now always expanded, collapsible toggle removed

## [0.3.7] — 2026-06-15

### Changed
- Outright final prediction displayed as a gold-bordered tile beneath the hero title

## [0.3.6] — 2026-06-15

### Added
- New `/dashboard` page with accuracy stats and bar chart

### Changed
- Dashboard moved off homepage to its own page; nav "Dashboard" link updated accordingly
- Stat cards use fixed `repeat(3,1fr)` grid for consistent equal width and height alignment
- Bar chart sizing increased (700px viewBox) for better readability
- Dashboard nav link highlights as active when on `/dashboard`

### Fixed
- `applyTheme` TS error: added `string` type annotation to parameter

## [0.3.5] — 2026-06-15

### Fixed
- Removed all em-dashes from rendered content across index.astro, about.astro, MethodPanel.astro, Layout.astro, and all predictions.ts reasoning/notes strings

## [0.3.4] — 2026-06-15

### Added
- Light theme toggle (sun/moon icon in nav) with localStorage persistence; light palette matches project design system
- PNG favicons generated at build time from favicon.svg: 16x16, 32x32, apple-touch-icon 180x180
- `site.webmanifest` for PWA home-screen support
- `robots.txt` in `public/` with explicit `Allow: /`
- `sharp` added to `devDependencies` (was an accidental transitive dependency, build would silently break if npm pruned optionals)

### Changed
- Footer em-dashes replaced with colons ("Claude AI: Opus, Max Effort", "Claude Code: Sonnet 4.6")
- `netlify.toml` env sections corrected from `[env.production]` to `[context.production.environment]` (prior syntax was silently ignored by Netlify)
- Amber informal-match note: background opacity raised from 0.06 to 0.12, border opacity from 0.2 to 0.35 for better visibility
- `MethodPanel.astro` summary: hover background now actually applies (transition was set but no hover state existed)
- `tailwind.config.mjs`: comment added explaining why it is empty (Tailwind v4 config lives in `global.css`)

### Fixed
- Stray `MATCHDAY 5` comment in `predictions.ts` relabelled to `MATCHDAY 7` (wraps eng-cro, gha-pan, uzb-col which are MD7 matches)
- `CHANGELOG.md` v0.2.3 date corrected from 2026-06-15 to 2026-06-14

## [0.3.3] — 2026-06-15

### Fixed
- Restored hero title to "Fifa World Cup 2026 Prediction Engine" (changed by polish agent)

## [0.3.2] — 2026-06-15

### Fixed
- Restored "Home" nav link (removed by polish agent)

## [0.3.1] — 2026-06-15

### Fixed
- Outright reasoning box now full width, matching the rest of the page

### Changed
- Hero banner self-hosted in public/hero.png — no longer hotlinked from third-party CloudFront URL

## [0.3.0] — 2026-06-15

### Added
- Open Graph share image (`public/og.png`) generated from `scripts/generate-og.mjs`, on-brand with the dark editorial design; regenerated automatically on every build
- Twitter/X card meta tags (`summary_large_image`) and `og:site_name`, `og:image:alt`
- Per-page canonical and `og:url` (resolves correctly on `/about`, not just the homepage)
- Visible keyboard focus rings on links and `<details>` summaries
- `prefers-reduced-motion` support (disables smooth scroll and animations)
- Brand wordmark now links to home; nav marks the active page with `aria-current`

### Changed
- Corrected live domain from `wc2026.rockyroo.fish` to `wc26.rockyroo.fish` in the layout meta and `astro.config.mjs` (OG/canonical URLs previously pointed at a dead host)
- Hero headline reworked from "Fifa World Cup 2026 Prediction Engine" to "World Cup 2026, Called." (correct casing, sharper voice)
- Section headings promoted to real `<h2>`/`<h3>` for a proper heading hierarchy and landmark structure
- Upcoming calls rebuilt as a semantic `<ul>`/`<li>` list
- Stat-card grid made responsive (auto-fit) so it no longer cramps on mobile
- Nav restructured: removed redundant "Home" link, header grows instead of clipping on narrow screens
- Hero banner image given explicit dimensions, `fetchpriority="high"` and `decoding="async"` (reduces CLS, improves LCP)

### Fixed
- Prediction-type badges now render their border (was set via `border-color` with no `border-style`, so the outline never appeared)
- Removed stale note claiming Spain vs Cape Verde and France vs Senegal were "to be added" — both are already in the data and listed under Upcoming
- Stopped tracking the local `temporary screenshots/` folder; added it to `.gitignore`

## [0.2.9] — 2026-06-15

### Changed
- Nav label "Outright" renamed to "Home"

## [0.2.8] — 2026-06-15

### Added
- Footer on all pages: project credit (Javier, Isle of Man), prediction engine (Claude AI — Opus Max Effort), site builder (Claude Code — Sonnet 4.6), and build timestamp

## [0.2.7] — 2026-06-15

### Changed
- Swapped EXACT/CORRECT badge colours: EXACT is now green, CORRECT is amber

## [0.2.6] — 2026-06-15

### Changed
- About page: added detail on prediction engine (Claude Opus, Max Effort) and note that it previously ran on Claude Fable

## [0.2.5] — 2026-06-15

### Changed
- About page rewritten to accurately attribute predictions to Claude AI and site management to Claude Code

## [0.2.4] — 2026-06-14

### Changed
- Hero title updated to "Fifa World Cup 2026 Prediction Engine"

## [0.2.3] — 2026-06-14

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

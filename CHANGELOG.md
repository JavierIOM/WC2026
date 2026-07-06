# Changelog

All notable changes to this project will be documented in this file.

## [0.9.0] — 2026-07-06

### Added
- R16 fixture: belgium-usa (2026-07-07 01:00 BST, Lumen Field Seattle) — PENDING with Tillman scorer call, confidence 53.

### Changed
- Full Reconciliation #2: actuals added to 4 R32 fixtures (mexico-ecuador 2-0, england-dr-congo 2-1, belgium-senegal 3-2 AET, usa-bosnia 2-0).
- 96 total matches, 76 played. Validator: 0 integrity violations.

## [0.8.9] — 2026-06-28

### Fixed
- Ticker fallback: increased slice limit from 12 to 16 so all R32 fixtures show in the scroll.
- Ticker teamNameMap: added 'Bosnia' entry so ESPN live path handles both 'Bosnia' and 'Bosnia and Herzegovina'.

## [0.8.8] — 2026-06-28

### Added
- Group stage archive: `/archive` now shows all 65 formal group stage results grouped by Group A-L with a group-stage-specific tally panel. Replaces the old "matchday N" view.
- `isArchived(m)` export in predictions.ts: returns true for any played match with matchday <= 3 (all group stage). The `archived?: boolean` field is available for manual overrides.
- `archived?: boolean` field added to Match interface.

### Changed
- Homepage "Recent results" and "Upcoming" now exclude group stage archived matches — main page shows R32 fixtures only going forward.
- "No recent results" empty state now links to group stage archive with match count.
- Archive link in Recent results header updated to "Group stage archive (N) >" text.
- TypeScript fixes in homepage script block: all `querySelector` calls inside `applyLiveCard` now use `querySelector<HTMLElement>` for correct type inference.

### Fixed
- All 25 Step 2 group stage matches verified to have actuals — no gaps found.
- All 16 R32 fixtures confirmed present with predictions, scorer calls, and conditions set.
- Validation hook: 88 matches, 72 played, 0 integrity violations.

## [0.8.7] — 2026-06-28

### Added
- Round of 32: 16 new match objects in predictions.ts (canada-south-africa through colombia-ghana, 2026-06-28 to 2026-07-04). All predictions and scorer calls set, no actuals.
- `round` field added to Match interface for knockout round identification (e.g. 'R32', 'QF', 'SF', 'F').
- `group` field made optional in Match interface (knockout matches have no group).
- Upcoming section on homepage now groups by round with a "Round of 32" heading separator.
- Archive page label logic updated: round-based matches show "Round of 32" etc. instead of "Matchday 4".
- MatchCard badge: shows round badge (e.g. "R32") when no group is set, group badge otherwise.

### Fixed
- TypeScript errors in homepage script block: `liveCards` and `forEach` callbacks now use `Array.from()` for proper type inference; `applyLiveCard` parameter explicitly typed as `Element`.

## [0.8.6] — 2026-06-25

### Changed
- "Live / Awaiting result" section moved to the top of page content (above Recent results and Upcoming) — now the first thing visible when matches are in progress
- Section stays hidden when empty so no blank gap appears
- Live cards now show: pulsing red dot to left of home team name, red left border, "● LIVE" badge (replacing PENDING), accessible prefers-reduced-motion: steady dot

## [0.8.5] — 2026-06-25

### Added
- Prediction-due visibility flags: unpredicted matches within 72h of kickoff now show an amber "PREDICTION DUE" badge; past-kickoff unpredicted matches in Live/Awaiting show a red "NO CALL LOGGED" badge. Default "Prediction closer to kickoff" placeholder remains for matches further out.
- Predictions-due counter above Upcoming list — shows count of imminent unpredicted games at a glance.

## [0.8.4] — 2026-06-25

### Fixed
- Bug: Recent results section showed "Matchday 2: Fri 12 Jun" for all MD2 games — now groups by calendar date (dateISO) so each date gets its own header
- Bug: Upcoming/Live bucketing was computed at SSR build time (new Date() was frozen at deploy) — replaced with client-side JS that reads kickoff UTC from data attributes and buckets on page load
- Bug: Switzerland-Canada, Bosnia-Qatar, Morocco-Haiti, Scotland-Brazil had no prediction fields — predictions added (Embolo, Dzeko, En-Nesyri, Vinicius Jr)

## [0.8.3] — 2026-06-24

### Fixed
- MD13 results logged: England–Ghana 0-0 (possession-trap MISS), Portugal–Uzbekistan 5-0 CORRECT (Ronaldo brace + OG), Panama–Croatia 0-1 (Budimir), Colombia–DR Congo 1-0 EXACT (Muñoz). 43 played, 29/45 correct, 16 hits / 4 assists / 23 misses.

## [0.8.2] — 2026-06-23

### Fixed
- MD12 results logged: Argentina–Austria 2-0 (Messi brace, informal-only), France–Iraq 3-0 EXACT (Mbappé brace + Dembélé), Norway–Senegal 3-2 (Haaland brace), Jordan–Algeria 1-2 EXACT (Gouiri)

## [0.8.1] — 2026-06-19

### Fixed
- USA vs Paraguay (MD8): corrected reasoning to reflect Balogun as the primary creative threat (was Pulisic)

## [0.8.0] — 2026-06-17

### Added
- Live match ticker on dashboard: Netlify function polls ESPN public API every 30s, shows live scores, clock, and venue for in-progress matches
- Match stats fields on interface: `possessionHome`, `shotsOnTargetHome`, `shotsOnTargetAway` (reference data, not predictions — excluded from frozen-field guard)
- Stats backfilled for MD6/MD7: England-Croatia (51.7% poss, 10 SoT), Austria-Jordan (63.2% poss, 2 SoT away), Portugal-DR Congo (75.4% poss, 0 SoT home)
- `scripts/validate-predictions.mjs`: parses HEAD vs working tree and fails with INTEGRITY VIOLATION if any frozen prediction field is modified on a played match; warns on duplicate ids, invalid predType, played match missing scorers
- PostToolUse hook in `.claude/settings.json` runs the validator after every Edit/Write

### Changed
- MatchCard now displays possession % and shots-on-target subtly on played cards when available

## [0.7.2] — 2026-06-17

### Added
- MD6 results: Iraq 1-4 Norway (Haaland brace, result CORRECT, scorer HIT), Argentina 3-0 Algeria (Messi hat-trick, result CORRECT, scorer MISS), Austria 3-1 Jordan (result CORRECT, scorer MISS)
- France-Senegal scorers updated to timestamped format; actualNotes revised (result MISS, scorer HIT)

## [0.7.1] — 2026-06-16

### Added
- Prediction lifecycle policy documented in CLAUDE.md (AWAITING → PROVISIONAL → LOCKED → PLAYED; prediction fields frozen on PLAYED)
- `assertPredictionMutable(id, block)` guard in scripts/update-results.mjs — throws if a match already has actuals recorded; must be called before any automated prediction-field write

## [0.7.0] — 2026-06-16

### Added
- Full group stage schedule bulk-loaded: 32 new fixtures (Groups I-L Round 2, all Round 3, Jun 22-28) as schedule-only entries
- Prediction horizon behaviour: match cards now have three states — PLAYED, PREDICTED, and AWAITING PREDICTION
- "Prediction closer to kickoff" label shown where scoreline would appear on schedule-only cards
- Explanatory caption under Upcoming calls heading

### Changed
- Match interface: predHome, predAway, predType, reasoning now optional — absence signals schedule-only fixture
- MatchCard: predType badge and reasoning section hidden when undefined; score area handles awaiting-prediction state
- NZL-EGY fixture cleared to schedule-only (prediction pending)
- predTypeLabel updated to handle undefined predType safely
- getResultVerdict guards against missing prediction (returns PENDING)

## [0.6.3] — 2026-06-16

### Added
- Real predictions for 7 MD2 placeholder fixtures (Groups E-H, 20-21 June): venues, scorelines, scorer calls, pred types, conditions, reasoning
- New fixture: New Zealand vs Egypt (Group G, BC Place Vancouver, 02:00 BST Mon 22 June) — prediction pending
- New predType 'favourite' (confident win, not mismatch) with sky-blue badge, wired into MatchCard, global.css, about page, and type system

### Changed
- Auto-update bot: score/goal fetching from football-data.org disabled — results now entered manually by maintainer only

### Removed
- scripts/generate-append.cjs and vs.md (one-off import artefacts)

## [0.6.2] — 2026-06-16

### Added
- France 3-1 Senegal: Mbappé 66, 90+6; Barcola 82 (MISS result, HIT scorer)

## [0.6.1] — 2026-06-16

### Changed
- Upcoming calls section now uses full match cards (with pred type badge, scorer call, and collapsible reasoning) instead of compact list rows

## [0.5.9] — 2026-06-16

### Added
- Saudi Arabia 1-1 Uruguay scorers backfilled: Al-Amri 41, Maxi Araújo (both MISS)
- Iran 2-2 New Zealand scorers backfilled: Just 7, 54 (NZ); Rezaeian 33, Mohebbi 64 (Iran) (both MISS)

### Changed
- ksa-uru and irn-nzl confidence updated to 55 (were 60; both drew)
- France vs Senegal: prediction revised to 1-1 draw (was 1-0), predType draw, confidence 44
- Iraq vs Norway: prediction revised to 0-1 (was 0-2), predType favourite-tight, confidence 56
- Argentina vs Algeria: confidence 60 to 64, reasoning sharpened
- Austria vs Jordan: prediction revised to 1-0 (was 2-0), reasoning tightened

## [0.6.0] — 2026-06-16

### Changed
- Footer now shows version number (e.g. v0.6.0) on all pages

## [0.5.8] — 2026-06-16

### Fixed
- Auto-update bot: scorers now built directly from per-match `goals` array in football-data.org API response rather than guessing from cumulative tournament totals
- Bot: added backfill pass for already-logged matches with empty `scorers: []`
- Bot: Haiku now only writes `actualNotes` prose from real goal data; scorer inference removed

## [0.5.7] — 2026-06-16

### Added
- Iran 2-2 New Zealand result auto-logged (scorers: none)

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

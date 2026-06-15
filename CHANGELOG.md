# Changelog

All notable changes to this project will be documented in this file.

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

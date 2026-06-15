// Generates public/og.png (1200x630) for social sharing.
// Design intentionally mirrors the site's own brand — dark navy editorial
// sports-desk aesthetic, Barlow Condensed display, accent #4f8ef7 — rather
// than a generic OG template, so the share card reads as part of the site.

import sharp from 'sharp';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outPath = resolve(__dirname, '../public/og.png');

// Verdict swatch row echoes the EXACT / CORRECT / MISS badge language.
const swatches = [
  { c: '#22c55e', label: 'EXACT' },
  { c: '#f59e0b', label: 'CORRECT' },
  { c: '#ef4444', label: 'MISS' },
];

const swatchRow = swatches
  .map((s, i) => {
    const x = 80 + i * 190;
    return `
      <rect x="${x}" y="486" width="14" height="14" rx="3" fill="${s.c}" />
      <text x="${x + 26}" y="498" font-family="'Barlow Condensed','Arial Narrow',sans-serif"
            font-size="26" font-weight="700" letter-spacing="2" fill="#6868a0">${s.label}</text>`;
  })
  .join('');

const svg = `
<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#05050f" />
      <stop offset="1" stop-color="#0d0d1a" />
    </linearGradient>
    <linearGradient id="glow" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#4f8ef7" stop-opacity="0.16" />
      <stop offset="1" stop-color="#4f8ef7" stop-opacity="0" />
    </linearGradient>
  </defs>

  <rect width="1200" height="630" fill="url(#bg)" />
  <rect width="1200" height="320" fill="url(#glow)" />

  <!-- Accent edge -->
  <rect x="0" y="0" width="8" height="630" fill="#4f8ef7" />

  <!-- Hairline frame -->
  <rect x="40" y="40" width="1120" height="550" rx="14" fill="none" stroke="#1e1e38" stroke-width="1" />

  <!-- Eyebrow -->
  <text x="80" y="150" font-family="'Barlow Condensed','Arial Narrow',sans-serif"
        font-size="30" font-weight="600" letter-spacing="8" fill="#4f8ef7">PREDICTION TRACKER</text>

  <!-- Wordmark -->
  <text x="78" y="300" font-family="'Barlow Condensed','Arial Narrow',sans-serif"
        font-size="170" font-weight="800" letter-spacing="2" fill="#dddde8">WORLD CUP</text>
  <text x="80" y="430" font-family="'Barlow Condensed','Arial Narrow',sans-serif"
        font-size="150" font-weight="800" letter-spacing="2" fill="#dddde8">2026<tspan fill="#4f8ef7">.</tspan></text>

  <!-- Verdict legend -->
  ${swatchRow}

  <!-- Strapline -->
  <text x="80" y="560" font-family="'Inter',system-ui,sans-serif"
        font-size="26" font-weight="500" fill="#6868a0">AI scoreline calls vs actual results — scored honestly, computed live</text>

  <!-- Domain -->
  <text x="1120" y="560" text-anchor="end" font-family="'Inter',system-ui,sans-serif"
        font-size="24" font-weight="600" fill="#475569">wc26.rockyroo.fish</text>
</svg>`;

await sharp(Buffer.from(svg)).png().toFile(outPath);
console.log('Generated', outPath);

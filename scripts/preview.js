#!/usr/bin/env node
/**
 * Render a PNG preview of dist/template-filled.html via puppeteer.
 *   node scripts/preview.js [--width 600] [--out dist/preview.png]
 *
 * Defaults: writes desktop (600x...) AND mobile (390x...) PNGs to dist/.
 * Requires `puppeteer` (install via `npm install puppeteer --no-save`).
 */

const fs = require('fs');
const path = require('path');

let puppeteer;
try {
  puppeteer = require('puppeteer');
} catch {
  console.error(
    '✗ puppeteer is not installed.\n' +
    '  Install it with: npm install puppeteer --no-save'
  );
  process.exit(1);
}

const ROOT = path.resolve(__dirname, '..');
const SOURCE = path.join(ROOT, 'dist', 'template-filled.html');
if (!fs.existsSync(SOURCE)) {
  console.error(
    `✗ ${path.relative(ROOT, SOURCE)} does not exist.\n` +
    '  Run: node build.js --data <your-data>.json first.'
  );
  process.exit(1);
}

const args = process.argv.slice(2);
function arg(flag, fallback) {
  const i = args.indexOf(flag);
  return i !== -1 ? args[i + 1] : fallback;
}

(async () => {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    headless: 'new',
  });
  try {
    const page = await browser.newPage();

    // ---- Desktop (600px) ----
    const desktopOut = arg('--out-desktop', path.join(ROOT, 'dist', 'preview-desktop.png'));
    await page.setViewport({ width: 640, height: 800, deviceScaleFactor: 2 });
    await page.goto('file://' + SOURCE, { waitUntil: 'networkidle0', timeout: 30000 });
    await page.screenshot({ path: desktopOut, fullPage: true });
    console.log('✓ Desktop preview → ' + path.relative(ROOT, desktopOut));

    // ---- Mobile (390px) ----
    const mobileOut = arg('--out-mobile', path.join(ROOT, 'dist', 'preview-mobile.png'));
    await page.setViewport({ width: 390, height: 800, deviceScaleFactor: 2 });
    await page.reload({ waitUntil: 'networkidle0', timeout: 30000 });
    await page.screenshot({ path: mobileOut, fullPage: true });
    console.log('✓ Mobile preview  → ' + path.relative(ROOT, mobileOut));
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error('✗ Preview failed:', e.message);
  process.exit(1);
});

// usage: node shoot.cjs <route> <out.png> <width> <dark 0|1> <full 0|1> [maqraa]
const { chromium } = require('playwright');
const [,, route, out, w = '1440', dark = '0', full = '0', maqraa = 'default'] = process.argv;
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const p = await b.newPage({ viewport: { width: +w, height: +w < 500 ? 800 : 900 } });
  await p.addInitScript(([d, m]) => {
    try { localStorage.setItem('theme', d === '1' ? 'dark' : 'light'); localStorage.setItem('maqraa_theme', m); } catch {}
  }, [dark, maqraa]);
  await p.goto('http://127.0.0.1:5199/Maqraa/#' + route, { waitUntil: 'networkidle' });
  await p.waitForTimeout(8500); // cinema intro
  if (full === '1') {
    const h = await p.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y < h; y += 300) { await p.evaluate((yy) => window.scrollTo(0, yy), y); await p.waitForTimeout(350); }
    await p.evaluate(() => window.scrollTo(0, 0)); await p.waitForTimeout(500);
  }
  const overflow = await p.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  if (overflow > 0) console.log('HORIZONTAL OVERFLOW', overflow, 'px on', route, w);
  if (full === '1') {
    // tall viewport instead of stitching: sticky/fixed elements stay where a visitor would see them
    const h = await p.evaluate(() => document.documentElement.scrollHeight);
    await p.setViewportSize({ width: +w, height: Math.min(h, 12000) });
    await p.waitForTimeout(400);
  }
  await p.screenshot({ path: out });
  await b.close();
})();

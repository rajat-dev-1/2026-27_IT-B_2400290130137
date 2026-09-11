import puppeteer from 'puppeteer-core';
import path from 'path';

const outDir = 'C:\\Users\\kumar\\.gemini\\antigravity-ide\\brain\\e862f96e-fea7-4686-a0f6-19e5aec0659b';
const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

async function main() {
  console.log('Launching Edge to capture hero animation motion...');
  const browser = await puppeteer.launch({
    executablePath: edgePath,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  // 1. Initial desktop capture (~0.8s)
  console.log('Navigating to local site...');
  await page.goto('http://localhost:5173', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: path.join(outDir, 'hero_motion_t0.png') });
  await page.screenshot({ path: path.join(outDir, 'hero_1440px_desktop.png') });
  console.log('Saved hero_motion_t0.png (initial combustion at ~5:00)');

  // 2. Desktop capture after circulation (~2.5s)
  await new Promise(r => setTimeout(r, 2200));
  await page.screenshot({ path: path.join(outDir, 'hero_motion_t1.png') });
  console.log('Saved hero_motion_t1.png (combustion circulating along ring)');

  // 3. Desktop capture at 1280px
  await page.setViewport({ width: 1280, height: 800 });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(outDir, 'hero_1280px_desktop.png') });

  // 4. Tablet capture at 834px
  await page.setViewport({ width: 834, height: 1112 });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(outDir, 'hero_tablet.png') });

  // 5. Mobile capture at 390px
  await page.setViewport({ width: 390, height: 844 });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(outDir, 'hero_mobile.png') });

  await browser.close();
  console.log('All hero motion captures completed successfully!');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});

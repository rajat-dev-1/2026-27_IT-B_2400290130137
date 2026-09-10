import puppeteer from 'puppeteer-core';
import path from 'path';

const outDir = 'C:\\Users\\kumar\\.gemini\\antigravity-ide\\brain\\e862f96e-fea7-4686-a0f6-19e5aec0659b';
const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

const viewports = [
  { name: 'hero_1440px_desktop.png', width: 1440, height: 900 },
  { name: 'hero_1280px_desktop.png', width: 1280, height: 800 },
  { name: 'hero_tablet.png', width: 834, height: 1112 },
  { name: 'hero_mobile.png', width: 390, height: 844 },
];

async function capture() {
  console.log('Launching browser with edgePath:', edgePath);
  const browser = await puppeteer.launch({
    executablePath: edgePath,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
  });

  const page = await browser.newPage();

  for (const vp of viewports) {
    console.log(`Setting viewport ${vp.width}x${vp.height} for ${vp.name}...`);
    await page.setViewport({ width: vp.width, height: vp.height });
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle2' });
    // Wait 3.5 seconds for animation to initialize and rotate slightly
    await new Promise(r => setTimeout(r, 3500));

    const outPath = path.join(outDir, vp.name);
    await page.screenshot({ path: outPath, fullPage: false });
    console.log(`Saved screenshot to ${outPath}`);
  }

  await browser.close();
  console.log('All screenshots captured successfully!');
}

capture().catch(err => {
  console.error('Capture failed:', err);
  process.exit(1);
});

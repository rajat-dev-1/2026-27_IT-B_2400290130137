import puppeteer from 'puppeteer-core';
import path from 'path';

const outDir = 'C:\\Users\\kumar\\.gemini\\antigravity-ide\\brain\\1902f8a9-37af-4199-94fc-38b0cbb0625a';
const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

async function main() {
  const browser = await puppeteer.launch({
    executablePath: edgePath,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1200));

  await page.evaluate(() => window.scrollTo(0, 0));
  await new Promise(r => setTimeout(r, 600));

  const dest = path.join(outDir, 'real_hero_section.png');
  await page.screenshot({ path: dest });
  console.log('Saved hero to', dest);

  await browser.close();
}
main().catch(console.error);

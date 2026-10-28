import puppeteer from 'puppeteer-core';
import path from 'path';

const outDir = 'C:\\Users\\kumar\\.gemini\\antigravity-ide\\brain\\1902f8a9-37af-4199-94fc-38b0cbb0625a';
const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

async function main() {
  console.log('Capturing PrioritizationTransform section...');
  const browser = await puppeteer.launch({
    executablePath: edgePath,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 1000, deviceScaleFactor: 2 });

  await page.goto('http://localhost:5173/#differentiator', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1200));

  await page.evaluate(() => {
    const el = document.getElementById('differentiator');
    if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
  });
  await new Promise(r => setTimeout(r, 800));

  const sectionEl = await page.$('#differentiator');
  const dest = path.join(outDir, 'redesigned_prioritization_section.png');
  if (sectionEl) {
    await sectionEl.screenshot({ path: dest });
    console.log('Saved to', dest);
  } else {
    await page.screenshot({ path: dest });
  }

  await browser.close();
  console.log('Done!');
}

main().catch(console.error);

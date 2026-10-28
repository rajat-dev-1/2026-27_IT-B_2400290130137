import puppeteer from 'puppeteer-core';
import path from 'path';

const outDir = 'C:\\Users\\kumar\\.gemini\\antigravity-ide\\brain\\1902f8a9-37af-4199-94fc-38b0cbb0625a';
const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

async function main() {
  console.log('Launching browser to capture redesigned UI...');
  const browser = await puppeteer.launch({
    executablePath: edgePath,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 960, deviceScaleFactor: 2 });

  console.log('Navigating to http://localhost:5173/#analysis...');
  await page.goto('http://localhost:5173/#analysis', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1200));

  // Scroll to #analysis
  await page.evaluate(() => {
    const el = document.getElementById('analysis');
    if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
  });
  await new Promise(r => setTimeout(r, 800));

  // Take screenshot of Tab 1 (Complexity)
  const tab1Path = path.join(outDir, 'redesigned_tab1_complexity.png');
  const sectionEl = await page.$('#analysis');
  if (sectionEl) {
    await sectionEl.screenshot({ path: tab1Path });
    console.log('Saved tab 1 to', tab1Path);
  } else {
    await page.screenshot({ path: tab1Path });
  }

  // Click Tab 2 (Duplicate-Code Detection)
  const buttons = await page.$$('#analysis button');
  console.log('Found buttons:', buttons.length);
  if (buttons.length >= 6) {
    // Click button 1 (Duplicate)
    await buttons[1].click();
    await new Promise(r => setTimeout(r, 600));
    const tab2Path = path.join(outDir, 'redesigned_tab2_duplicate.png');
    const sEl = await page.$('#analysis');
    if (sEl) await sEl.screenshot({ path: tab2Path });
    console.log('Saved tab 2 to', tab2Path);

    // Click button 4 (Explainable Health Score)
    await buttons[4].click();
    await new Promise(r => setTimeout(r, 600));
    const tab5Path = path.join(outDir, 'redesigned_tab5_score.png');
    if (sEl) await sEl.screenshot({ path: tab5Path });
    console.log('Saved tab 5 to', tab5Path);

    // Click button 5 (Prioritized Recommendations)
    await buttons[5].click();
    await new Promise(r => setTimeout(r, 600));
    const tab6Path = path.join(outDir, 'redesigned_tab6_recs.png');
    if (sEl) await sEl.screenshot({ path: tab6Path });
    console.log('Saved tab 6 to', tab6Path);
  }

  await browser.close();
  console.log('Done capturing screenshots!');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});

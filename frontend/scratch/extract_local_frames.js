import puppeteer from 'puppeteer-core';
import path from 'path';

const outDir = 'C:\\Users\\kumar\\.gemini\\antigravity-ide\\brain\\e862f96e-fea7-4686-a0f6-19e5aec0659b';
const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

async function main() {
  console.log('Launching Edge...');
  const browser = await puppeteer.launch({
    executablePath: edgePath,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 1080 });

  console.log('Navigating to local video...');
  await page.goto('http://localhost:5173/ref_video.mp4', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 1000));

  const times = [2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0, 5.5];
  for (const t of times) {
    await page.evaluate((targetTime) => {
      const v = document.querySelector('video');
      if (v) {
        v.pause();
        v.currentTime = targetTime;
      }
    }, t);
    await new Promise(r => setTimeout(r, 600));

    const name = `exact_video_${t.toFixed(1).replace('.', '_')}s.png`;
    const dest = path.join(outDir, name);
    await page.screenshot({ path: dest });
    console.log(`Captured ${name}`);
  }

  await browser.close();
  console.log('Finished capturing all video frames!');
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});

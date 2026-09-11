import puppeteer from 'puppeteer-core';
import path from 'path';

const outDir = 'C:\\Users\\kumar\\.gemini\\antigravity-ide\\brain\\e862f96e-fea7-4686-a0f6-19e5aec0659b';
const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const videoUrl = 'https://cdn.collectui.com/amplify_video/2094429816816562176/vid/avc1/1440x1080/XW-P0oNGs3ubVaQK-optimized.mp4';

async function main() {
  const browser = await puppeteer.launch({
    executablePath: edgePath,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 1080 });

  const html = `
    <!DOCTYPE html>
    <html>
      <body style="margin:0; background:#000; display:flex; justify-content:center; align-items:center;">
        <video id="vid" src="${videoUrl}" style="width:1440px; height:1080px;" crossOrigin="anonymous"></video>
      </body>
    </html>
  `;
  await page.setContent(html);

  await page.evaluate(() => {
    return new Promise((resolve) => {
      const vid = document.getElementById('vid');
      vid.onloadeddata = () => resolve();
      vid.load();
    });
  });

  const timestamps = [1.0, 2.0, 2.5, 3.0, 3.5, 4.0, 5.0, 6.0, 7.0];
  for (const t of timestamps) {
    await page.evaluate((time) => {
      return new Promise((resolve) => {
        const vid = document.getElementById('vid');
        vid.currentTime = time;
        vid.onseeked = () => resolve();
      });
    }, t);

    const outPath = path.join(outDir, `motion_frame_${t.toString().replace('.', '_')}s.png`);
    await page.screenshot({ path: outPath });
    console.log(`Saved motion frame at ${t}s to ${outPath}`);
  }

  await browser.close();
  console.log('Finished capturing video frames!');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});

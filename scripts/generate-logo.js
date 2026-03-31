const puppeteer = require('puppeteer');
const path = require('path');

async function main() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 400, height: 80, deviceScaleFactor: 3 });
  await page.setContent(`
    <!DOCTYPE html>
    <html>
    <head>
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link href="https://fonts.googleapis.com/css2?family=Syne:wght@800&display=swap" rel="stylesheet">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { background: transparent; display: flex; align-items: center; padding: 10px 0; }
        .logo { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 48px; letter-spacing: -0.02em; color: white; }
        .logo span { color: #FF4D00; }
      </style>
    </head>
    <body>
      <div class="logo">Thumbs<span>Latam</span></div>
    </body>
    </html>
  `);
  await new Promise(r => setTimeout(r, 2000));
  const element = await page.$('.logo');
  await element.screenshot({
    path: path.join(__dirname, '../public/logo.png'),
    omitBackground: true,
  });
  await browser.close();
  console.log('Logo generado en public/logo.png');
}

main().catch(console.error);

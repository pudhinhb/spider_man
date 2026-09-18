const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900 });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1200));

  const book = await page.$('.sb-book-container');
  const box = await book.boundingBox();

  // Drag front cover from bottom right towards center
  const startX = box.x + box.width * 0.72;
  const startY = box.y + box.height * 0.85;
  await page.mouse.move(startX, startY);
  await page.mouse.down();
  await page.mouse.move(startX - 180, startY - 90, { steps: 10 });
  await new Promise(r => setTimeout(r, 400));

  await page.screenshot({
    path: 'C:/Users/Admin/.gemini/antigravity-ide/brain/c47dfbdb-dda1-4788-9f25-0687b26f5247/verified_frontcover_open_drag.png'
  });
  await page.mouse.up();
  await browser.close();
  console.log('Front cover open drag tested and saved');
})();

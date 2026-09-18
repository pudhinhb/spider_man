const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const PORT = 3866;
const brochureDir = path.resolve(__dirname, '..', 'public', 'brochure');
const outDir = path.resolve(__dirname, '..', 'public', 'sketchbook');

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  
  if (url.pathname === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Pure A4 Spreads Generator</title>
      </head>
      <body>
        <div id="status">Generating Pure A4 Spreads...</div>
        <canvas id="cv" style="display:none;"></canvas>

        <script>
          const cv = document.getElementById('cv');
          const ctx = cv.getContext('2d');

          function loadImage(src) {
            return new Promise((resolve, reject) => {
              const img = new Image();
              img.onload = () => resolve(img);
              img.onerror = reject;
              img.src = src;
            });
          }

          function drawRoundedRect(ctx, x, y, w, h, r) {
            ctx.beginPath();
            ctx.moveTo(x + r.tl, y);
            ctx.lineTo(x + w - r.tr, y);
            ctx.quadraticCurveTo(x + w, y, x + w, y + r.tr);
            ctx.lineTo(x + w, y + h - r.br);
            ctx.quadraticCurveTo(x + w, y + h, x + w - r.br, y + h);
            ctx.lineTo(x + r.bl, y + h);
            ctx.quadraticCurveTo(x, y + h, x, y + h - r.bl);
            ctx.lineTo(x, y + r.tl);
            ctx.quadraticCurveTo(x, y, x + r.tl, y);
            ctx.closePath();
          }

          async function generate() {
            const status = document.getElementById('status');
            status.innerText = 'Loading PDF pages...';

            const p1 = await loadImage('/brochure/page-1.png');
            const p2 = await loadImage('/brochure/page-2.png');
            const p3 = await loadImage('/brochure/page-3.png');
            const p4 = await loadImage('/brochure/page-4.png');
            const p5 = await loadImage('/brochure/page-5.png');
            const p6 = await loadImage('/brochure/page-6.png');

            // Exact Dual A4 dimensions:
            // Single page: 1400 x 1982
            // Two pages: 2800 x 1982
            const PW = 1400;
            const PH = 1982;
            const SW = PW * 2; // 2800
            const SH = PH;      // 1982

            cv.width = SW;
            cv.height = SH;

            // -------------------------------------------------------------
            // SPREAD 0: Front Cover (Right half has Page 1)
            // -------------------------------------------------------------
            status.innerText = 'Generating Spread 0 (Cover)...';
            ctx.clearRect(0, 0, SW, SH);

            // Right half: Page 1 with right page stack
            const rStack = 12;
            for (let s = 3; s >= 1; s--) {
              ctx.fillStyle = s % 2 === 0 ? '#ebe7dc' : '#f5f2ea';
              drawRoundedRect(ctx, PW + s * 3.5, s * 1.5, PW - rStack, SH - s * 3, { tl: 4, tr: 6, bl: 4, br: 6 });
              ctx.fill();
            }

            ctx.save();
            drawRoundedRect(ctx, PW, 0, PW - rStack, SH, { tl: 4, tr: 6, bl: 4, br: 6 });
            ctx.clip();
            ctx.drawImage(p1, PW, 0, PW - rStack, SH);
            ctx.restore();

            let dataUrl = cv.toDataURL('image/png');
            await fetch('/save?name=spread_0', { method: 'POST', body: dataUrl });

            // -------------------------------------------------------------
            // SPREAD 1: Pages 2 & 3 (Image 3)
            // -------------------------------------------------------------
            status.innerText = 'Generating Spread 1 (Pages 2 & 3)...';
            ctx.clearRect(0, 0, SW, SH);

            // Left Page: Page 2
            ctx.save();
            drawRoundedRect(ctx, 0, 0, PW, SH, { tl: 6, tr: 0, bl: 6, br: 0 });
            ctx.clip();
            ctx.drawImage(p2, 0, 0, PW, SH);
            ctx.restore();

            // Right Page: Page 3
            ctx.save();
            drawRoundedRect(ctx, PW, 0, PW, SH, { tl: 0, tr: 6, bl: 0, br: 6 });
            ctx.clip();
            ctx.drawImage(p3, PW, 0, PW, SH);
            ctx.restore();

            // Center spine crease
            ctx.save();
            const spineGrad = ctx.createLinearGradient(PW - 45, 0, PW + 45, 0);
            spineGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
            spineGrad.addColorStop(0.35, 'rgba(0, 0, 0, 0.06)');
            spineGrad.addColorStop(0.48, 'rgba(0, 0, 0, 0.32)');
            spineGrad.addColorStop(0.52, 'rgba(0, 0, 0, 0.32)');
            spineGrad.addColorStop(0.65, 'rgba(0, 0, 0, 0.06)');
            spineGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = spineGrad;
            ctx.fillRect(PW - 45, 0, 90, SH);
            ctx.restore();

            // Outer border
            ctx.save();
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.08)';
            ctx.lineWidth = 1;
            drawRoundedRect(ctx, 0, 0, SW, SH, { tl: 6, tr: 6, bl: 6, br: 6 });
            ctx.stroke();
            ctx.restore();

            dataUrl = cv.toDataURL('image/png');
            await fetch('/save?name=spread_1', { method: 'POST', body: dataUrl });

            // -------------------------------------------------------------
            // SPREAD 2: Pages 4 & 5
            // -------------------------------------------------------------
            status.innerText = 'Generating Spread 2 (Pages 4 & 5)...';
            ctx.clearRect(0, 0, SW, SH);

            // Left Page: Page 4
            ctx.save();
            drawRoundedRect(ctx, 0, 0, PW, SH, { tl: 6, tr: 0, bl: 6, br: 0 });
            ctx.clip();
            ctx.drawImage(p4, 0, 0, PW, SH);
            ctx.restore();

            // Right Page: Page 5
            ctx.save();
            drawRoundedRect(ctx, PW, 0, PW, SH, { tl: 0, tr: 6, bl: 0, br: 6 });
            ctx.clip();
            ctx.drawImage(p5, PW, 0, PW, SH);
            ctx.restore();

            // Center spine crease
            ctx.save();
            ctx.fillStyle = spineGrad;
            ctx.fillRect(PW - 45, 0, 90, SH);
            ctx.restore();

            // Outer border
            ctx.save();
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.08)';
            ctx.lineWidth = 1;
            drawRoundedRect(ctx, 0, 0, SW, SH, { tl: 6, tr: 6, bl: 6, br: 6 });
            ctx.stroke();
            ctx.restore();

            dataUrl = cv.toDataURL('image/png');
            await fetch('/save?name=spread_2', { method: 'POST', body: dataUrl });

            // -------------------------------------------------------------
            // SPREAD 3: Back Cover (Left half has Page 6)
            // -------------------------------------------------------------
            status.innerText = 'Generating Spread 3 (Back Cover)...';
            ctx.clearRect(0, 0, SW, SH);

            // Left half: Page 6 with left page stack
            const lStack = 12;
            for (let s = 3; s >= 1; s--) {
              ctx.fillStyle = s % 2 === 0 ? '#ebe7dc' : '#f5f2ea';
              drawRoundedRect(ctx, lStack - s * 3.5, s * 1.5, PW - lStack, SH - s * 3, { tl: 6, tr: 4, bl: 6, br: 4 });
              ctx.fill();
            }

            ctx.save();
            drawRoundedRect(ctx, lStack, 0, PW - lStack, SH, { tl: 6, tr: 4, bl: 6, br: 4 });
            ctx.clip();
            ctx.drawImage(p6, lStack, 0, PW - lStack, SH);
            ctx.restore();

            dataUrl = cv.toDataURL('image/png');
            await fetch('/save?name=spread_3', { method: 'POST', body: dataUrl });

            status.innerText = 'ALL DONE!';
            await fetch('/done');
          }

          generate();
        </script>
      </body>
      </html>
    `);
  } else if (url.pathname.startsWith('/brochure/')) {
    const filename = path.basename(url.pathname);
    const filePath = path.join(brochureDir, filename);
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath);
      res.writeHead(200, { 'Content-Type': 'image/png', 'Content-Length': data.length });
      res.end(data);
    } else {
      res.writeHead(404);
      res.end();
    }
  } else if (url.pathname === '/save' && req.method === 'POST') {
    const name = url.searchParams.get('name');
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      const base64Data = body.replace(/^data:image\/png;base64,/, '');
      const outFilePath = path.join(outDir, `${name}.png`);
      fs.writeFileSync(outFilePath, Buffer.from(base64Data, 'base64'));
      console.log(`Saved ${name}.png`);
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end('OK');
    });
  } else if (url.pathname === '/done') {
    console.log('Spreads generated successfully!');
    res.writeHead(200);
    res.end('OK');
    setTimeout(() => process.exit(0), 500);
  } else {
    res.writeHead(404);
    res.end();
  }
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`Server running at http://127.0.0.1:${PORT}`);
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const browserExe = fs.existsSync(chromePath) ? chromePath : edgePath;

  const child = spawn(browserExe, [
    '--headless=new',
    '--no-sandbox',
    '--disable-gpu',
    `http://127.0.0.1:${PORT}/`
  ], { stdio: 'inherit' });

  child.on('exit', (code) => {
    console.log('Browser exited with code', code);
  });
});

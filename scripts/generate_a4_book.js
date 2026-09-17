const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const PORT = 3855;
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
        <title>A4 Book Asset Generator</title>
      </head>
      <body>
        <div id="status">Generating A4 Book Assets...</div>
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
            status.innerText = 'Loading PDF page images...';

            const p1 = await loadImage('/brochure/page-1.png');
            const p2 = await loadImage('/brochure/page-2.png');
            const p3 = await loadImage('/brochure/page-3.png');
            const p4 = await loadImage('/brochure/page-4.png');
            const p5 = await loadImage('/brochure/page-5.png');
            const p6 = await loadImage('/brochure/page-6.png');

            // Page dimensions (standard A4 ratio ~ 1 : 1.416)
            const PW = 1400;
            const PH = 1982;

            // -------------------------------------------------------------
            // 1. FRONT COVER (Single A4 with right page-stack depth)
            // -------------------------------------------------------------
            status.innerText = 'Generating Front Cover...';
            const margin = 40;
            const stackWidth = 14;
            cv.width = PW + margin * 2 + stackWidth;
            cv.height = PH + margin * 2;
            ctx.clearRect(0, 0, cv.width, cv.height);

            const bx = margin;
            const by = margin;

            // Soft contact shadow underneath
            ctx.save();
            ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
            ctx.shadowBlur = 35;
            ctx.shadowOffsetX = 12;
            ctx.shadowOffsetY = 18;

            // Page stack simulation on right edge
            for (let s = 3; s >= 1; s--) {
              ctx.fillStyle = s % 2 === 0 ? '#ebe7dc' : '#f5f2ea';
              drawRoundedRect(ctx, bx + s * 3.5, by + s * 1.5, PW, PH - s * 3, { tl: 4, tr: 6, bl: 4, br: 6 });
              ctx.fill();
            }
            ctx.restore();

            // Main Cover Page
            ctx.save();
            ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
            ctx.shadowBlur = 15;
            ctx.shadowOffsetX = 4;
            ctx.shadowOffsetY = 8;
            drawRoundedRect(ctx, bx, by, PW, PH, { tl: 4, tr: 6, bl: 4, br: 6 });
            ctx.clip();
            ctx.drawImage(p1, bx, by, PW, PH);
            ctx.restore();

            // Thin subtle border
            ctx.save();
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.12)';
            ctx.lineWidth = 1;
            drawRoundedRect(ctx, bx, by, PW, PH, { tl: 4, tr: 6, bl: 4, br: 6 });
            ctx.stroke();
            ctx.restore();

            let dataUrl = cv.toDataURL('image/png');
            await fetch('/save?name=a4_cover', { method: 'POST', body: dataUrl });

            // -------------------------------------------------------------
            // 2. BACK COVER (Single A4 with left page-stack depth)
            // -------------------------------------------------------------
            status.innerText = 'Generating Back Cover...';
            cv.width = PW + margin * 2 + stackWidth;
            cv.height = PH + margin * 2;
            ctx.clearRect(0, 0, cv.width, cv.height);

            const bbx = margin + stackWidth;
            const bby = margin;

            // Soft contact shadow underneath
            ctx.save();
            ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
            ctx.shadowBlur = 35;
            ctx.shadowOffsetX = -12;
            ctx.shadowOffsetY = 18;

            // Page stack simulation on left edge
            for (let s = 3; s >= 1; s--) {
              ctx.fillStyle = s % 2 === 0 ? '#ebe7dc' : '#f5f2ea';
              drawRoundedRect(ctx, bbx - s * 3.5, bby + s * 1.5, PW, PH - s * 3, { tl: 6, tr: 4, bl: 6, br: 4 });
              ctx.fill();
            }
            ctx.restore();

            // Main Back Page
            ctx.save();
            ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
            ctx.shadowBlur = 15;
            ctx.shadowOffsetX = -4;
            ctx.shadowOffsetY = 8;
            drawRoundedRect(ctx, bbx, bby, PW, PH, { tl: 6, tr: 4, bl: 6, br: 4 });
            ctx.clip();
            ctx.drawImage(p6, bbx, bby, PW, PH);
            ctx.restore();

            // Thin subtle border
            ctx.save();
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.12)';
            ctx.lineWidth = 1;
            drawRoundedRect(ctx, bbx, bby, PW, PH, { tl: 6, tr: 4, bl: 6, br: 4 });
            ctx.stroke();
            ctx.restore();

            dataUrl = cv.toDataURL('image/png');
            await fetch('/save?name=a4_back_cover', { method: 'POST', body: dataUrl });

            // -------------------------------------------------------------
            // 3. SPREAD 1 (Page 2 Left + Page 3 Right) - Exactly like Image 3
            // -------------------------------------------------------------
            status.innerText = 'Generating Spread 1 (Pages 2 & 3)...';
            const SW = PW * 2;
            const SH = PH;
            const sMargin = 30;
            cv.width = SW + sMargin * 2;
            cv.height = SH + sMargin * 2;
            ctx.clearRect(0, 0, cv.width, cv.height);

            const sx = sMargin;
            const sy = sMargin;
            const spineX = sx + PW;

            // Spread shadow
            ctx.save();
            ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
            ctx.shadowBlur = 30;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 15;
            ctx.fillStyle = '#fbf9f4';
            drawRoundedRect(ctx, sx, sy, SW, SH, { tl: 8, tr: 8, bl: 8, br: 8 });
            ctx.fill();
            ctx.restore();

            // Left Page: Page 2
            ctx.save();
            drawRoundedRect(ctx, sx, sy, PW, SH, { tl: 8, tr: 0, bl: 8, br: 0 });
            ctx.clip();
            ctx.drawImage(p2, sx, sy, PW, SH);
            ctx.restore();

            // Right Page: Page 3
            ctx.save();
            drawRoundedRect(ctx, spineX, sy, PW, SH, { tl: 0, tr: 8, bl: 0, br: 8 });
            ctx.clip();
            ctx.drawImage(p3, spineX, sy, PW, SH);
            ctx.restore();

            // Center spine vertical crease shadow
            ctx.save();
            const spineGrad = ctx.createLinearGradient(spineX - 40, sy, spineX + 40, sy);
            spineGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
            spineGrad.addColorStop(0.35, 'rgba(0, 0, 0, 0.06)');
            spineGrad.addColorStop(0.48, 'rgba(0, 0, 0, 0.28)');
            spineGrad.addColorStop(0.52, 'rgba(0, 0, 0, 0.28)');
            spineGrad.addColorStop(0.65, 'rgba(0, 0, 0, 0.06)');
            spineGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = spineGrad;
            ctx.fillRect(spineX - 40, sy, 80, SH);
            ctx.restore();

            // Subtle outer border
            ctx.save();
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
            ctx.lineWidth = 1;
            drawRoundedRect(ctx, sx, sy, SW, SH, { tl: 8, tr: 8, bl: 8, br: 8 });
            ctx.stroke();
            ctx.restore();

            dataUrl = cv.toDataURL('image/png');
            await fetch('/save?name=a4_spread_1', { method: 'POST', body: dataUrl });

            // -------------------------------------------------------------
            // 4. SPREAD 2 (Page 4 Left + Page 5 Right)
            // -------------------------------------------------------------
            status.innerText = 'Generating Spread 2 (Pages 4 & 5)...';
            ctx.clearRect(0, 0, cv.width, cv.height);

            // Spread shadow
            ctx.save();
            ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
            ctx.shadowBlur = 30;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 15;
            ctx.fillStyle = '#fbf9f4';
            drawRoundedRect(ctx, sx, sy, SW, SH, { tl: 8, tr: 8, bl: 8, br: 8 });
            ctx.fill();
            ctx.restore();

            // Left Page: Page 4
            ctx.save();
            drawRoundedRect(ctx, sx, sy, PW, SH, { tl: 8, tr: 0, bl: 8, br: 0 });
            ctx.clip();
            ctx.drawImage(p4, sx, sy, PW, SH);
            ctx.restore();

            // Right Page: Page 5
            ctx.save();
            drawRoundedRect(ctx, spineX, sy, PW, SH, { tl: 0, tr: 8, bl: 0, br: 8 });
            ctx.clip();
            ctx.drawImage(p5, spineX, sy, PW, SH);
            ctx.restore();

            // Center spine vertical crease shadow
            ctx.save();
            ctx.fillStyle = spineGrad;
            ctx.fillRect(spineX - 40, sy, 80, SH);
            ctx.restore();

            // Subtle outer border
            ctx.save();
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
            ctx.lineWidth = 1;
            drawRoundedRect(ctx, sx, sy, SW, SH, { tl: 8, tr: 8, bl: 8, br: 8 });
            ctx.stroke();
            ctx.restore();

            dataUrl = cv.toDataURL('image/png');
            await fetch('/save?name=a4_spread_2', { method: 'POST', body: dataUrl });

            status.innerText = 'ALL A4 BOOK ASSETS GENERATED!';
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
    console.log('All A4 assets saved successfully!');
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

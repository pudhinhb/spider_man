const { spawn } = require('child_process');
const fs = require('fs');
const http = require('http');
const path = require('path');

const rootDir = path.join(__dirname, '..');

const server = http.createServer((req, res) => {
  const urlPath = req.url.split('?')[0];
  let filePath;
  if (urlPath === '/' || urlPath === '/test.html') {
    filePath = path.join(__dirname, 'test_page_flip.html');
  } else if (urlPath.startsWith('/brochure/')) {
    filePath = path.join(rootDir, 'public', urlPath);
  } else {
    filePath = path.join(rootDir, urlPath);
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('Not found: ' + req.url);
      return;
    }
    const ext = path.extname(filePath);
    const contentTypes = {
      '.html': 'text/html',
      '.js': 'application/javascript',
      '.png': 'image/png',
      '.css': 'text/css'
    };
    res.writeHead(200, { 'Content-Type': contentTypes[ext] || 'application/octet-stream' });
    res.end(data);
  });
});

server.listen(8092, async () => {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const chrome = spawn(chromePath, [
    '--headless=new',
    '--no-sandbox',
    '--disable-gpu',
    '--remote-debugging-port=9230',
    '--window-size=1600,1200',
    'http://localhost:8092/test.html'
  ]);

  await new Promise(r => setTimeout(r, 2000));

  try {
    const listRes = await fetch('http://localhost:9230/json');
    const targets = await listRes.json();
    const target = targets.find(t => t.url.includes('8092')) || targets[0];
    const ws = new WebSocket(target.webSocketDebuggerUrl);

    let id = 1;
    const send = (method, params = {}) => new Promise((resolve, reject) => {
      const msgId = id++;
      const handler = (evt) => {
        const data = JSON.parse(evt.data);
        if (data.id === msgId) {
          ws.removeEventListener('message', handler);
          if (data.error) reject(data.error);
          else resolve(data.result);
        }
      };
      ws.addEventListener('message', handler);
      ws.send(JSON.stringify({ id: msgId, method, params }));
    });

    ws.onopen = async () => {
      await send('Page.enable');
      await send('Runtime.enable');
      await new Promise(r => setTimeout(r, 1500));

      const rectRes = await send('Runtime.evaluate', {
        expression: `
          (() => {
            const b = document.getElementById('book-container');
            const r = b.getBoundingClientRect();
            return { left: r.left, top: r.top, width: r.width, height: r.height };
          })()
        `,
        returnByValue: true
      });
      const r = rectRes.result.value;
      console.log('Book container rect:', r);

      // Top-right corner of the cover is at (r.left + r.width - 20, r.top + 20)
      const startX = Math.round(r.left + r.width - 30);
      const startY = Math.round(r.top + 30);
      const dragX = Math.round(r.left + r.width * 0.72);
      const dragY = Math.round(r.top + 240);

      console.log(`Dragging from (${startX}, ${startY}) to (${dragX}, ${dragY})...`);

      // Mouse down on top-right corner
      await send('Input.dispatchMouseEvent', {
        type: 'mousePressed',
        x: startX,
        y: startY,
        button: 'left',
        clickCount: 1
      });
      await new Promise(res => setTimeout(res, 100));

      // Mouse move in steps
      for (let i = 1; i <= 10; i++) {
        const cx = Math.round(startX + (dragX - startX) * (i / 10));
        const cy = Math.round(startY + (dragY - startY) * (i / 10));
        await send('Input.dispatchMouseEvent', {
          type: 'mouseMoved',
          x: cx,
          y: cy,
          button: 'left'
        });
        await new Promise(res => setTimeout(res, 30));
      }

      await new Promise(res => setTimeout(res, 200));

      const shot = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(path.join(__dirname, 'shot_mouse_drag_top_corner.png'), Buffer.from(shot.data, 'base64'));
      console.log('Saved shot_mouse_drag_top_corner.png');

      ws.close();
      chrome.kill();
      server.close();
      process.exit(0);
    };
  } catch (e) {
    console.error(e);
    chrome.kill();
    server.close();
    process.exit(1);
  }
});

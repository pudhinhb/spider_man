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

server.listen(8093, async () => {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const chrome = spawn(chromePath, [
    '--headless=new',
    '--no-sandbox',
    '--disable-gpu',
    '--remote-debugging-port=9231',
    '--window-size=1600,1200',
    'http://localhost:8093/test.html'
  ]);

  await new Promise(r => setTimeout(r, 2000));

  try {
    const listRes = await fetch('http://localhost:9231/json');
    const targets = await listRes.json();
    const target = targets.find(t => t.url.includes('8093')) || targets[0];
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

      // Flip to spread 1
      await send('Runtime.evaluate', {
        expression: `window.pageFlip.flipNext();`
      });
      await new Promise(r => setTimeout(r, 1200));

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

      // On Spread 1: Left page is Page 2 (About Us), Right page is Page 3 (55 mins)
      // Drag top-right or middle-right of Page 3 towards the left
      const startX = Math.round(r.left + r.width - 30);
      const startY = Math.round(r.top + 60);
      const dragX = Math.round(r.left + r.width * 0.58);
      const dragY = Math.round(r.top + 280);

      console.log(`Dragging Spread 1 from (${startX}, ${startY}) to (${dragX}, ${dragY})...`);

      await send('Input.dispatchMouseEvent', {
        type: 'mousePressed',
        x: startX,
        y: startY,
        button: 'left',
        clickCount: 1
      });
      await new Promise(res => setTimeout(res, 80));

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
      fs.writeFileSync(path.join(__dirname, 'shot_mouse_drag_spread1.png'), Buffer.from(shot.data, 'base64'));
      console.log('Saved shot_mouse_drag_spread1.png');

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

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

server.listen(8091, async () => {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const chrome = spawn(chromePath, [
    '--headless=new',
    '--no-sandbox',
    '--disable-gpu',
    '--remote-debugging-port=9229',
    '--window-size=1600,1200',
    'http://localhost:8091/test.html'
  ]);

  await new Promise(r => setTimeout(r, 2000));

  try {
    const listRes = await fetch('http://localhost:9229/json');
    const targets = await listRes.json();
    const target = targets.find(t => t.url.includes('8091')) || targets[0];
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

      await send('Runtime.evaluate', {
        expression: `window.testFoldCoverTop();`
      });
      await new Promise(r => setTimeout(r, 600));

      const shot = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(path.join(__dirname, 'shot_top_corner_fold.png'), Buffer.from(shot.data, 'base64'));
      console.log('Saved shot_top_corner_fold.png');

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

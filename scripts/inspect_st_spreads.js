const { spawn } = require('child_process');
const fs = require('fs');
const http = require('http');
const path = require('path');

const server = http.createServer((req, res) => {
  let filePath = path.join(__dirname, '..', req.url.split('?')[0]);
  if (req.url === '/' || req.url === '/test.html') {
    filePath = path.join(__dirname, 'test_page_flip.html');
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

server.listen(8089, async () => {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const chrome = spawn(chromePath, [
    '--headless=new',
    '--no-sandbox',
    '--disable-gpu',
    '--remote-debugging-port=9227',
    '--window-size=1600,1200',
    'http://localhost:8089/test.html'
  ]);

  await new Promise(r => setTimeout(r, 2000));

  try {
    const listRes = await fetch('http://localhost:9227/json');
    const targets = await listRes.json();
    const target = targets.find(t => t.url.includes('8089')) || targets[0];
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

      await new Promise(r => setTimeout(r, 2000));

      const res = await send('Runtime.evaluate', {
        expression: `
          (() => {
            const col = window.pageFlip.getPageCollection();
            return {
              spreads: col.getSpread(),
              pageCount: col.getPageCount(),
              currentSpread: col.getCurrentSpreadIndex(),
              currentPage: window.pageFlip.getCurrentPageIndex()
            };
          })()
        `,
        returnByValue: true
      });

      console.log('PageFlip spreads config:', JSON.stringify(res.result.value, null, 2));

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

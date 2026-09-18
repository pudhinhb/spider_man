const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const chrome = spawn(chromePath, [
  '--headless=new',
  '--remote-debugging-port=9249',
  '--window-size=1600,1200',
  'http://localhost:3000'
]);

setTimeout(async () => {
  try {
    const listRes = await fetch('http://localhost:9249/json');
    const targets = await listRes.json();
    const target = targets.find(t => t.url.includes('3000') && t.type === 'page') || targets.find(t => t.type === 'page');
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

      await send('Runtime.evaluate', {
        expression: `document.getElementById('screen-3-sketchbook').scrollIntoView();`
      });
      await new Promise(r => setTimeout(r, 1200));

      // Inspect PageFlip internal properties
      const info = await send('Runtime.evaluate', {
        expression: `
          (() => {
            const pf = window.debugPageFlip;
            // Let's inspect pages and spreads
            return {
              hasDebug: !!pf,
              spreads: pf ? pf.getPageCollection().getSpread() : null,
              pages: pf ? pf.getPageCollection().getPages().map(p => ({
                density: p.getDensity(),
                drawingDensity: p.getDrawingDensity(),
                orientation: p.orientation
              })) : null
            };
          })()
        `,
        returnByValue: true
      });
      console.log('PageFlip info:', info.result.value);

      ws.close();
      chrome.kill();
      process.exit(0);
    };
  } catch (err) {
    console.error(err);
    chrome.kill();
    process.exit(1);
  }
}, 2500);

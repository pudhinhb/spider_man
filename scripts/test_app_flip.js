const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const chrome = spawn(chromePath, [
  '--headless=new',
  '--remote-debugging-port=9237',
  '--window-size=1600,1200',
  'http://localhost:3000'
]);

const brainDir = 'C:\\Users\\Admin\\.gemini\\antigravity-ide\\brain\\c47dfbdb-dda1-4788-9f25-0687b26f5247';

setTimeout(async () => {
  try {
    const r = await fetch('http://localhost:9237/json');
    const targets = await r.json();
    const ws = new WebSocket(targets[0].webSocketDebuggerUrl);

    let id = 1;
    const send = (m, p = {}) => new Promise((resolve, reject) => {
      const mid = id++;
      const h = (e) => {
        const d = JSON.parse(e.data);
        if (d.id === mid) {
          ws.removeEventListener('message', h);
          if (d.error) reject(d.error);
          else resolve(d.result);
        }
      };
      ws.addEventListener('message', h);
      ws.send(JSON.stringify({ id: mid, method: m, params: p }));
    });

    ws.onopen = async () => {
      await send('Page.enable');
      await send('Runtime.enable');

      await send('Runtime.evaluate', {
        expression: `document.getElementById("screen-3-sketchbook").scrollIntoView();`
      });
      await new Promise(res => setTimeout(res, 1200));

      // Click next button
      const clickRes = await send('Runtime.evaluate', {
        expression: `
          (() => {
            const btn = document.querySelector('.sb-turn-arrow.bottom-right');
            if (btn) {
              btn.click();
              return 'clicked';
            }
            return 'not found';
          })()
        `,
        returnByValue: true
      });
      console.log('Button click:', clickRes.result.value);

      // Wait for flip animation
      await new Promise(res => setTimeout(res, 1400));

      const shot = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(path.join(brainDir, 'verified_spread1_after_click.png'), Buffer.from(shot.data, 'base64'));
      console.log('Saved verified_spread1_after_click.png');

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

const { spawn } = require('child_process');
const fs = require('fs');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const chrome = spawn(chromePath, [
  '--headless=new',
  '--no-sandbox',
  '--disable-gpu',
  '--remote-debugging-port=9225',
  '--window-size=1600,1200',
  'http://localhost:3000'
]);

async function run() {
  await new Promise(r => setTimeout(r, 2500));

  try {
    const listRes = await fetch('http://localhost:9225/json');
    const targets = await listRes.json();
    const target = targets.find(t => t.url.includes('3000')) || targets[0];
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

      // Scroll to screen 3
      await send('Runtime.evaluate', {
        expression: `
          const el = document.getElementById('screen-3-sketchbook');
          if (el) el.scrollIntoView();
        `
      });
      await new Promise(r => setTimeout(r, 1000));

      // Check current page
      const res = await send('Runtime.evaluate', {
        expression: `
          (() => {
            const b = document.getElementById('sbBook');
            return {
              bookFound: !!b,
              rect: b ? b.getBoundingClientRect() : null
            };
          })()
        `,
        returnByValue: true
      });

      console.log('Book inspection:', JSON.stringify(res.result.value, null, 2));

      ws.close();
      chrome.kill();
      process.exit(0);
    };
  } catch (err) {
    console.error('Error:', err);
    chrome.kill();
    process.exit(1);
  }
}

run();

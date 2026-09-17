const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const chrome = spawn(chromePath, [
  '--headless=new',
  '--no-sandbox',
  '--disable-gpu',
  '--remote-debugging-port=9222',
  '--window-size=1600,1200',
  'http://localhost:3000'
]);

async function run() {
  // Wait 2 seconds for Chrome to start
  await new Promise(r => setTimeout(r, 2000));

  try {
    const listRes = await fetch('http://localhost:9222/json');
    const targets = await listRes.json();
    console.log('Targets:', targets.map(t => t.url));
    const target = targets.find(t => t.url.includes('3000')) || targets[0];
    if (!target) throw new Error('No target page found');

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
      console.log('Connected to CDP');
      await send('Page.enable');
      
      // Wait for page to render
      await new Promise(r => setTimeout(r, 2000));

      // Scroll to screen 3
      console.log('Scrolling to Screen 3...');
      await send('Runtime.evaluate', {
        expression: `
          const el = document.getElementById('screen-3-sketchbook');
          if (el) {
            el.scrollIntoView({ behavior: 'instant', block: 'start' });
            'FOUND_AND_SCROLLED';
          } else {
            'NOT_FOUND';
          }
        `
      });

      // Wait 1.5 seconds for scroll and rendering
      await new Promise(r => setTimeout(r, 1500));

      console.log('Capturing screenshot of Screen 3...');
      const { data } = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(path.resolve(__dirname, '..', 'screen3_verified.png'), Buffer.from(data, 'base64'));
      console.log('Saved screen3_verified.png!');

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

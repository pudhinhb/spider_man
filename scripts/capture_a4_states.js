const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const chrome = spawn(chromePath, [
  '--headless=new',
  '--no-sandbox',
  '--disable-gpu',
  '--remote-debugging-port=9224',
  '--window-size=1600,1200',
  'http://localhost:3000'
]);

async function run() {
  await new Promise(r => setTimeout(r, 2000));

  try {
    const listRes = await fetch('http://localhost:9224/json');
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
      await new Promise(r => setTimeout(r, 1500));

      // Scroll to screen 3
      await send('Runtime.evaluate', {
        expression: `document.getElementById('screen-3-sketchbook').scrollIntoView({ behavior: 'instant', block: 'start' });`
      });
      await new Promise(r => setTimeout(r, 1000));

      // 1. Capture State 0: Front Cover
      console.log('Capturing State 0 (Cover)...');
      let shot = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(path.resolve(__dirname, '..', 'shot_state0_cover.png'), Buffer.from(shot.data, 'base64'));

      // 2. Click forward to State 1: Spread 1
      console.log('Flipping to State 1 (Spread 1)...');
      await send('Runtime.evaluate', {
        expression: `document.querySelector('.curved-flip-btn.bottom-right').click();`
      });
      await new Promise(r => setTimeout(r, 900));

      console.log('Capturing State 1 (Spread 1)...');
      shot = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(path.resolve(__dirname, '..', 'shot_state1_spread.png'), Buffer.from(shot.data, 'base64'));

      // 3. Click forward to State 2: Spread 2
      console.log('Flipping to State 2 (Spread 2)...');
      await send('Runtime.evaluate', {
        expression: `document.querySelector('.curved-flip-btn.bottom-right').click();`
      });
      await new Promise(r => setTimeout(r, 900));

      // 4. Click forward to State 3: Back Cover
      console.log('Flipping to State 3 (Back Cover)...');
      await send('Runtime.evaluate', {
        expression: `document.querySelector('.curved-flip-btn.bottom-right').click();`
      });
      await new Promise(r => setTimeout(r, 900));

      console.log('Capturing State 3 (Back Cover)...');
      shot = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(path.resolve(__dirname, '..', 'shot_state3_back.png'), Buffer.from(shot.data, 'base64'));

      console.log('All state screenshots captured successfully!');
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

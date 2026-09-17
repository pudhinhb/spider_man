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
  await new Promise(r => setTimeout(r, 2500));

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
        expression: `
          const el = document.getElementById('screen-3-sketchbook');
          if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' });
        `
      });
      await new Promise(r => setTimeout(r, 1000));

      // 1. Capture State 0 (Front Cover)
      console.log('Capturing State 0 (Front Cover)...');
      let snap = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(path.resolve(__dirname, '..', 'public', 'sketchbook', 'test_state_0.png'), Buffer.from(snap.data, 'base64'));

      // 2. Click flip next and capture mid-turn curl
      console.log('Triggering flip next (Cover -> Spread 1)...');
      await send('Runtime.evaluate', {
        expression: `
          const btn = document.querySelector('.curved-flip-btn.bottom-right');
          if (btn) btn.click();
        `
      });

      // Capture at ~350ms (mid-turn when leaf is curling in 3D arc)
      await new Promise(r => setTimeout(r, 350));
      console.log('Capturing mid-turn curl...');
      snap = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(path.resolve(__dirname, '..', 'public', 'sketchbook', 'test_mid_turn_curl.png'), Buffer.from(snap.data, 'base64'));

      // 3. Wait for turn to settle and capture State 1 (Spread 1)
      await new Promise(r => setTimeout(r, 700));
      console.log('Capturing State 1 (Spread 1)...');
      snap = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(path.resolve(__dirname, '..', 'public', 'sketchbook', 'test_state_1.png'), Buffer.from(snap.data, 'base64'));

      // 4. Click flip next to Spread 2
      console.log('Triggering flip next (Spread 1 -> Spread 2)...');
      await send('Runtime.evaluate', {
        expression: `
          const btn = document.querySelector('.curved-flip-btn.bottom-right');
          if (btn) btn.click();
        `
      });
      // Capture mid-turn curl between spreads
      await new Promise(r => setTimeout(r, 350));
      console.log('Capturing mid-turn curl (Spread 1 -> Spread 2)...');
      snap = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(path.resolve(__dirname, '..', 'public', 'sketchbook', 'test_spread_mid_curl.png'), Buffer.from(snap.data, 'base64'));

      // Settle
      await new Promise(r => setTimeout(r, 700));
      console.log('Capturing State 2 (Spread 2)...');
      snap = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(path.resolve(__dirname, '..', 'public', 'sketchbook', 'test_state_2.png'), Buffer.from(snap.data, 'base64'));

      // 5. Click flip next to Back Cover (State 3)
      console.log('Triggering flip next (Spread 2 -> Back Cover)...');
      await send('Runtime.evaluate', {
        expression: `
          const btn = document.querySelector('.curved-flip-btn.bottom-right');
          if (btn) btn.click();
        `
      });
      await new Promise(r => setTimeout(r, 1000));
      console.log('Capturing State 3 (Back Cover)...');
      snap = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(path.resolve(__dirname, '..', 'public', 'sketchbook', 'test_state_3.png'), Buffer.from(snap.data, 'base64'));

      console.log('All test screenshots captured successfully!');
      ws.close();
      chrome.kill();
      process.exit(0);
    };
  } catch (err) {
    console.error('Error in verification:', err);
    chrome.kill();
    process.exit(1);
  }
}

run();

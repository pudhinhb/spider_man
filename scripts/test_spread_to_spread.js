const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless=new',
  '--no-sandbox',
  '--disable-gpu',
  '--remote-debugging-port=9227',
  '--window-size=1600,1200',
  'http://localhost:3000'
]);

async function run() {
  await new Promise(r => setTimeout(r, 2000));
  try {
    const listRes = await fetch('http://localhost:9227/json');
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
        expression: `document.getElementById('screen-3-sketchbook').scrollIntoView({ behavior: 'instant', block: 'center' });`
      });
      await new Promise(r => setTimeout(r, 800));

      // 1. Go to State 1 (Spread 1) by clicking plate 2
      console.log('Navigating to Spread 1...');
      await send('Runtime.evaluate', {
        expression: `document.querySelectorAll('.plate')[1].click();`
      });
      await new Promise(r => setTimeout(r, 1200));

      // Capture Spread 1
      let snap = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(path.resolve(__dirname, '..', 'public', 'sketchbook', 'verified_spread_1.png'), Buffer.from(snap.data, 'base64'));
      console.log('Saved verified_spread_1.png');

      // 2. Drag from right to left on Spread 1 (mid-drag to Spread 2)
      console.log('Dragging on Spread 1 to curl towards Spread 2...');
      await send('Runtime.evaluate', {
        expression: `(() => {
          const book = document.getElementById('sbBook');
          const stage = document.getElementById('sbStage');
          const r = book.getBoundingClientRect();
          const startX = r.left + r.width * 0.85;
          const startY = r.top + r.height * 0.5;

          stage.dispatchEvent(new PointerEvent('pointerdown', {
            bubbles: true, cancelable: true, clientX: startX, clientY: startY, button: 0, pointerId: 2
          }));

          const midX = r.left + r.width * 0.45;
          stage.dispatchEvent(new PointerEvent('pointermove', {
            bubbles: true, cancelable: true, clientX: midX, clientY: startY, pointerId: 2
          }));
        })()`
      });
      await new Promise(r => setTimeout(r, 200));

      // Capture mid-drag curl between Spread 1 and Spread 2
      snap = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(path.resolve(__dirname, '..', 'public', 'sketchbook', 'verified_spread_1_to_2_curl.png'), Buffer.from(snap.data, 'base64'));
      console.log('Saved verified_spread_1_to_2_curl.png');

      // Release drag to finish turn to Spread 2
      await send('Runtime.evaluate', {
        expression: `document.getElementById('sbStage').dispatchEvent(new PointerEvent('pointerup', { pointerId: 2 }));`
      });
      await new Promise(r => setTimeout(r, 1000));

      // Capture Spread 2 settled
      snap = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(path.resolve(__dirname, '..', 'public', 'sketchbook', 'verified_spread_2.png'), Buffer.from(snap.data, 'base64'));
      console.log('Saved verified_spread_2.png');

      // 3. Turn to State 3 (Back Cover)
      console.log('Clicking flip next to Back Cover...');
      await send('Runtime.evaluate', {
        expression: `document.querySelector('.curved-flip-btn.bottom-right').click();`
      });
      await new Promise(r => setTimeout(r, 1200));

      // Capture Back Cover
      snap = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(path.resolve(__dirname, '..', 'public', 'sketchbook', 'verified_back_cover.png'), Buffer.from(snap.data, 'base64'));
      console.log('Saved verified_back_cover.png');

      ws.close();
      chrome.kill();
      process.exit(0);
    };
  } catch (err) {
    console.error(err);
    chrome.kill();
    process.exit(1);
  }
}

run();

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless=new',
  '--no-sandbox',
  '--disable-gpu',
  '--remote-debugging-port=9230',
  '--window-size=1600,1200',
  'http://localhost:3000'
]);

async function run() {
  await new Promise(r => setTimeout(r, 2000));
  try {
    const listRes = await fetch('http://localhost:9230/json');
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

      // 1. Jump to State 3 (Back Cover)
      console.log('Navigating to Back Cover...');
      await send('Runtime.evaluate', {
        expression: `document.querySelectorAll('.plate')[3].click();`
      });
      await new Promise(r => setTimeout(r, 1200));

      // 2. Drag backwards from left to right to test backward curl
      console.log('Dragging backwards on Back Cover...');
      await send('Runtime.evaluate', {
        expression: `(() => {
          const book = document.getElementById('sbBook');
          const stage = document.getElementById('sbStage');
          const r = book.getBoundingClientRect();
          const startX = r.left + r.width * 0.15;
          const startY = r.top + r.height * 0.5;

          stage.dispatchEvent(new PointerEvent('pointerdown', {
            bubbles: true, cancelable: true, clientX: startX, clientY: startY, button: 0, pointerId: 3
          }));

          const midX = r.left + r.width * 0.55;
          stage.dispatchEvent(new PointerEvent('pointermove', {
            bubbles: true, cancelable: true, clientX: midX, clientY: startY, pointerId: 3
          }));
        })()`
      });
      await new Promise(r => setTimeout(r, 200));

      // Capture mid-backward curl
      let snap = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(path.resolve(__dirname, '..', 'public', 'sketchbook', 'verified_backward_curl.png'), Buffer.from(snap.data, 'base64'));
      console.log('Saved verified_backward_curl.png');

      // Release to complete flip to Spread 2
      await send('Runtime.evaluate', {
        expression: `document.getElementById('sbStage').dispatchEvent(new PointerEvent('pointerup', { pointerId: 3 }));`
      });
      await new Promise(r => setTimeout(r, 1000));

      // 3. Click flip prev from Spread 2 to Spread 1
      console.log('Flipping back to Spread 1...');
      await send('Runtime.evaluate', {
        expression: `document.querySelector('.curved-flip-btn.bottom-left').click();`
      });
      await new Promise(r => setTimeout(r, 1000));

      // 4. Click flip prev from Spread 1 to Front Cover
      console.log('Flipping back to Front Cover...');
      await send('Runtime.evaluate', {
        expression: `document.querySelector('.curved-flip-btn.bottom-left').click();`
      });
      await new Promise(r => setTimeout(r, 1200));

      // Capture final Front Cover
      snap = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(path.resolve(__dirname, '..', 'public', 'sketchbook', 'verified_return_cover.png'), Buffer.from(snap.data, 'base64'));
      console.log('Saved verified_return_cover.png');

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

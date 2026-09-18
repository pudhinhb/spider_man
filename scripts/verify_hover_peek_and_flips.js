const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless=new',
  '--no-sandbox',
  '--disable-gpu',
  '--remote-debugging-port=9231',
  '--window-size=1600,1200',
  'http://localhost:3000'
]);

async function run() {
  await new Promise(r => setTimeout(r, 2000));
  try {
    const listRes = await fetch('http://localhost:9231/json');
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

      // 1. Capture State 0 (Front Cover) with the white arrow and gap
      console.log('1. Capturing State 0 (Front Cover) with white arrow...');
      let snap = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(path.resolve(__dirname, '..', 'public', 'sketchbook', 'test_cover_white_arrow.png'), Buffer.from(snap.data, 'base64'));

      // 2. Hover over the right arrow to test hover corner peek curl (Image 4)
      console.log('2. Hovering over right arrow to trigger corner peek curl...');
      await send('Runtime.evaluate', {
        expression: `(() => {
          const btn = document.querySelector('.sb-turn-arrow.bottom-right');
          if (btn) btn.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
        })()`
      });
      await new Promise(r => setTimeout(r, 260));

      // Capture peek curl on Cover
      console.log('Capturing hover corner peek curl on Cover...');
      snap = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(path.resolve(__dirname, '..', 'public', 'sketchbook', 'test_cover_hover_peek.png'), Buffer.from(snap.data, 'base64'));

      // 3. Click the arrow to execute the full flip from Cover to Spread 1
      console.log('3. Clicking arrow to execute full flip to Spread 1...');
      await send('Runtime.evaluate', {
        expression: `(() => {
          const btn = document.querySelector('.sb-turn-arrow.bottom-right');
          if (btn) btn.click();
        })()`
      });
      // Capture mid-turn curl during Cover -> Spread 1
      await new Promise(r => setTimeout(r, 380));
      console.log('Capturing mid-turn curl (Cover -> Spread 1)...');
      snap = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(path.resolve(__dirname, '..', 'public', 'sketchbook', 'test_cover_to_spread1_midcurl.png'), Buffer.from(snap.data, 'base64'));

      // Settle on Spread 1
      await new Promise(r => setTimeout(r, 1000));
      console.log('4. Capturing Spread 1 with left and right white arrows...');
      snap = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(path.resolve(__dirname, '..', 'public', 'sketchbook', 'test_spread1_white_arrows.png'), Buffer.from(snap.data, 'base64'));

      // 5. Hover over right arrow on Spread 1
      console.log('5. Hovering over right arrow on Spread 1 to test peek curl...');
      await send('Runtime.evaluate', {
        expression: `(() => {
          const btn = document.querySelector('.sb-turn-arrow.bottom-right');
          if (btn) btn.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
        })()`
      });
      await new Promise(r => setTimeout(r, 260));
      console.log('Capturing hover peek on Spread 1...');
      snap = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(path.resolve(__dirname, '..', 'public', 'sketchbook', 'test_spread1_hover_peek.png'), Buffer.from(snap.data, 'base64'));

      // 6. Click to flip to Spread 2
      console.log('6. Clicking to flip to Spread 2...');
      await send('Runtime.evaluate', {
        expression: `(() => {
          const btn = document.querySelector('.sb-turn-arrow.bottom-right');
          if (btn) btn.click();
        })()`
      });
      await new Promise(r => setTimeout(r, 1100));

      // 7. Click to flip to Back Cover (State 3)
      console.log('7. Clicking to flip to Back Cover...');
      await send('Runtime.evaluate', {
        expression: `(() => {
          const btn = document.querySelector('.sb-turn-arrow.bottom-right');
          if (btn) btn.click();
        })()`
      });
      // Capture mid-turn curl during Spread 2 -> Back Cover
      await new Promise(r => setTimeout(r, 380));
      console.log('Capturing mid-turn curl (Spread 2 -> Back Cover)...');
      snap = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(path.resolve(__dirname, '..', 'public', 'sketchbook', 'test_spread2_to_backcover_midcurl.png'), Buffer.from(snap.data, 'base64'));

      // Settle on Back Cover
      await new Promise(r => setTimeout(r, 1000));
      console.log('8. Capturing Back Cover with left white arrow and gap...');
      snap = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(path.resolve(__dirname, '..', 'public', 'sketchbook', 'test_backcover_white_arrow.png'), Buffer.from(snap.data, 'base64'));

      console.log('All verification screenshots captured successfully!');
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

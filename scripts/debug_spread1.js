const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const chrome = spawn(chromePath, [
  '--headless=new',
  '--remote-debugging-port=9246',
  '--window-size=1600,1200',
  'http://localhost:3000'
]);

const brainDir = 'C:\\Users\\Admin\\.gemini\\antigravity-ide\\brain\\c47dfbdb-dda1-4788-9f25-0687b26f5247';

setTimeout(async () => {
  try {
    const listRes = await fetch('http://localhost:9246/json');
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

      // Click button to flip to Spread 1
      const clickRes = await send('Runtime.evaluate', {
        expression: `
          (() => {
            const b = document.querySelector('.sb-turn-arrow.bottom-right');
            if (b) { b.click(); return 'clicked'; }
            return 'not found';
          })()
        `,
        returnByValue: true
      });
      console.log('Button click:', clickRes.result.value);
      await new Promise(r => setTimeout(r, 1400));

      // Inspect PageFlip state on Spread 1
      const stateRes = await send('Runtime.evaluate', {
        expression: `
          (() => {
            const block = document.querySelector('.stf__block');
            const r = block ? block.getBoundingClientRect() : null;
            return {
              blockRect: r ? { left: r.left, top: r.top, width: r.width, height: r.height } : null
            };
          })()
        `,
        returnByValue: true
      });
      console.log('Spread 1 DOM:', JSON.stringify(stateRes.result.value, null, 2));

      // Drag top-right corner of page 3
      const bRect = stateRes.result.value.blockRect;
      const startX = Math.round(bRect.left + bRect.width - 25);
      const startY = Math.round(bRect.top + 35);
      const dragX = Math.round(bRect.left + bRect.width * 0.62);
      const dragY = Math.round(bRect.top + 280);

      console.log(`Dragging from (${startX}, ${startY}) to (${dragX}, ${dragY})...`);

      await send('Input.dispatchMouseEvent', {
        type: 'mousePressed',
        x: startX,
        y: startY,
        button: 'left',
        clickCount: 1
      });
      await new Promise(r => setTimeout(r, 80));

      for (let i = 1; i <= 8; i++) {
        const cx = Math.round(startX + (dragX - startX) * (i / 8));
        const cy = Math.round(startY + (dragY - startY) * (i / 8));
        await send('Input.dispatchMouseEvent', {
          type: 'mouseMoved',
          x: cx,
          y: cy,
          button: 'left'
        });
        await new Promise(r => setTimeout(r, 30));
      }
      await new Promise(r => setTimeout(r, 300));

      const shot = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(path.join(brainDir, 'verified_spread1_diagonal_peel.png'), Buffer.from(shot.data, 'base64'));
      console.log('Saved verified_spread1_diagonal_peel.png');

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

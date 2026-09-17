const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const chrome = spawn(chromePath, [
  '--headless=new',
  '--remote-debugging-port=9248',
  '--window-size=1600,1200',
  'http://localhost:3000'
]);

const brainDir = 'C:\\Users\\Admin\\.gemini\\antigravity-ide\\brain\\c47dfbdb-dda1-4788-9f25-0687b26f5247';

setTimeout(async () => {
  try {
    const listRes = await fetch('http://localhost:9248/json');
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

      // Get loupe position
      const loupePos = await send('Runtime.evaluate', {
        expression: `
          (() => {
            const l = document.getElementById('loupe');
            const r = l.getBoundingClientRect();
            return { left: r.left, top: r.top, width: r.width, height: r.height };
          })()
        `,
        returnByValue: true
      });
      const lp = loupePos.result.value;
      console.log('Docked Loupe position:', lp);

      // Drag loupe from right edge towards center of the book (x: 800, y: 550)
      const startX = Math.round(lp.left + 30);
      const startY = Math.round(lp.top + lp.height / 2);
      const targetX = 800;
      const targetY = 550;

      await send('Input.dispatchMouseEvent', {
        type: 'mousePressed',
        x: startX,
        y: startY,
        button: 'left',
        clickCount: 1
      });
      await new Promise(r => setTimeout(r, 50));

      for (let i = 1; i <= 10; i++) {
        const cx = Math.round(startX + (targetX - startX) * (i / 10));
        const cy = Math.round(startY + (targetY - startY) * (i / 10));
        await send('Input.dispatchMouseEvent', {
          type: 'mouseMoved',
          x: cx,
          y: cy,
          button: 'left'
        });
        await new Promise(r => setTimeout(r, 20));
      }
      await new Promise(r => setTimeout(r, 250));

      const shotDrag = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(path.join(brainDir, 'verified_loupe_drag_magnifying.png'), Buffer.from(shotDrag.data, 'base64'));
      console.log('Saved verified_loupe_drag_magnifying.png');

      // Release mouse to return to dock
      await send('Input.dispatchMouseEvent', {
        type: 'mouseReleased',
        x: targetX,
        y: targetY,
        button: 'left'
      });
      await new Promise(r => setTimeout(r, 800)); // wait for GSAP spring return animation

      const shotReturned = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(path.join(brainDir, 'verified_loupe_returned_dock.png'), Buffer.from(shotReturned.data, 'base64'));
      console.log('Saved verified_loupe_returned_dock.png');

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

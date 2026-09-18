const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const chrome = spawn(chromePath, [
  '--headless=new',
  '--remote-debugging-port=9255',
  '--window-size=1600,1200',
  'http://localhost:3000'
]);

const brainDir = 'C:\\Users\\Admin\\.gemini\\antigravity-ide\\brain\\c47dfbdb-dda1-4788-9f25-0687b26f5247';

setTimeout(async () => {
  try {
    const listRes = await fetch('http://localhost:9255/json');
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

      // Click arrow to go from Cover -> Spread 1
      await send('Runtime.evaluate', {
        expression: `document.querySelector('.sb-turn-arrow.bottom-right').click();`
      });
      await new Promise(r => setTimeout(r, 1500));

      const rectRes = await send('Runtime.evaluate', {
        expression: `
          (() => {
            const b = document.querySelector('.stf__block');
            const r = b.getBoundingClientRect();
            const pf = window.debugPageFlip;
            return {
              rect: { left: r.left, top: r.top, width: r.width, height: r.height },
              spreadIndex: pf ? pf.getPageCollection().getCurrentSpreadIndex() : -1,
              pageIndex: pf ? pf.getCurrentPageIndex() : -1
            };
          })()
        `,
        returnByValue: true
      });
      console.log('Book state at Spread 1:', rectRes.result.value);
      const r = rectRes.result.value.rect;

      // Drag bottom-left corner of Page 2 towards right (closing to Front Cover)
      const startX = Math.round(r.left + 25);
      const startY = Math.round(r.top + r.height - 35);
      const dragX = Math.round(r.left + r.width * 0.38);
      const dragY = Math.round(r.top + r.height * 0.50);

      console.log(`Dragging Spread 1 backwards from (${startX}, ${startY}) to (${dragX}, ${dragY})...`);

      await send('Input.dispatchMouseEvent', {
        type: 'mousePressed',
        x: startX,
        y: startY,
        button: 'left',
        clickCount: 1
      });
      await new Promise(res => setTimeout(res, 80));

      for (let i = 1; i <= 10; i++) {
        const cx = Math.round(startX + (dragX - startX) * (i / 10));
        const cy = Math.round(startY + (dragY - startY) * (i / 10));
        await send('Input.dispatchMouseEvent', {
          type: 'mouseMoved',
          x: cx,
          y: cy,
          button: 'left'
        });
        await new Promise(res => setTimeout(res, 25));
      }
      await new Promise(res => setTimeout(res, 250));

      // Inspect active elements WHILE MOUSE IS HELD DOWN
      const activeState = await send('Runtime.evaluate', {
        expression: `
          (() => {
            const pf = window.debugPageFlip;
            const items = Array.from(document.querySelectorAll('.stf__item'));
            return {
              state: pf ? pf.getState() : null,
              items: items.map((el, idx) => ({
                idx,
                display: el.style.display,
                zIndex: el.style.zIndex,
                clipPath: el.style.clipPath,
                transform: el.style.transform,
                alt: el.querySelector('img') ? el.querySelector('img').alt : 'none'
              })).filter(x => x.display !== 'none')
            };
          })()
        `,
        returnByValue: true
      });
      console.log('Active state during Spread 1 backward drag:', JSON.stringify(activeState.result.value, null, 2));

      // Capture screenshot WHILE MOUSE IS STILL PRESSED
      const shot = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(path.join(brainDir, 'verified_active_drag_spread1_to_cover.png'), Buffer.from(shot.data, 'base64'));
      console.log('Saved verified_active_drag_spread1_to_cover.png');

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

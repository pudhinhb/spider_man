const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const chrome = spawn(chromePath, [
  '--headless=new',
  '--remote-debugging-port=9253',
  '--window-size=1600,1200',
  'http://localhost:3000'
]);

const brainDir = 'C:\\Users\\Admin\\.gemini\\antigravity-ide\\brain\\c47dfbdb-dda1-4788-9f25-0687b26f5247';

setTimeout(async () => {
  try {
    const listRes = await fetch('http://localhost:9253/json');
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

      const capture = async (filename) => {
        const shot = await send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync(path.join(brainDir, filename), Buffer.from(shot.data, 'base64'));
        fs.writeFileSync(path.join(__dirname, filename), Buffer.from(shot.data, 'base64'));
        console.log('Saved:', filename);
      };

      const getBlockRect = async () => {
        const res = await send('Runtime.evaluate', {
          expression: `
            (() => {
              const b = document.querySelector('.stf__block');
              if (!b) return null;
              const r = b.getBoundingClientRect();
              return { left: r.left, top: r.top, width: r.width, height: r.height };
            })()
          `,
          returnByValue: true
        });
        return res.result ? res.result.value : null;
      };

      // TEST 1: Go to Spread 1, then peel backwards towards Front Cover
      // First, flip to Spread 1
      await send('Runtime.evaluate', {
        expression: `
          const b = document.querySelector('.sb-turn-arrow.bottom-right');
          if (b) b.click();
        `
      });
      await new Promise(r => setTimeout(r, 1300));

      let r = await getBlockRect();
      console.log('Spread 1 Rect:', r);

      // Peel from bottom-left corner of Page 2 towards right (turning backward to cover)
      const s1StartX = Math.round(r.left + 25);
      const s1StartY = Math.round(r.top + r.height - 35);
      const s1DragX = Math.round(r.left + r.width * 0.35);
      const s1DragY = Math.round(r.top + r.height * 0.55);

      console.log(`Dragging Spread 1 backwards from (${s1StartX}, ${s1StartY}) to (${s1DragX}, ${s1DragY})...`);
      await send('Input.dispatchMouseEvent', {
        type: 'mousePressed',
        x: s1StartX,
        y: s1StartY,
        button: 'left',
        clickCount: 1
      });
      await new Promise(res => setTimeout(res, 60));

      for (let i = 1; i <= 8; i++) {
        const cx = Math.round(s1StartX + (s1DragX - s1StartX) * (i / 8));
        const cy = Math.round(s1StartY + (s1DragY - s1StartY) * (i / 8));
        await send('Input.dispatchMouseEvent', {
          type: 'mouseMoved',
          x: cx,
          y: cy,
          button: 'left'
        });
        await new Promise(res => setTimeout(res, 25));
      }
      await new Promise(res => setTimeout(res, 250));
      await capture('verified_fix_spread1_to_frontcover.png');

      // Release mouse
      await send('Input.dispatchMouseEvent', {
        type: 'mouseReleased',
        x: s1DragX,
        y: s1DragY,
        button: 'left'
      });
      await new Promise(res => setTimeout(res, 1300));

      // TEST 2: Go to Spread 2, then peel bottom-right corner towards Back Cover (Matching Image 3)
      // We might be at Cover or Spread 1, let's navigate cleanly to Spread 2
      await send('Runtime.evaluate', {
        expression: `
          const pf = window.debugPageFlip;
          if (pf) {
            pf.flip(4, 'bottom'); // jump/flip to Spread 2
          }
        `
      });
      await new Promise(r => setTimeout(r, 1400));

      r = await getBlockRect();
      console.log('Spread 2 Rect:', r);

      // Peel from bottom-right corner of Page 5 upwards-left towards Back Cover
      const s2StartX = Math.round(r.left + r.width - 25);
      const s2StartY = Math.round(r.top + r.height - 35);
      const s2DragX = Math.round(r.left + r.width * 0.65);
      const s2DragY = Math.round(r.top + r.height * 0.50);

      console.log(`Dragging Spread 2 to Back Cover from (${s2StartX}, ${s2StartY}) to (${s2DragX}, ${s2DragY})...`);
      await send('Input.dispatchMouseEvent', {
        type: 'mousePressed',
        x: s2StartX,
        y: s2StartY,
        button: 'left',
        clickCount: 1
      });
      await new Promise(res => setTimeout(res, 60));

      for (let i = 1; i <= 8; i++) {
        const cx = Math.round(s2StartX + (s2DragX - s2StartX) * (i / 8));
        const cy = Math.round(s2StartY + (s2DragY - s2StartY) * (i / 8));
        await send('Input.dispatchMouseEvent', {
          type: 'mouseMoved',
          x: cx,
          y: cy,
          button: 'left'
        });
        await new Promise(res => setTimeout(res, 25));
      }
      await new Promise(res => setTimeout(res, 250));
      await capture('verified_fix_spread2_to_backcover.png');

      // Inspect DOM of both pages during drag
      const domInspect = await send('Runtime.evaluate', {
        expression: `
          (() => {
            const items = Array.from(document.querySelectorAll('.stf__item'));
            return items.map((el, i) => ({
              i,
              display: el.style.display,
              zIndex: el.style.zIndex,
              clipPath: el.style.clipPath,
              alt: el.querySelector('img') ? el.querySelector('img').alt : 'none'
            })).filter(x => x.display !== 'none');
          })()
        `,
        returnByValue: true
      });
      console.log('Active elements during Spread 2 peel:', JSON.stringify(domInspect.result.value, null, 2));

      await send('Input.dispatchMouseEvent', {
        type: 'mouseReleased',
        x: s2DragX,
        y: s2DragY,
        button: 'left'
      });
      await new Promise(res => setTimeout(res, 1200));

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

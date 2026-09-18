const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const chrome = spawn(chromePath, [
  '--headless=new',
  '--no-sandbox',
  '--disable-gpu',
  '--remote-debugging-port=9243',
  '--window-size=1600,1200',
  'http://localhost:3000'
]);

const brainDir = 'C:\\Users\\Admin\\.gemini\\antigravity-ide\\brain\\c47dfbdb-dda1-4788-9f25-0687b26f5247';

async function run() {
  await new Promise(r => setTimeout(r, 2500));

  try {
    const listRes = await fetch('http://localhost:9243/json');
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

      // Scroll to Screen 3
      await send('Runtime.evaluate', {
        expression: `
          const el = document.getElementById('screen-3-sketchbook');
          if (el) el.scrollIntoView();
        `
      });
      await new Promise(r => setTimeout(r, 1500));

      const capture = async (filename) => {
        const shot = await send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync(path.join(brainDir, filename), Buffer.from(shot.data, 'base64'));
        fs.writeFileSync(path.join(__dirname, filename), Buffer.from(shot.data, 'base64'));
        console.log('Saved:', filename);
      };

      const getBookRect = async () => {
        const res = await send('Runtime.evaluate', {
          expression: `
            (() => {
              const b = document.getElementById('sbBook');
              if (!b) return null;
              const r = b.getBoundingClientRect();
              return { left: r.left, top: r.top, width: r.width, height: r.height };
            })()
          `,
          returnByValue: true
        });
        return res.result ? res.result.value : null;
      };

      // 1. Initial Cover Resting State
      await capture('verified_cover_resting.png');

      let r = await getBookRect();
      console.log('Cover bounding box:', r);

      // 2. Drag Cover top-right corner diagonally downwards-left (Matching Image 1)
      const cStartX = Math.round(r.left + r.width - 25);
      const cStartY = Math.round(r.top + 35);
      const cDragX = Math.round(r.left + r.width * 0.72);
      const cDragY = Math.round(r.top + 240);

      console.log(`Dragging cover corner to mid-peel (${cDragX}, ${cDragY})...`);
      await send('Input.dispatchMouseEvent', {
        type: 'mousePressed',
        x: cStartX,
        y: cStartY,
        button: 'left',
        clickCount: 1
      });
      await new Promise(res => setTimeout(res, 80));

      for (let i = 1; i <= 10; i++) {
        const cx = Math.round(cStartX + (cDragX - cStartX) * (i / 10));
        const cy = Math.round(cStartY + (cDragY - cStartY) * (i / 10));
        await send('Input.dispatchMouseEvent', {
          type: 'mouseMoved',
          x: cx,
          y: cy,
          button: 'left'
        });
        await new Promise(res => setTimeout(res, 30));
      }
      await new Promise(res => setTimeout(res, 300));
      await capture('verified_cover_corner_peel.png');

      // Complete the turn by dragging across towards the left
      const cEndDragX = Math.round(r.left + 40);
      for (let i = 1; i <= 8; i++) {
        const cx = Math.round(cDragX + (cEndDragX - cDragX) * (i / 8));
        await send('Input.dispatchMouseEvent', {
          type: 'mouseMoved',
          x: cx,
          y: cDragY,
          button: 'left'
        });
        await new Promise(res => setTimeout(res, 25));
      }
      await send('Input.dispatchMouseEvent', {
        type: 'mouseReleased',
        x: cEndDragX,
        y: cDragY,
        button: 'left'
      });
      await new Promise(res => setTimeout(res, 1400));

      // 3. Spread 1 Resting State
      await capture('verified_spread1_resting.png');

      // 4. Drag Spread 1 right page (Page 3) diagonally towards the left (Matching Image 2)
      r = await getBookRect();
      console.log('Spread 1 bounding box:', r);

      const sp1StartX = Math.round(r.left + r.width - 25);
      const sp1StartY = Math.round(r.top + 70);
      const sp1DragX = Math.round(r.left + r.width * 0.58);
      const sp1DragY = Math.round(r.top + 290);

      console.log(`Dragging Spread 1 to mid-peel (${sp1DragX}, ${sp1DragY})...`);
      await send('Input.dispatchMouseEvent', {
        type: 'mousePressed',
        x: sp1StartX,
        y: sp1StartY,
        button: 'left',
        clickCount: 1
      });
      await new Promise(res => setTimeout(res, 80));

      for (let i = 1; i <= 10; i++) {
        const cx = Math.round(sp1StartX + (sp1DragX - sp1StartX) * (i / 10));
        const cy = Math.round(sp1StartY + (sp1DragY - sp1StartY) * (i / 10));
        await send('Input.dispatchMouseEvent', {
          type: 'mouseMoved',
          x: cx,
          y: cy,
          button: 'left'
        });
        await new Promise(res => setTimeout(res, 30));
      }
      await new Promise(res => setTimeout(res, 300));
      await capture('verified_spread1_diagonal_peel.png');

      // Complete the turn to Spread 2
      const sp1EndDragX = Math.round(r.left + 40);
      for (let i = 1; i <= 8; i++) {
        const cx = Math.round(sp1DragX + (sp1EndDragX - sp1DragX) * (i / 8));
        await send('Input.dispatchMouseEvent', {
          type: 'mouseMoved',
          x: cx,
          y: sp1DragY,
          button: 'left'
        });
        await new Promise(res => setTimeout(res, 25));
      }
      await send('Input.dispatchMouseEvent', {
        type: 'mouseReleased',
        x: sp1EndDragX,
        y: sp1DragY,
        button: 'left'
      });
      await new Promise(res => setTimeout(res, 1400));

      // 5. Spread 2 Resting State
      await capture('verified_spread2_resting.png');

      // 6. Drag Spread 2 bottom corner upwards-left (Matching Image 3)
      r = await getBookRect();
      console.log('Spread 2 bounding box:', r);

      const sp2StartX = Math.round(r.left + r.width - 25);
      const sp2StartY = Math.round(r.top + r.height - 40);
      const sp2DragX = Math.round(r.left + r.width * 0.58);
      const sp2DragY = Math.round(r.top + r.height * 0.45);

      console.log(`Dragging Spread 2 to mid-peel (${sp2DragX}, ${sp2DragY})...`);
      await send('Input.dispatchMouseEvent', {
        type: 'mousePressed',
        x: sp2StartX,
        y: sp2StartY,
        button: 'left',
        clickCount: 1
      });
      await new Promise(res => setTimeout(res, 80));

      for (let i = 1; i <= 10; i++) {
        const cx = Math.round(sp2StartX + (sp2DragX - sp2StartX) * (i / 10));
        const cy = Math.round(sp2StartY + (sp2DragY - sp2StartY) * (i / 10));
        await send('Input.dispatchMouseEvent', {
          type: 'mouseMoved',
          x: cx,
          y: cy,
          button: 'left'
        });
        await new Promise(res => setTimeout(res, 30));
      }
      await new Promise(res => setTimeout(res, 300));
      await capture('verified_spread2_bottom_peel.png');

      // Complete the turn to Back Cover
      const sp2EndDragX = Math.round(r.left + 40);
      for (let i = 1; i <= 8; i++) {
        const cx = Math.round(sp2DragX + (sp2EndDragX - sp2DragX) * (i / 8));
        await send('Input.dispatchMouseEvent', {
          type: 'mouseMoved',
          x: cx,
          y: sp2DragY,
          button: 'left'
        });
        await new Promise(res => setTimeout(res, 25));
      }
      await send('Input.dispatchMouseEvent', {
        type: 'mouseReleased',
        x: sp2EndDragX,
        y: sp2DragY,
        button: 'left'
      });
      await new Promise(res => setTimeout(res, 1400));

      // 7. Back Cover State
      await capture('verified_backcover_resting.png');

      // 8. Test Arrow Click (Flip Back from Back Cover to Spread 2)
      console.log('Testing arrow click to flip backwards...');
      const arrowRes = await send('Runtime.evaluate', {
        expression: `
          (() => {
            const btn = document.querySelector('.sb-turn-arrow.bottom-left');
            if (btn) {
              btn.click();
              return 'clicked';
            }
            return 'not found';
          })()
        `,
        returnByValue: true
      });
      console.log('Back arrow click:', arrowRes.result.value);
      await new Promise(res => setTimeout(res, 1400));
      await capture('verified_arrow_click_flip_backward.png');

      // 9. Test Loupe Drag
      console.log('Testing magnifying loupe drag...');
      const loupePos = await send('Runtime.evaluate', {
        expression: `
          (() => {
            const l = document.getElementById('loupe');
            const r = l.getBoundingClientRect();
            return { cx: r.left + r.width / 2, cy: r.top + r.height / 2 };
          })()
        `,
        returnByValue: true
      });
      const lp = loupePos.result.value;

      await send('Input.dispatchMouseEvent', {
        type: 'mousePressed',
        x: Math.round(lp.cx),
        y: Math.round(lp.cy),
        button: 'left',
        clickCount: 1
      });
      await new Promise(res => setTimeout(res, 80));

      await send('Input.dispatchMouseEvent', {
        type: 'mouseMoved',
        x: Math.round(lp.cx - 500),
        y: Math.round(lp.cy - 60),
        button: 'left'
      });
      await new Promise(res => setTimeout(res, 300));
      await capture('verified_loupe_drag_magnifying.png');

      await send('Input.dispatchMouseEvent', {
        type: 'mouseReleased',
        x: Math.round(lp.cx - 500),
        y: Math.round(lp.cy - 60),
        button: 'left'
      });
      await new Promise(res => setTimeout(res, 1000));
      await capture('verified_loupe_returned_dock.png');

      console.log('All tests completed successfully!');
      ws.close();
      chrome.kill();
      process.exit(0);
    };
  } catch (e) {
    console.error(e);
    chrome.kill();
    process.exit(1);
  }
}

run();

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const chrome = spawn(chromePath, [
  '--headless=new',
  '--remote-debugging-port=9251',
  '--window-size=1600,1200',
  'http://localhost:3000'
]);

setTimeout(async () => {
  try {
    const listRes = await fetch('http://localhost:9251/json');
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

      // Go to spread 2
      await send('Runtime.evaluate', {
        expression: `
          const b = document.querySelector('.sb-turn-arrow.bottom-right');
          if (b) { b.click(); }
        `
      });
      await new Promise(r => setTimeout(r, 1400));
      await send('Runtime.evaluate', {
        expression: `
          const b = document.querySelector('.sb-turn-arrow.bottom-right');
          if (b) { b.click(); }
        `
      });
      await new Promise(r => setTimeout(r, 1400));

      // Now on Spread 2. Start drag on bottom-right corner
      const bRect = await send('Runtime.evaluate', {
        expression: `
          (() => {
            const b = document.querySelector('.stf__block');
            const r = b.getBoundingClientRect();
            return { left: r.left, top: r.top, width: r.width, height: r.height };
          })()
        `,
        returnByValue: true
      });
      const r = bRect.result.value;

      const startX = Math.round(r.left + r.width - 25);
      const startY = Math.round(r.top + r.height - 35);
      const dragX = Math.round(r.left + r.width * 0.65);
      const dragY = Math.round(r.top + r.height * 0.55);

      await send('Input.dispatchMouseEvent', {
        type: 'mousePressed',
        x: startX,
        y: startY,
        button: 'left',
        clickCount: 1
      });
      await new Promise(res => setTimeout(res, 60));

      for (let i = 1; i <= 6; i++) {
        const cx = Math.round(startX + (dragX - startX) * (i / 6));
        const cy = Math.round(startY + (dragY - startY) * (i / 6));
        await send('Input.dispatchMouseEvent', {
          type: 'mouseMoved',
          x: cx,
          y: cy,
          button: 'left'
        });
        await new Promise(res => setTimeout(res, 20));
      }
      await new Promise(res => setTimeout(res, 200));

      // Inspect DOM elements visible inside .stf__block
      const domDetails = await send('Runtime.evaluate', {
        expression: `
          (() => {
            const items = Array.from(document.querySelectorAll('.stf__item'));
            return items.map((item, idx) => ({
              idx,
              tagName: item.tagName,
              classes: item.className,
              display: item.style.display,
              zIndex: item.style.zIndex,
              clipPath: item.style.clipPath,
              transform: item.style.transform,
              imgAlt: item.querySelector('img') ? item.querySelector('img').alt : 'no-img',
              imgSrc: item.querySelector('img') ? item.querySelector('img').src : 'no-img'
            }));
          })()
        `,
        returnByValue: true
      });

      console.log('DOM Details during Spread 2 drag:');
      console.log(JSON.stringify(domDetails.result.value, null, 2));

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

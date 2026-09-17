const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless=new',
  '--no-sandbox',
  '--disable-gpu',
  '--remote-debugging-port=9226',
  '--window-size=1600,1200',
  'http://localhost:3000'
]);

async function run() {
  await new Promise(r => setTimeout(r, 2000));
  try {
    const listRes = await fetch('http://localhost:9226/json');
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

      // Check DOM and inspect what happened
      const info1 = await send('Runtime.evaluate', {
        expression: `JSON.stringify({
          bookWidth: document.getElementById('sbBook').clientWidth,
          bookHeight: document.getElementById('sbBook').clientHeight,
          classes: document.getElementById('sb3d').className,
          children: Array.from(document.getElementById('sbBook').children).map(c => c.className)
        })`
      });
      console.log('State 0 info:', info1.result.value);

      // Now trigger turn and check intermediate state
      console.log('Simulating pointer drag from right to left...');
      // Pointer drag across sbBook
      const dragResult = await send('Runtime.evaluate', {
        expression: `(() => {
          const book = document.getElementById('sbBook');
          const stage = document.getElementById('sbStage');
          const r = book.getBoundingClientRect();
          const startX = r.left + r.width * 0.85;
          const startY = r.top + r.height * 0.5;

          // Dispatch pointerdown
          stage.dispatchEvent(new PointerEvent('pointerdown', {
            bubbles: true,
            cancelable: true,
            clientX: startX,
            clientY: startY,
            button: 0,
            pointerId: 1
          }));

          // Dispatch pointermove halfway (50% drag)
          const midX = r.left + r.width * 0.40;
          stage.dispatchEvent(new PointerEvent('pointermove', {
            bubbles: true,
            cancelable: true,
            clientX: midX,
            clientY: startY,
            pointerId: 1
          }));

          return {
            bookChildren: Array.from(book.children).map(c => c.className),
            curlExists: !!book.querySelector('.curl'),
            stripCount: book.querySelectorAll('.strip').length,
            tt: getComputedStyle(document.getElementById('sb3d')).getPropertyValue('--tt'),
            td: getComputedStyle(document.getElementById('sb3d')).getPropertyValue('--td')
          };
        })()`
      });
      console.log('Mid-drag info:', dragResult.result.value);

      // Capture screenshot while held at mid-drag
      const snap = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(path.resolve(__dirname, '..', 'public', 'sketchbook', 'test_drag_curl.png'), Buffer.from(snap.data, 'base64'));
      console.log('Saved test_drag_curl.png!');

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

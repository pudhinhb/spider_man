const { spawn } = require('child_process');

const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless=new',
  '--no-sandbox',
  '--disable-gpu',
  '--remote-debugging-port=9229',
  '--window-size=1600,1200',
  'http://localhost:3000'
]);

setTimeout(async () => {
  try {
    const listRes = await fetch('http://localhost:9229/json');
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
      await send('Console.enable');
      await send('Log.enable');
      await new Promise(r => setTimeout(r, 2000));

      const res = await send('Runtime.evaluate', {
        expression: `(() => {
          const btn = document.querySelector('nextjs-portal');
          const toast = document.querySelector('[data-nextjs-toast]');
          const errors = Array.from(document.querySelectorAll('.nextjs-container-errors-header, [data-nextjs-dialog]')).map(e => e.innerText);
          return {
            hasPortal: !!btn,
            toastText: toast ? toast.innerText : null,
            errors
          };
        })()`
      });
      console.log('Issue detail:', JSON.stringify(res.result.value));

      ws.close();
      chrome.kill();
      process.exit(0);
    };
  } catch(e) {
    console.error(e);
    chrome.kill();
    process.exit(1);
  }
}, 2000);

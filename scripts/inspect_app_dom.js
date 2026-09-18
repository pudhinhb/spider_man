const { spawn } = require('child_process');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const chrome = spawn(chromePath, [
  '--headless=new',
  '--remote-debugging-port=9241',
  '--window-size=1600,1200',
  'http://localhost:3000'
]);

setTimeout(async () => {
  try {
    const r = await fetch('http://localhost:9241/json');
    const targets = await r.json();
    console.log('Available targets:', targets.map(t => ({ url: t.url, type: t.type })));
    const target = targets.find(t => t.url.includes('3000') && t.type === 'page') || targets.find(t => t.type === 'page');
    const ws = new WebSocket(target.webSocketDebuggerUrl);

    let id = 1;
    const send = (m, p = {}) => new Promise((resolve, reject) => {
      const mid = id++;
      const h = (e) => {
        const d = JSON.parse(e.data);
        if (d.id === mid) {
          ws.removeEventListener('message', h);
          if (d.error) reject(d.error);
          else resolve(d.result);
        }
      };
      ws.addEventListener('message', h);
      ws.send(JSON.stringify({ id: mid, method: m, params: p }));
    });

    ws.onopen = async () => {
      await send('Page.enable');
      await send('Runtime.enable');

      const bodyRes = await send('Runtime.evaluate', {
        expression: `(() => ({
          url: window.location.href,
          title: document.title,
          sections: Array.from(document.querySelectorAll('section')).map(s => s.id),
          buttons: Array.from(document.querySelectorAll('.sb-turn-arrow')).map(b => b.className)
        }))()`,
        returnByValue: true
      });

      console.log('Page info:', JSON.stringify(bodyRes.result.value, null, 2));

      ws.close();
      chrome.kill();
      process.exit(0);
    };
  } catch (err) {
    console.error(err);
    chrome.kill();
    process.exit(1);
  }
}, 3000);

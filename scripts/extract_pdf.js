const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const PORT = 3847;
const pdfPath = path.resolve(__dirname, '..', 'LearnRyce Brochure Updated.pdf');
const outDir = path.resolve(__dirname, '..', 'public', 'brochure');

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  
  if (url.pathname === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`
      <!DOCTYPE html>
      <html>
      <head>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>
        <script>
          pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        </script>
      </head>
      <body>
        <div id="status">Loading PDF...</div>
        <script>
          async function renderAll() {
            try {
              const status = document.getElementById('status');
              status.innerText = 'Fetching PDF...';
              const loadingTask = pdfjsLib.getDocument('/pdf');
              const pdf = await loadingTask.promise;
              status.innerText = 'PDF Loaded, total pages: ' + pdf.numPages;

              for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
                status.innerText = 'Rendering page ' + pageNum + '...';
                const page = await pdf.getPage(pageNum);
                
                // Render at good resolution (e.g. width ~1200-1600px)
                const unscaledViewport = page.getViewport({ scale: 1 });
                const targetWidth = 1400;
                const scale = targetWidth / unscaledViewport.width;
                const viewport = page.getViewport({ scale: scale });

                const canvas = document.createElement('canvas');
                canvas.width = viewport.width;
                canvas.height = viewport.height;
                const ctx = canvas.getContext('2d');

                await page.render({
                  canvasContext: ctx,
                  viewport: viewport
                }).promise;

                // Send dataURL to server
                const dataUrl = canvas.toDataURL('image/png');
                await fetch('/save?page=' + pageNum, {
                  method: 'POST',
                  headers: { 'Content-Type': 'text/plain' },
                  body: dataUrl
                });
              }

              status.innerText = 'ALL_DONE';
              await fetch('/done');
            } catch (err) {
              document.getElementById('status').innerText = 'ERROR: ' + err.message;
              fetch('/error?msg=' + encodeURIComponent(err.message));
            }
          }
          renderAll();
        </script>
      </body>
      </html>
    `);
  } else if (url.pathname === '/pdf') {
    const pdfBuf = fs.readFileSync(pdfPath);
    res.writeHead(200, { 'Content-Type': 'application/pdf', 'Content-Length': pdfBuf.length });
    res.end(pdfBuf);
  } else if (url.pathname === '/save' && req.method === 'POST') {
    const pageNum = url.searchParams.get('page');
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      const base64Data = body.replace(/^data:image\/png;base64,/, '');
      const outFilePath = path.join(outDir, `page-${pageNum}.png`);
      fs.writeFileSync(outFilePath, Buffer.from(base64Data, 'base64'));
      console.log(`Saved page-${pageNum}.png`);
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end('OK');
    });
  } else if (url.pathname === '/done') {
    console.log('Rendering finished successfully!');
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('OK');
    setTimeout(() => {
      process.exit(0);
    }, 500);
  } else if (url.pathname === '/error') {
    console.error('Error in browser:', url.searchParams.get('msg'));
    res.writeHead(200);
    res.end('OK');
    process.exit(1);
  } else {
    res.writeHead(404);
    res.end();
  }
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`Server running at http://127.0.0.1:${PORT}`);
  
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const browserExe = fs.existsSync(chromePath) ? chromePath : edgePath;

  console.log('Launching browser:', browserExe);
  const child = spawn(browserExe, [
    '--headless=new',
    '--no-sandbox',
    '--disable-gpu',
    `http://127.0.0.1:${PORT}/`
  ], { stdio: 'inherit' });

  child.on('exit', (code) => {
    console.log('Browser exited with code', code);
  });
});

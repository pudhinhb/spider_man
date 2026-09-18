const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const PORT = 3848;
const brochureDir = path.resolve(__dirname, '..', 'public', 'brochure');
const outDir = path.resolve(__dirname, '..', 'public', 'sketchbook');

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// Check that brochure pages exist
for (let i = 1; i <= 6; i++) {
  const p = path.join(brochureDir, `page-${i}.png`);
  if (!fs.existsSync(p)) {
    console.error(`Missing ${p}`);
    process.exit(1);
  }
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  
  if (url.pathname === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Spread Generator</title>
        <style>
          body { background: #111; color: #eee; font-family: sans-serif; padding: 20px; }
          canvas { border: 1px solid #444; margin: 10px 0; }
        </style>
      </head>
      <body>
        <h2>Generating 1760x1240 Sketchbook Spreads...</h2>
        <div id="status">Loading assets...</div>
        <canvas id="cv" width="1760" height="1240" style="display:none;"></canvas>

        <script>
          const CW = 1760, CH = 1240;
          // Book geometry matching Meng To's sketchbook:
          // SPAN = 0.449, PG = 0.218
          // Left margin = (0.5 - 0.449) * 1760 = 89.76px (~90px)
          // Right margin = (0.5 + 0.449) * 1760 = 1670.24px (~1670px)
          // Top margin = 0.218 * 1240 = 270.32px (~270px)
          // Bottom margin = (1 - 0.218) * 1240 = 969.68px (~970px)
          // Book Width = 1580.48px (~1580px)
          // Book Height = 699.36px (~700px)
          // Spine Center = 880px

          const cv = document.getElementById('cv');
          const ctx = cv.getContext('2d');

          function loadImage(src) {
            return new Promise((resolve, reject) => {
              const img = new Image();
              img.onload = () => resolve(img);
              img.onerror = reject;
              img.src = src;
            });
          }

          function drawRoundedRect(ctx, x, y, w, h, r) {
            ctx.beginPath();
            ctx.moveTo(x + r.tl, y);
            ctx.lineTo(x + w - r.tr, y);
            ctx.quadraticCurveTo(x + w, y, x + w, y + r.tr);
            ctx.lineTo(x + w, y + h - r.br);
            ctx.quadraticCurveTo(x + w, y + h, x + w - r.br, y + h);
            ctx.lineTo(x + r.bl, y + h);
            ctx.quadraticCurveTo(x, y + h, x, y + h - r.bl);
            ctx.lineTo(x, y + r.tl);
            ctx.quadraticCurveTo(x, y, x + r.tl, y);
            ctx.closePath();
          }

          function renderBookBase() {
            ctx.clearRect(0, 0, CW, CH);

            const bx = 90, by = 270, bw = 1580, bh = 700;
            const spine = 880;

            // 1. Book background shadow / page stack edge simulation
            ctx.save();
            ctx.fillStyle = '#dfd9cc';
            drawRoundedRect(ctx, bx - 2, by - 2, bw + 4, bh + 5, { tl: 14, tr: 14, bl: 14, br: 14 });
            ctx.fill();

            // Page edge lines on sides
            ctx.strokeStyle = 'rgba(70, 55, 35, 0.18)';
            ctx.lineWidth = 1;
            ctx.stroke();
            ctx.restore();

            // 2. Open pages surface
            ctx.save();
            // Left page
            const lgrad = ctx.createLinearGradient(bx, by, spine, by);
            lgrad.addColorStop(0, '#f9f6f0');
            lgrad.addColorStop(0.7, '#fdfbf7');
            lgrad.addColorStop(0.96, '#ece7dc');
            lgrad.addColorStop(1, '#d8d1c0');
            ctx.fillStyle = lgrad;
            drawRoundedRect(ctx, bx, by, spine - bx, bh, { tl: 12, tr: 2, bl: 12, br: 2 });
            ctx.fill();

            // Right page
            const rgrad = ctx.createLinearGradient(spine, by, bx + bw, by);
            rgrad.addColorStop(0, '#d8d1c0');
            rgrad.addColorStop(0.04, '#ece7dc');
            rgrad.addColorStop(0.3, '#fdfbf7');
            rgrad.addColorStop(1, '#f9f6f0');
            ctx.fillStyle = rgrad;
            drawRoundedRect(ctx, spine, by, (bx + bw) - spine, bh, { tl: 2, tr: 12, bl: 2, br: 12 });
            ctx.fill();
            ctx.restore();

            // 3. Center spine depth crease
            ctx.save();
            const spineGrad = ctx.createLinearGradient(spine - 24, by, spine + 24, by);
            spineGrad.addColorStop(0, 'rgba(40, 28, 12, 0)');
            spineGrad.addColorStop(0.35, 'rgba(40, 28, 12, 0.08)');
            spineGrad.addColorStop(0.48, 'rgba(30, 20, 8, 0.38)');
            spineGrad.addColorStop(0.52, 'rgba(30, 20, 8, 0.38)');
            spineGrad.addColorStop(0.65, 'rgba(40, 28, 12, 0.08)');
            spineGrad.addColorStop(1, 'rgba(40, 28, 12, 0)');
            ctx.fillStyle = spineGrad;
            ctx.fillRect(spine - 24, by, 48, bh);
            ctx.restore();

            // Subtle paper grain overlay
            ctx.save();
            ctx.fillStyle = 'rgba(215, 200, 180, 0.04)';
            for (let i = 0; i < 120; i++) {
              const gx = bx + Math.random() * bw;
              const gy = by + Math.random() * bh;
              ctx.fillRect(gx, gy, 2, 2);
            }
            ctx.restore();
          }

          // Function to draw a brochure page onto a side ('left' or 'right')
          function drawBrochurePage(img, side) {
            const bx = 90, by = 270, bw = 1580, bh = 700;
            const spine = 880;
            const sideWidth = (bw / 2); // 790px

            // Target dimensions for portrait page inside 790x700 area
            // With elegant margins: height = 660px, width = 660 / (1981 / 1399) = 466px
            const pHeight = 654;
            const pWidth = Math.round(pHeight * (img.width / img.height)); // ~462px
            const py = by + Math.round((bh - pHeight) / 2); // 270 + 23 = 293px

            let px;
            if (side === 'left') {
              // Center in left page, slightly towards outer edge
              px = bx + Math.round((sideWidth - pWidth) / 2) - 10;
            } else {
              // Center in right page, slightly towards outer edge
              px = spine + Math.round((sideWidth - pWidth) / 2) + 10;
            }

            // Draw subtle page frame / drop shadow on paper
            ctx.save();
            ctx.shadowColor = 'rgba(35, 25, 12, 0.16)';
            ctx.shadowBlur = 10;
            ctx.shadowOffsetX = side === 'left' ? -2 : 3;
            ctx.shadowOffsetY = 4;

            // White paper border
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(px - 4, py - 4, pWidth + 8, pHeight + 8);
            ctx.restore();

            // Draw the brochure image
            ctx.drawImage(img, px, py, pWidth, pHeight);

            // Subtle page border line
            ctx.save();
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.08)';
            ctx.lineWidth = 1;
            ctx.strokeRect(px, py, pWidth, pHeight);
            ctx.restore();
          }

          // Draw an elegant editorial companion page on the other side
          function drawCompanionPage(side, data) {
            const bx = 90, by = 270, bw = 1580, bh = 700;
            const spine = 880;
            const sideWidth = (bw / 2);

            let cx, cy = by + 60;
            if (side === 'left') {
              cx = bx + 70;
            } else {
              cx = spine + 70;
            }

            ctx.save();
            // Section Category / Tracker
            ctx.fillStyle = '#8b6f48';
            ctx.font = '600 12.5px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
            ctx.letterSpacing = '0.18em';
            ctx.fillText(data.category.toUpperCase(), cx, cy);

            // Reset letter-spacing for title and body
            ctx.letterSpacing = '0px';

            // Large Editorial Title
            cy += 40;
            ctx.fillStyle = '#1c1b18';
            ctx.font = 'bold 28px "Georgia", "Times New Roman", serif';
            ctx.fillText(data.title, cx, cy);

            // Subtitle
            if (data.subtitle) {
              cy += 26;
              ctx.fillStyle = '#5a5449';
              ctx.font = 'italic 16px "Georgia", serif';
              ctx.fillText(data.subtitle, cx, cy);
            }

            // Divider Line
            cy += 24;
            ctx.strokeStyle = 'rgba(139, 111, 72, 0.35)';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.lineTo(cx + 470, cy);
            ctx.stroke();

            // Body Paragraphs
            cy += 32;
            ctx.fillStyle = '#38342e';
            ctx.font = '14.5px/1.65 -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

            data.paragraphs.forEach(p => {
              // Word wrap text
              const words = p.split(' ');
              let line = '';
              const maxWidth = 470;
              for (let n = 0; n < words.length; n++) {
                const testLine = line + words[n] + ' ';
                const metrics = ctx.measureText(testLine);
                if (metrics.width > maxWidth && n > 0) {
                  ctx.fillText(line, cx, cy);
                  line = words[n] + ' ';
                  cy += 23;
                } else {
                  line = testLine;
                }
              }
              ctx.fillText(line, cx, cy);
              cy += 26;
            });

            // Highlight Cards / Key Points
            if (data.highlights && data.highlights.length) {
              cy += 8;
              data.highlights.forEach((h, idx) => {
                const hx = cx;
                const hy = cy;
                const hw = 470;
                const hh = 42;

                ctx.fillStyle = 'rgba(240, 235, 222, 0.75)';
                drawRoundedRect(ctx, hx, hy, hw, hh, { tl: 6, tr: 6, bl: 6, br: 6 });
                ctx.fill();
                ctx.strokeStyle = 'rgba(139, 111, 72, 0.22)';
                ctx.stroke();

                // Bullet dot
                ctx.fillStyle = '#9a6a3e';
                ctx.beginPath();
                ctx.arc(hx + 18, hy + hh / 2, 4, 0, Math.PI * 2);
                ctx.fill();

                // Text
                ctx.fillStyle = '#22201c';
                ctx.font = '500 13px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
                ctx.letterSpacing = '0px';
                ctx.fillText(h, hx + 34, hy + 26);

                cy += 48;
              });
            }

            // Footer Stamp / Page Indicator
            ctx.fillStyle = '#8f887b';
            ctx.font = '11px monospace';
            ctx.letterSpacing = '0.15em';
            ctx.fillText(data.footer || 'LEARNRYCE · SHARVESH GLOBAL EDUCATION', cx, by + bh - 32);

            ctx.restore();
          }

          async function generateAllSpreads() {
            const status = document.getElementById('status');
            status.innerText = 'Loading all 6 brochure images...';

            const pages = [];
            for (let i = 1; i <= 6; i++) {
              pages.push(await loadImage('/brochure/page-' + i + '.png'));
            }

            // Spread Definitions: Each spread pairs the high-res brochure page with an exquisite companion editorial plate!
            const spreadsConfig = [
              // Spread 0: Cover
              {
                id: 0,
                draw: () => {
                  renderBookBase();
                  drawCompanionPage('left', {
                    category: 'Official Academic Portfolio',
                    title: 'LearnRyce Global Education',
                    subtitle: 'From Learner to Leader',
                    paragraphs: [
                      'Welcome to the comprehensive portfolio of LearnRyce, the premier education advisory and overseas consulting partner headquartered in Coimbatore.',
                      'With over 13+ years of distinguished experience, guiding 1000+ students toward top-ranked universities worldwide.',
                      'Flip through the pages using the navigation arrows, or drag across the page to inspect every detail with our high-precision magnifying glass.'
                    ],
                    highlights: [
                      '13+ Years of Global Counselling Experience',
                      'Direct Tie-ups with 621+ Global Universities',
                      'Comprehensive Support: SOP, Visa, IELTS & Language'
                    ],
                    footer: 'PLATE 01 · LEARNRYCE OVERVIEW'
                  });
                  drawBrochurePage(pages[0], 'right'); // Page 1
                }
              },
              // Spread 1: About Us
              {
                id: 1,
                draw: () => {
                  renderBookBase();
                  drawBrochurePage(pages[1], 'left'); // Page 2
                  drawCompanionPage('right', {
                    category: 'Institutional Philosophy',
                    title: 'Empowering Dreams & Futures',
                    subtitle: 'Mission, Vision & Albert Einstein Legacy',
                    paragraphs: [
                      'At LearnRyce™, we believe the right guidance can transform a student’s future. We empower students with clarity, confidence, and direction at every critical milestone.',
                      '“Everybody is a genius. But if you judge a fish by its ability to climb a tree, it will live its whole life believing that it is stupid.” — Albert Einstein',
                      'Our personalized mentoring uncovers each student’s genuine calling and provides the roadmap to world-class academic institutions.'
                    ],
                    highlights: [
                      'Mission: Empower students with knowledge & tools',
                      'Vision: Trusted international higher education partner',
                      'Holistic Career & Aptitude Diagnostics'
                    ],
                    footer: 'PLATE 02 · ABOUT US & MISSION'
                  });
                }
              },
              // Spread 2: Career Counselling
              {
                id: 2,
                draw: () => {
                  renderBookBase();
                  drawCompanionPage('left', {
                    category: 'Comprehensive Guidance',
                    title: 'Career Counselling Program',
                    subtitle: '55-Minute Focused Discovery Sessions',
                    paragraphs: [
                      'Whether in school, college, or evaluating career transitions, our certified counsellors combine AI-powered diagnostic tools with 13+ years of real-world domain expertise.',
                      'We provide scientific, bias-free guidance that maps personality, interest profiles, and future industry trends to long-term career success.'
                    ],
                    highlights: [
                      'Psychometric & Aptitude Scientific Assessment',
                      'Customized Step-by-Step Career Roadmap',
                      'Course & University Shortlisting (India & Abroad)',
                      'Parent-Student Joint Action Summary'
                    ],
                    footer: 'PLATE 03 · CAREER COUNSELLING'
                  });
                  drawBrochurePage(pages[2], 'right'); // Page 3
                }
              },
              // Spread 3: Study Abroad
              {
                id: 3,
                draw: () => {
                  renderBookBase();
                  drawBrochurePage(pages[3], 'left'); // Page 4
                  drawCompanionPage('right', {
                    category: 'International Admissions',
                    title: 'Study Abroad With Confidence',
                    subtitle: '621 Universities Across 9 Global Regions',
                    paragraphs: [
                      'From MBBS in Russia, Europe, and Central Asia to Engineering, Arts, and Management in Canada, USA, UK, Australia, and New Zealand.',
                      'Our end-to-end guidance covers university selection, high-impact SOP documentation, interview readiness, visa filing, and pre-departure briefings.'
                    ],
                    highlights: [
                      'Tier-1 Universities in UK, USA, Canada & Australia',
                      'Specialized MBBS Programs in Russia, Europe, Asia',
                      'Strong Visa Success Track Record & SOP Support',
                      'Dedicated Post-Study & Career Settlement Guidance'
                    ],
                    footer: 'PLATE 04 · STUDY ABROAD'
                  });
                }
              },
              // Spread 4: Language Training
              {
                id: 4,
                draw: () => {
                  renderBookBase();
                  drawCompanionPage('left', {
                    category: 'Global Communication',
                    title: 'Language Training Centre',
                    subtitle: 'French · German · Japanese · Spoken English',
                    paragraphs: [
                      'Immersive, career-focused language training programs designed by linguistic specialists in Coimbatore. Equip yourself for global workplaces and overseas university admissions.',
                      'Our cultural immersion modules emphasize spoken fluency, native accent mastery, and rigorous international exam preparation.'
                    ],
                    highlights: [
                      'German Language Training (Goethe-Zertifikat Prep)',
                      'French Language Training (DELF/DALF Prep)',
                      'Japanese Language Proficiency Test (JLPT Prep)',
                      'IELTS & Spoken English Fluency Mastery'
                    ],
                    footer: 'PLATE 05 · LANGUAGE TRAINING'
                  });
                  drawBrochurePage(pages[4], 'right'); // Page 5
                }
              },
              // Spread 5: Why Students Trust Us & Contact
              {
                id: 5,
                draw: () => {
                  renderBookBase();
                  drawBrochurePage(pages[5], 'left'); // Page 6
                  drawCompanionPage('right', {
                    category: 'Corporate Trust & Locations',
                    title: 'Why Students Trust LearnRyce',
                    subtitle: 'Visit Our Coimbatore Hubs or Connect Online',
                    paragraphs: [
                      'Transparent process with no fake promises or hidden fees. Over 1000+ students placed in top global universities with proven profile-specific SOP mentorship.',
                      'Trusted by parents, colleges, and international education bodies across India and abroad.'
                    ],
                    highlights: [
                      'Phone: +91 96007 16624 / +91 90039 76624',
                      'Email: chaku@learnryce.in | www.learnryce.com',
                      'Registered Office: Sungam Bypass Road, Coimbatore',
                      'Branch Office: Green Trends Bldg, Ramanathapuram'
                    ],
                    footer: 'PLATE 06 · TRUST & DIRECTORY'
                  });
                }
              }
            ];

            for (const cfg of spreadsConfig) {
              status.innerText = 'Rendering spread ' + cfg.id + '...';
              cfg.draw();

              const dataUrl = cv.toDataURL('image/png');
              await fetch('/save?id=' + cfg.id, {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain' },
                body: dataUrl
              });
            }

            status.innerText = 'ALL SPREADS GENERATED!';
            await fetch('/done');
          }

          generateAllSpreads();
        </script>
      </body>
      </html>
    `);
  } else if (url.pathname.startsWith('/brochure/')) {
    const filename = path.basename(url.pathname);
    const filePath = path.join(brochureDir, filename);
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath);
      res.writeHead(200, { 'Content-Type': 'image/png', 'Content-Length': data.length });
      res.end(data);
    } else {
      res.writeHead(404);
      res.end();
    }
  } else if (url.pathname === '/save' && req.method === 'POST') {
    const id = url.searchParams.get('id');
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      const base64Data = body.replace(/^data:image\/png;base64,/, '');
      const outFilePath = path.join(outDir, `spread-${id}.png`);
      fs.writeFileSync(outFilePath, Buffer.from(base64Data, 'base64'));
      console.log(`Saved spread-${id}.png`);
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end('OK');
    });
  } else if (url.pathname === '/done') {
    console.log('Spreads generation complete!');
    res.writeHead(200);
    res.end('OK');
    setTimeout(() => process.exit(0), 500);
  } else {
    res.writeHead(404);
    res.end();
  }
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`Spread Generator Server running at http://127.0.0.1:${PORT}`);
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const browserExe = fs.existsSync(chromePath) ? chromePath : edgePath;

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

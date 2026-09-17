const { PageFlip } = require('page-flip');
const { JSDOM } = require('jsdom');

const dom = new JSDOM(`<!DOCTYPE html><html><body><div id="book">
  <div class="page" data-density="soft">1</div>
  <div class="page" data-density="soft">2</div>
  <div class="page" data-density="soft">3</div>
  <div class="page" data-density="soft">4</div>
  <div class="page" data-density="soft">5</div>
  <div class="page" data-density="soft">6</div>
</div></body></html>`, { pretendToBeVisual: true });

global.window = dom.window;
global.document = dom.window.document;
global.HTMLElement = dom.window.HTMLElement;
global.requestAnimationFrame = (fn) => setTimeout(fn, 16);

console.log('JSDOM loaded.');

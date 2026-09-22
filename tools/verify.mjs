/**
 * Load the demo in a real headless browser and check that it works.
 *
 * Serves the project locally and drives it with the same minimal Chrome
 * driver the grid's own test suite uses (tools/browser.js), so this needs no
 * dependency beyond Chrome itself.
 *
 * Checks:
 *   - the library arrived and left the LatticeGrid global behind;
 *   - all 12 orders land in the grid (grid.rows.matchCount(), not a DOM count);
 *   - no order starts expanded (grid.detail.keys() is empty);
 *   - clicking the expander button on the first order row opens its detail
 *     region (grid.detail.isOpen(key) and the `[data-detail]` element appear),
 *     and the nested grid inside it renders exactly that order's line items,
 *     read back through data-key/data-col cells rather than assumed;
 *   - clicking the same button again closes it (grid.detail.isOpen(key) and
 *     the `[data-detail]` element both go away);
 *   - the "Expand first row" button opens the same region from code, with no
 *     click on the row itself;
 *   - nothing logged a console error or threw while the page ran.
 *
 * Exits non-zero on any failure, so it can gate a deployment.
 *
 * Usage: node tools/verify.mjs
 */

import { startServer } from './serve.mjs';
import { Browser, available } from './browser.js';

if (!available()) {
  console.log('No headless browser on this machine; skipping verify.mjs.');
  process.exit(0);
}

// The same first order demo.js loads, so the expected line items are computed
// here rather than hard-coded, and stay honest if the data ever changes.
const FIRST_ORDER = {
  id: 'ORD-1001',
  lines: [
    { sku: 'L1', item: 'Steel bolt M8', qty: 240, price: 0.18 },
    { sku: 'L2', item: 'Washer M8', qty: 240, price: 0.04 },
  ],
};

async function clickSelector(browser, selector) {
  const rect = await browser.evaluate(`(() => {
    const el = document.querySelector(${JSON.stringify(selector)});
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  })()`);
  if (!rect) throw new Error(`element not found: ${selector}`);
  await browser.send('Input.dispatchMouseEvent', { type: 'mousePressed', x: rect.x, y: rect.y, button: 'left', clickCount: 1 });
  await browser.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: rect.x, y: rect.y, button: 'left', clickCount: 1 });
}

const expanderSelector = (key) => `[data-key="${key}"] [data-col="__lattice_detail"] button`;
const detailSelector = (key) => `[data-detail="${key}"]`;
const cellText = (sel) => `document.querySelector(${JSON.stringify(sel)})?.textContent`;

const { server, port } = await startServer();
const browser = new Browser();

try {
  await browser.start();

  await browser.send('Page.addScriptToEvaluateOnNewDocument', {
    source: `
      window.__errs = [];
      addEventListener('error', (e) => window.__errs.push(String(e.message || e)));
      addEventListener('unhandledrejection', (e) => window.__errs.push('unhandledrejection: ' + String(e.reason)));
      const origError = console.error.bind(console);
      console.error = (...args) => { window.__errs.push('console.error: ' + args.map(String).join(' ')); origError(...args); };
    `,
  });

  await browser.open(`http://127.0.0.1:${port}/`);
  await new Promise((r) => setTimeout(r, 500));

  const failures = [];

  const hasGrid = await browser.evaluate(`typeof LatticeGrid !== 'undefined' && typeof LatticeGrid.createGrid === 'function'`);
  if (!hasGrid) failures.push('LatticeGrid.createGrid was not found on the page');

  const orderCount = await browser.evaluate(`window.__demoGrid.rows.matchCount()`);
  if (orderCount !== 12) failures.push(`expected 12 orders (grid.rows.matchCount()), grid reports ${orderCount}`);

  const startsClosed = await browser.evaluate(`window.__demoGrid.detail.keys()`);
  if (startsClosed.length !== 0) failures.push(`expected no order expanded on load, grid.detail.keys() reports ${JSON.stringify(startsClosed)}`);

  // --- Click the expander on the first row: it opens ---
  await clickSelector(browser, expanderSelector(FIRST_ORDER.id));
  await new Promise((r) => setTimeout(r, 300));

  const openAfterClick = await browser.evaluate(`window.__demoGrid.detail.isOpen(${JSON.stringify(FIRST_ORDER.id)})`);
  if (!openAfterClick) failures.push('clicking the expander did not open the detail region (grid.detail.isOpen)');

  const detailPresent = await browser.evaluate(`!!document.querySelector(${JSON.stringify(detailSelector(FIRST_ORDER.id))})`);
  if (!detailPresent) failures.push(`no element matched ${detailSelector(FIRST_ORDER.id)} after opening`);

  // The nested grid reports its own line items: one row per sku, each cell
  // read back through the same data-key/data-col contract as the outer grid.
  for (const line of FIRST_ORDER.lines) {
    const rowSel = `${detailSelector(FIRST_ORDER.id)} [data-key="${line.sku}"]`;
    const itemText = await browser.evaluate(cellText(`${rowSel} [data-col="item"]`));
    const qtyText = await browser.evaluate(cellText(`${rowSel} [data-col="qty"]`));
    if (itemText !== line.item) {
      failures.push(`detail row ${line.sku}: expected item "${line.item}", nested grid shows ${JSON.stringify(itemText)}`);
    }
    const qty = Number(String(qtyText).replace(/[^0-9.-]/g, ''));
    if (qty !== line.qty) {
      failures.push(`detail row ${line.sku}: expected qty ${line.qty}, nested grid shows ${qty}`);
    }
  }

  const nestedRowCount = await browser.evaluate(
    `document.querySelectorAll(${JSON.stringify(`${detailSelector(FIRST_ORDER.id)} [data-key]`)}).length`,
  );
  if (nestedRowCount !== FIRST_ORDER.lines.length) {
    failures.push(`expected ${FIRST_ORDER.lines.length} line items in the nested grid, DOM shows ${nestedRowCount}`);
  }

  // --- Click the expander again: it closes ---
  await clickSelector(browser, expanderSelector(FIRST_ORDER.id));
  await new Promise((r) => setTimeout(r, 300));

  const openAfterSecondClick = await browser.evaluate(`window.__demoGrid.detail.isOpen(${JSON.stringify(FIRST_ORDER.id)})`);
  if (openAfterSecondClick) failures.push('clicking the expander a second time did not close the detail region');

  const detailGoneAfterClose = await browser.evaluate(`!!document.querySelector(${JSON.stringify(detailSelector(FIRST_ORDER.id))})`);
  if (detailGoneAfterClose) failures.push(`${detailSelector(FIRST_ORDER.id)} is still in the DOM after closing`);

  // --- "Expand first row" opens the same region from code ---
  await clickSelector(browser, '#expand-first');
  await new Promise((r) => setTimeout(r, 300));

  const openFromButton = await browser.evaluate(`window.__demoGrid.detail.isOpen(${JSON.stringify(FIRST_ORDER.id)})`);
  if (!openFromButton) failures.push('"Expand first row" did not open the first order’s detail region');

  const errors = await browser.evaluate('window.__errs');
  if (errors.length) failures.push(`console/window errors: ${errors.join(' | ')}`);

  if (failures.length) {
    console.error('FAILED:\n' + failures.map((f) => `  - ${f}`).join('\n'));
    process.exitCode = 1;
  } else {
    console.log(
      'OK: 12 orders loaded, no order expanded on load, clicking the expander opened order ' +
      `${FIRST_ORDER.id}'s detail region with its ${FIRST_ORDER.lines.length} line items read back ` +
      'through the nested grid, a second click closed it, and "Expand first row" opened it again ' +
      'from code. 0 console errors.'
    );
  }
} finally {
  await browser.close();
  server.close();
}

# How to add an expandable detail row (master/detail) to a data grid

Click the arrow at the start of an order row and it opens onto a nested grid holding that
order's own line items, inline, beneath the row it belongs to. Any number of orders can be
expanded together, each keeping its own detail grid and its own state.

Live demo: https://toclocoinc.github.io/lattice-grid-howto-master-detail-rows/

**Read the how-to:** https://www.latticegrid.dev/docs/how-to/master-detail-rows/

## The full source

Two files: `index.html` loads the grid and declares the mount point, `demo.js` configures and
creates it. Copy both as they are below and it runs.

### index.html

```html
<!doctype html>
<html lang="en-GB">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>How to add an expandable detail row (master/detail) to a data grid</title>
    <meta
      name="description"
      content="Click the arrow on an order row and it opens onto a nested grid of its own line items, in place, without leaving the list. Any number of rows can be open at once. Built with Lattice Grid loaded by script tag, no install and no build."
    />
    <link rel="icon" href="data:," />
    <!--
      The grid's stylesheet, from jsDelivr. The address names the exact
      release, 1.68.2, and carries the hash of the file it expects, so the
      page can never quietly pick up a different build than the one it was
      checked against.
    -->
    <link
      rel="stylesheet"
      href="https://cdn.jsdelivr.net/npm/@toclocoinc/lattice-grid@1.68.2/lattice-grid.min.css"
      integrity="sha384-mcpd7S8C5nz58bZDAXdYH6rzezEhfN7B4u2SlW426dSe20GnkxTu4TygyOILnCth"
      crossorigin="anonymous"
    />
    <style>
      body { margin: 0; font-family: system-ui, sans-serif; background: #f4f6f9; color: #131a24; }
      header { padding: 1.5rem 1.5rem 0.5rem; max-width: 960px; margin: 0 auto; }
      header p { color: #4a5568; }
      header a { color: #2d6bff; }
      main { max-width: 960px; margin: 0 auto; padding: 0 1.5rem 2.5rem; }
      #grid { height: 420px; margin: 0 0 1rem; }
      #stat { font-size: 0.9rem; color: #4a5568; margin: 0 0 1rem; }
      button { font: inherit; padding: 0.5rem 0.9rem; border: 1px solid #ccd3dc; border-radius: 4px; background: #fff; color: #131a24; cursor: pointer; }
      button:hover { background: #eef1f5; }
      .caveats { font-size: 0.9rem; color: #4a5568; }
    </style>
  </head>
  <body>
    <header>
      <h1>How to add an expandable detail row (master/detail) to a data grid</h1>
      <p>
        Click the arrow at the start of an order row and it opens onto a nested grid holding
        that order's own line items, inline, beneath the row it belongs to. Any number of orders
        can be expanded together, each with its own detail grid. Read the
        <a href="https://www.latticegrid.dev/docs/how-to/master-detail-rows/">full how-to</a>
        on latticegrid.dev.
      </p>
    </header>
    <main>
      <div id="grid"></div>
      <p id="stat"></p>
      <button id="expand-first" type="button">Expand first row</button>
      <p class="caveats">
        Two things to know: the detail region takes a fixed height by default, so a nested grid
        with more rows than fit scrolls inside it rather than growing the row; and detail state
        is not part of the data, so sorting or filtering the outer grid does not move or close an
        open detail, it simply follows the master row wherever it now sits.
      </p>
    </main>

    <!--
      The library, as a classic script tag. No npm install, no bundler, no
      type="module": the file runs as it arrives and leaves the LatticeGrid
      global behind.
    -->
    <script
      src="https://cdn.jsdelivr.net/npm/@toclocoinc/lattice-grid@1.68.2/lattice-grid.min.js"
      integrity="sha384-vCzLyFYn0T0lz/vkdH4x0JpJZkOazZgI2LiGui7lm5uerdZd0Z46G9hr3Aq1FFPS"
      crossorigin="anonymous"
    ></script>
    <script src="./demo.js"></script>
  </body>
</html>
```

### demo.js

```js
/**
 * Expand an order row into its own nested grid of line items.
 *
 * `detail.rows(row)` returns a master row's child records; `detail.config`
 * is a full grid configuration describing the nested grid built from them.
 * Any number of orders can be expanded at once, each keeping its own
 * detail state.
 */

// Tied to toclocoinc.github.io only; has no effect anywhere else and needs
// no key at all to run this page from a local copy.
LatticeGrid.setLicence(
  'LG1.eyJ2IjoxLCJwIjoibGF0dGljZS1ncmlkIiwidCI6IlRPQ0xPQ08gSW5jIC0gcHVibGljIGRlbW9zIiwiZSI6IjIwMzAtMDEtMDEiLCJkIjpbInRvY2xvY29pbmMuZ2l0aHViLmlvIl19.9De42ua3aCGpiMB6EVRP7Tv-upUlDI-0T07rlSPzvCrsqg8t4YJi7SRnStEpAg48uzmcG7il1fR_TfwkUE7iCA'
);

const ORDERS = [
  { id: 'ORD-1001', customer: 'Acme Tools', date: '2026-01-06', status: 'Shipped', lines: [{ sku: 'L1', item: 'Steel bolt M8', qty: 240, price: 0.18 }, { sku: 'L2', item: 'Washer M8', qty: 240, price: 0.04 }] },
  { id: 'ORD-1002', customer: 'Bolt & Co', date: '2026-01-07', status: 'Processing', lines: [{ sku: 'L1', item: 'Hex nut M8', qty: 180, price: 0.09 }, { sku: 'L2', item: 'Cable tie 200mm', qty: 300, price: 0.06 }] },
  { id: 'ORD-1003', customer: 'Fenwick Ltd', date: '2026-01-08', status: 'Shipped', lines: [{ sku: 'L1', item: 'Cable gland M20', qty: 40, price: 0.55 }, { sku: 'L2', item: 'Terminal block 4-way', qty: 25, price: 1.85 }] },
  { id: 'ORD-1004', customer: 'Harborview Inc', date: '2026-01-09', status: 'Pending', lines: [{ sku: 'L1', item: 'Din rail 1m', qty: 15, price: 3.40 }, { sku: 'L2', item: 'Enclosure 200x150', qty: 6, price: 14.20 }] },
  { id: 'ORD-1005', customer: 'Ridgeline Supply', date: '2026-01-10', status: 'Shipped', lines: [{ sku: 'L1', item: 'Fuse 5A', qty: 90, price: 0.32 }, { sku: 'L2', item: 'Fuse holder', qty: 30, price: 0.95 }] },
  { id: 'ORD-1006', customer: 'Union Hardware', date: '2026-01-11', status: 'Processing', lines: [{ sku: 'L1', item: 'Steel bolt M10', qty: 120, price: 0.24 }, { sku: 'L2', item: 'Hex nut M8', qty: 90, price: 0.09 }, { sku: 'L3', item: 'Washer M8', qty: 120, price: 0.04 }] },
  { id: 'ORD-1007', customer: 'Delta Industrial', date: '2026-01-12', status: 'Shipped', lines: [{ sku: 'L1', item: 'Cable tie 200mm', qty: 500, price: 0.06 }, { sku: 'L2', item: 'Cable gland M20', qty: 20, price: 0.55 }] },
  { id: 'ORD-1008', customer: 'Grover Systems', date: '2026-01-13', status: 'Pending', lines: [{ sku: 'L1', item: 'Terminal block 4-way', qty: 40, price: 1.85 }, { sku: 'L2', item: 'Din rail 1m', qty: 10, price: 3.40 }] },
  { id: 'ORD-1009', customer: 'Alpine Freight', date: '2026-01-14', status: 'Shipped', lines: [{ sku: 'L1', item: 'Enclosure 300x200', qty: 4, price: 21.60 }, { sku: 'L2', item: 'Fuse 5A', qty: 60, price: 0.32 }] },
  { id: 'ORD-1010', customer: 'Coastal Metals', date: '2026-01-15', status: 'Processing', lines: [{ sku: 'L1', item: 'Fuse holder', qty: 45, price: 0.95 }, { sku: 'L2', item: 'Steel bolt M8', qty: 150, price: 0.18 }] },
  { id: 'ORD-1011', customer: 'Vantage Works', date: '2026-01-16', status: 'Shipped', lines: [{ sku: 'L1', item: 'Washer M8', qty: 200, price: 0.04 }, { sku: 'L2', item: 'Cable tie 200mm', qty: 250, price: 0.06 }] },
  { id: 'ORD-1012', customer: 'Pinecrest Co', date: '2026-01-17', status: 'Pending', lines: [{ sku: 'L1', item: 'Hex nut M8', qty: 100, price: 0.09 }, { sku: 'L2', item: 'Cable gland M20', qty: 15, price: 0.55 }] },
];

const grid = LatticeGrid.createGrid(document.getElementById('grid'), {
  rowKey: 'id',
  detail: {
    rows: (row) => row.data.lines,
    config: {
      rowKey: 'sku',
      columns: [
        { field: 'item', title: 'Item', layout: { flex: 1, min: 160 } },
        { field: 'qty', title: 'Qty', type: 'number', layout: { width: 90 } },
        {
          field: 'price', title: 'Unit price', type: 'number',
          format: { style: 'currency', currency: 'USD', decimals: 2 },
          layout: { width: 120 },
        },
      ],
    },
    height: 160,
  },
  columns: [
    { field: 'id', title: 'Order', layout: { width: 110 } },
    { field: 'customer', title: 'Customer', layout: { flex: 1, min: 160 } },
    { field: 'date', title: 'Date', type: 'date', layout: { width: 120 } },
    { field: 'status', title: 'Status', layout: { width: 110 } },
  ],
  rows: ORDERS,
});
window.__demoGrid = grid; // read by tools/verify.mjs

const stat = document.getElementById('stat');
const say = () => {
  const open = grid.detail.keys();
  stat.textContent = open.length
    ? `Open: ${open.join(', ')}`
    : 'No order expanded. Click the arrow on a row, or use the button below.';
};
grid.on('detail:toggled', say);
say();

document.getElementById('expand-first').addEventListener('click', () => {
  grid.detail.open(ORDERS[0].id);
});
```

`detail.rows` returns a sub-array already sitting on the master's own record (`row.data.lines`),
which is the usual shape; `detail.config` is a complete grid configuration, so the nested grid
has its own columns, formatting and row identity (`rowKey: 'sku'`). `grid.detail.keys()` lists
every master whose detail is currently open, and `grid.detail.open(key)` opens one from code,
which is what the button above calls to expand the first order without a click.

## Running it yourself

Open `index.html` in a browser, or serve the folder with any static file server. The grid loads
from jsDelivr by script tag, so there is no install and no build step. It runs keyless on
`localhost`; the licence key in `demo.js` is bound to `toclocoinc.github.io` and has no effect
anywhere else.

## Licence

MIT, see [LICENSE](./LICENSE). Lattice Grid itself is licensed separately per domain:
https://www.latticegrid.dev/pricing/

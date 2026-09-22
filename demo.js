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

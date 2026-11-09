// SAMPLE orders for the prototype, generated with a fixed seed so the
// numbers are the same on every load. Replace with API data later.
import { PRODUCTS } from './products.js';

export const TODAY = new Date('2026-11-09T18:00:00');

function rng(seed) {
  let s = seed;
  return () => { s = (s * 1664525 + 1013904223) % 4294967296; return s / 4294967296; };
}
const r = rng(20261109);
const pick = (arr) => arr[Math.floor(r() * arr.length)];

const AREAS = ['Jayanagar', 'Basavanagudi', 'JP Nagar', 'Banashankari', 'Girinagar', 'Hanumanthnagar', 'Malleshwaram', 'Rajajinagar', 'BTM Layout', 'Kumaraswamy Layout'];
const TYPES = ['Home baker', 'Home baker', 'Home baker', 'Bakery', 'Cake studio'];
export const CHANNELS = ['Website', 'Mobile App', 'Store counter'];
export const MODES = ['UPI', 'Cash', 'Card', 'Credit'];
export const ORDER_STATUSES = ['Pending', 'Packed', 'Dispatched', 'Delivered', 'Cancelled'];

function makeOrder(i) {
  const daysAgo = Math.floor(Math.pow(r(), 1.4) * 45);
  const date = new Date(TODAY);
  date.setDate(date.getDate() - daysAgo);
  date.setHours(9 + Math.floor(r() * 11), Math.floor(r() * 60));

  const type = pick(TYPES);
  const bulk = type !== 'Home baker';
  const n = 1 + Math.floor(r() * (bulk ? 4 : 3));
  const used = new Set();
  const items = [];
  for (let k = 0; k < n; k++) {
    let p = pick(PRODUCTS);
    while (used.has(p.id)) p = pick(PRODUCTS);
    used.add(p.id);
    const qty = bulk ? 2 + Math.floor(r() * 9) : 1 + Math.floor(r() * 3);
    items.push({ productId: p.id, name: p.name, price: p.price, qty });
  }
  const amount = items.reduce((s, it) => s + it.price * it.qty, 0);

  let status;
  if (daysAgo <= 1) status = pick(['Pending', 'Pending', 'Packed']);
  else if (daysAgo <= 3) status = pick(['Packed', 'Dispatched', 'Delivered', 'Pending']);
  else status = r() < 0.08 ? 'Cancelled' : 'Delivered';

  const mode = bulk ? pick(['Credit', 'Credit', 'UPI', 'Cash']) : pick(['UPI', 'UPI', 'Cash', 'Card']);
  let payment = 'Paid';
  if (status === 'Cancelled') payment = 'Refunded';
  else if (mode === 'Credit') payment = r() < 0.55 ? 'Pending' : 'Paid';
  else if (status === 'Pending') payment = r() < 0.4 ? 'Pending' : 'Paid';
  const paid = payment === 'Paid' ? amount : 0;

  const due = new Date(date); due.setDate(due.getDate() + (mode === 'Credit' ? 15 : 0));

  return {
    id: `AST-${1001 + i}`,
    invoice: `INV-${2601 + i}`,
    date: date.toISOString(),
    due: due.toISOString(),
    customer: `${type} · ${pick(AREAS)}`,
    customerType: type,
    phone: `+91 9${Math.floor(100000000 + r() * 899999999)}`.replace(/(\d{5})(\d{5})$/, '$1 $2'),
    channel: type === 'Bakery' ? pick(['Store counter', 'Website', 'Store counter']) : pick(CHANNELS),
    items, amount, mode, payment, paid, status,
    delivery: r() < 0.35 ? 'Store pick-up' : 'Delivery',
  };
}

// newest first; ids follow date order so the latest order has the highest number
const N = 64;
export const SAMPLE_ORDERS = Array.from({ length: N }, (_, i) => makeOrder(i))
  .sort((a, b) => new Date(b.date) - new Date(a.date))
  .map((o, i) => ({ ...o, id: `AST-${1000 + N - i}`, invoice: `INV-${2600 + N - i}` }));

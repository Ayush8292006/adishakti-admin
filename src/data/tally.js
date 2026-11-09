// All tally numbers are computed from the orders + products, so every page agrees.
import { CATEGORIES } from './products.js';
import { TODAY } from './orders.js';

export const RANGES = [
  { id: '7', label: 'Last 7 days', days: 7 },
  { id: '30', label: 'Last 30 days', days: 30 },
  { id: 'all', label: 'All time', days: 9999 },
];

const dayKey = (d) => new Date(d).toISOString().slice(0, 10);
export const fmtDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
export const fmtDateLong = (d) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
export const fmtTime = (d) => new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

export function inRange(orders, days) {
  const from = new Date(TODAY); from.setDate(from.getDate() - days + 1); from.setHours(0, 0, 0, 0);
  return orders.filter((o) => new Date(o.date) >= from);
}
// same-length window just before the current one, for "vs previous" deltas
export function prevRange(orders, days) {
  const end = new Date(TODAY); end.setDate(end.getDate() - days); end.setHours(23, 59, 59);
  const start = new Date(end); start.setDate(start.getDate() - days + 1); start.setHours(0, 0, 0, 0);
  return orders.filter((o) => { const d = new Date(o.date); return d >= start && d <= end; });
}
export const pct = (now, before) => (before ? Math.round(((now - before) / before) * 100) : null);

/* ---------- orders ---------- */
export function orderStats(orders) {
  const by = (s) => orders.filter((o) => o.status === s).length;
  return {
    total: orders.length,
    pending: by('Pending') + by('Packed') + by('Dispatched'),
    completed: by('Delivered'),
    cancelled: by('Cancelled'),
    newOrders: by('Pending'),
  };
}
export function perDay(orders, days) {
  const n = Math.min(days, 30);
  const out = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(TODAY); d.setDate(d.getDate() - i);
    const k = dayKey(d);
    const list = orders.filter((o) => dayKey(o.date) === k);
    out.push({
      day: n <= 7 ? d.toLocaleDateString('en-IN', { weekday: 'short' }) : fmtDate(d),
      completed: list.filter((o) => o.status === 'Delivered').length,
      pending: list.filter((o) => ['Pending', 'Packed', 'Dispatched'].includes(o.status)).length,
      cancelled: list.filter((o) => o.status === 'Cancelled').length,
      sales: list.filter((o) => o.status !== 'Cancelled').reduce((s, o) => s + o.amount, 0),
    });
  }
  return out;
}
export const statusBreakdown = (orders) => ['Pending', 'Packed', 'Dispatched', 'Delivered', 'Cancelled']
  .map((s) => ({ name: s, value: orders.filter((o) => o.status === s).length })).filter((x) => x.value);
export const channelBreakdown = (orders) => ['Website', 'Mobile App', 'Store counter']
  .map((c) => ({ name: c, value: orders.filter((o) => o.channel === c).length }));

/* ---------- products ---------- */
export function soldMap(orders) {
  const m = {};
  orders.filter((o) => o.status !== 'Cancelled').forEach((o) => o.items.forEach((it) => { m[it.productId] = (m[it.productId] || 0) + it.qty; }));
  return m;
}
export function categoryStats(products, orders) {
  const sold = soldMap(orders);
  return CATEGORIES.map((c) => {
    const ps = products.filter((p) => p.category === c);
    return {
      name: c.replace('Decoration ', '').replace(' Materials', '').replace(' & Boards', '').replace('Cake ', ''),
      full: c,
      sold: ps.reduce((s, p) => s + (sold[p.id] || 0), 0),
      available: ps.reduce((s, p) => s + (p.stock || 0), 0),
      revenue: orders.filter((o) => o.status !== 'Cancelled').reduce((s, o) => s + o.items.filter((it) => ps.some((p) => p.id === it.productId)).reduce((a, it) => a + it.price * it.qty, 0), 0),
    };
  });
}
export function topProducts(products, orders, n = 6) {
  const sold = soldMap(orders);
  return products.map((p) => ({ ...p, sold: sold[p.id] || 0, revenue: (sold[p.id] || 0) * p.price }))
    .filter((p) => p.sold).sort((a, b) => b.sold - a.sold).slice(0, n);
}

/* ---------- billing ---------- */
export function billingStats(orders) {
  const billed = orders.filter((o) => o.status !== 'Cancelled');
  const sales = billed.reduce((s, o) => s + o.amount, 0);
  const received = billed.reduce((s, o) => s + o.paid, 0);
  const pendingList = billed.filter((o) => o.payment !== 'Paid');
  const overdue = pendingList.filter((o) => new Date(o.due) < TODAY);
  return { bills: billed.length, sales, received, pending: sales - received, pendingCount: pendingList.length, overdueCount: overdue.length, avg: billed.length ? Math.round(sales / billed.length) : 0 };
}
export function salesByWeek(orders, weeks = 6) {
  const out = [];
  for (let w = weeks - 1; w >= 0; w--) {
    const end = new Date(TODAY); end.setDate(end.getDate() - w * 7); end.setHours(23, 59, 59);
    const start = new Date(end); start.setDate(start.getDate() - 6); start.setHours(0, 0, 0, 0);
    const list = orders.filter((o) => o.status !== 'Cancelled' && new Date(o.date) >= start && new Date(o.date) <= end);
    const total = list.reduce((s, o) => s + o.amount, 0);
    const received = list.reduce((s, o) => s + o.paid, 0);
    out.push({ week: fmtDate(start), received, pending: total - received, total });
  }
  return out;
}
export const paymentModes = (orders) => ['UPI', 'Cash', 'Card', 'Credit']
  .map((m) => ({ name: m, value: orders.filter((o) => o.mode === m && o.status !== 'Cancelled').reduce((s, o) => s + o.amount, 0) }));

export const isOverdue = (o) => o.payment !== 'Paid' && o.status !== 'Cancelled' && new Date(o.due) < TODAY;

export function downloadCSV(name, rows) {
  const csv = rows.map((r) => r.map((c) => `"${String(c ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
  const url = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' }));
  const a = Object.assign(document.createElement('a'), { href: url, download: `${name}.csv` });
  document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
}

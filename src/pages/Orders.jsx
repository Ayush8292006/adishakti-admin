import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Download, ChevronLeft, ChevronRight, PackageSearch, Truck, Check, Store } from 'lucide-react';
import { useAdmin } from '../context/AdminContext.jsx';
import { Page, PageHead, Card, Badge, Drawer, Empty, inr } from '../components/ui.jsx';
import { ORDER_STATUSES, CHANNELS } from '../data/orders.js';
import { fmtDate, fmtDateLong, fmtTime, downloadCSV, isOverdue } from '../data/tally.js';
import { findProduct } from '../data/products.js';
import './pages.css';

const PER_PAGE = 12;
const FLOW = ['Pending', 'Packed', 'Dispatched', 'Delivered'];
const NEXT = { Pending: 'Packed', Packed: 'Dispatched', Dispatched: 'Delivered' };

function OrderDrawer({ order, onClose }) {
  const admin = useAdmin();
  const o = order && admin.orders.find((x) => x.id === order);
  const step = o ? FLOW.indexOf(o.status) : -1;
  return (
    <Drawer open={!!o} onClose={onClose} title={o ? `Order ${o.id}` : ''}
      footer={o && (
        <>
          {o.status !== 'Cancelled' && o.status !== 'Delivered' && <button className="btn btn-danger" onClick={() => { admin.setOrderStatus(o.id, 'Cancelled'); admin.toast(`${o.id} cancelled`, 'bad'); }}>Cancel order</button>}
          {o.payment === 'Pending' && <button className="btn btn-outline" onClick={() => { admin.markPaid(o.id); admin.toast(`${o.invoice} marked as paid`); }}>Mark as paid</button>}
          {NEXT[o.status] && <button className="btn btn-primary" onClick={() => { admin.setOrderStatus(o.id, NEXT[o.status]); admin.toast(`${o.id} → ${NEXT[o.status]}`); }}>Mark as {NEXT[o.status]}</button>}
        </>
      )}>
      {o && (
        <>
          <div className="od-section">
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}><Badge>{o.status}</Badge><Badge>{isOverdue(o) ? 'Overdue' : o.payment}</Badge></div>
            <dl className="kv">
              <dt>Customer</dt><dd>{o.customer}</dd>
              <dt>Phone</dt><dd className="num">{o.phone}</dd>
              <dt>Placed</dt><dd className="num">{fmtDateLong(o.date)}, {fmtTime(o.date)}</dd>
              <dt>Channel</dt><dd>{o.channel}</dd>
              <dt>Fulfilment</dt><dd>{o.delivery}</dd>
              <dt>Payment</dt><dd>{o.mode} · {o.invoice}</dd>
            </dl>
          </div>
          <div className="od-section">
            <h3>Items ({o.items.length})</h3>
            {o.items.map((it) => {
              const p = findProduct(it.productId);
              return (
                <div key={it.productId} className="od-item">
                  {p && <img className="thumb" src={p.img} alt="" />}
                  <div className="grow"><b className="clamp1">{it.name}</b><small className="muted num">{it.qty} × {inr(it.price)}</small></div>
                  <b className="num">{inr(it.qty * it.price)}</b>
                </div>
              );
            })}
            <div className="od-total"><span>Total</span><span className="num">{inr(o.amount)}</span></div>
          </div>
          <div className="od-section" style={{ borderBottom: 0 }}>
            <h3>Progress</h3>
            {o.status === 'Cancelled' ? <p className="muted" style={{ margin: 0 }}>This order was cancelled.</p> : (
              <ul className="timeline">
                {[[PackageSearch, 'Order placed'], [Store, 'Packed'], [Truck, o.delivery === 'Store pick-up' ? 'Ready for pick-up' : 'Dispatched'], [Check, 'Delivered']].map(([, label], i) => (
                  <li key={label} className={i < step ? 'done' : i === step ? 'cur' : ''}>{label}</li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </Drawer>
  );
}

export default function Orders() {
  const { orders, setOrderStatus, toast } = useAdmin();
  const [params, setParams] = useSearchParams();
  const [q, setQ] = useState('');
  const [status, setStatus] = useState(params.get('status') || 'All');
  const [channel, setChannel] = useState('All');
  const [page, setPage] = useState(1);
  const open = params.get('open');

  useEffect(() => setPage(1), [q, status, channel]);

  const counts = useMemo(() => Object.fromEntries(['All', ...ORDER_STATUSES].map((s) => [s, s === 'All' ? orders.length : orders.filter((o) => o.status === s).length])), [orders]);
  const list = useMemo(() => orders.filter((o) =>
    (status === 'All' || o.status === status) && (channel === 'All' || o.channel === channel) &&
    (!q || `${o.id} ${o.invoice} ${o.customer} ${o.phone}`.toLowerCase().includes(q.toLowerCase()))), [orders, status, channel, q]);
  const pages = Math.max(1, Math.ceil(list.length / PER_PAGE));
  const rows = list.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const setOpen = (id) => { const p = new URLSearchParams(params); if (id) p.set('open', id); else p.delete('open'); setParams(p, { replace: true }); };

  return (
    <Page>
      <PageHead title="Orders" sub={`${counts.Pending} new · ${counts.Packed + counts.Dispatched} in progress`}>
        <button className="btn btn-outline" onClick={() => { downloadCSV('orders', [['Order', 'Invoice', 'Date', 'Customer', 'Phone', 'Channel', 'Amount', 'Payment', 'Status'], ...list.map((o) => [o.id, o.invoice, fmtDateLong(o.date), o.customer, o.phone, o.channel, o.amount, o.payment, o.status])]); toast('Orders exported'); }}><Download size={16} /> Export</button>
      </PageHead>

      <Card body={false}>
        <div className="toolbar" style={{ borderBottom: 0, paddingBottom: 6 }}>
          <div className="chip-row">
            {['All', ...ORDER_STATUSES].map((s) => <button key={s} className={`chip ${status === s ? 'on' : ''}`} onClick={() => setStatus(s)}>{s} <span className="num" style={{ opacity: 0.7 }}>{counts[s]}</span></button>)}
          </div>
        </div>
        <div className="toolbar">
          <label className="search"><Search size={16} /><span className="sr-only">Search orders</span><input className="input" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search order ID, invoice, customer, phone" /></label>
          <label><span className="sr-only">Channel</span>
            <select className="select" value={channel} onChange={(e) => setChannel(e.target.value)}><option value="All">All channels</option>{CHANNELS.map((c) => <option key={c}>{c}</option>)}</select>
          </label>
        </div>
        {rows.length === 0 ? <Empty icon={PackageSearch} title="No orders found" text="Try a different filter or search." /> : (
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>Order</th><th>Customer</th><th className="hide-sm">Date</th><th className="hide-md">Items</th><th className="r">Amount</th><th className="hide-sm">Payment</th><th>Status</th></tr></thead>
              <tbody>
                {rows.map((o) => (
                  <tr key={o.id} className="clickable" onClick={() => setOpen(o.id)}>
                    <td className="strong">{o.id}<span className="cell-sub">{o.channel}</span></td>
                    <td>{o.customer}<span className="cell-sub num">{o.phone}</span></td>
                    <td className="hide-sm num">{fmtDate(o.date)}<span className="cell-sub">{fmtTime(o.date)}</span></td>
                    <td className="hide-md num">{o.items.reduce((s, i) => s + i.qty, 0)} units</td>
                    <td className="r num strong">{inr(o.amount)}</td>
                    <td className="hide-sm"><Badge>{isOverdue(o) ? 'Overdue' : o.payment}</Badge></td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <label><span className="sr-only">Change status of {o.id}</span>
                        <select className="status-select" value={o.status} onChange={(e) => { setOrderStatus(o.id, e.target.value); toast(`${o.id} → ${e.target.value}`); }}>
                          {ORDER_STATUSES.map((s) => <option key={s}>{s}</option>)}
                        </select>
                      </label>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="toolbar" style={{ borderTop: '1px solid var(--line)', borderBottom: 0, justifyContent: 'space-between' }}>
          <span className="muted num">Showing {list.length ? (page - 1) * PER_PAGE + 1 : 0}–{Math.min(page * PER_PAGE, list.length)} of {list.length}</span>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <button className="icon-btn bordered" disabled={page === 1} onClick={() => setPage((p) => p - 1)} aria-label="Previous page"><ChevronLeft size={16} /></button>
            <span className="num" style={{ minWidth: 60, textAlign: 'center' }}>{page} / {pages}</span>
            <button className="icon-btn bordered" disabled={page === pages} onClick={() => setPage((p) => p + 1)} aria-label="Next page"><ChevronRight size={16} /></button>
          </div>
        </div>
      </Card>
      <OrderDrawer order={open} onClose={() => setOpen(null)} />
    </Page>
  );
}

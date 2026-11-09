import { useMemo, useState } from 'react';
import { Search, Download, Printer, Eye, CheckCircle2, ReceiptText, IndianRupee, Wallet, Hourglass, FileX } from 'lucide-react';
import { useAdmin } from '../context/AdminContext.jsx';
import { Page, PageHead, Card, Kpi, Badge, Seg, Tabs, Modal, Empty, inr } from '../components/ui.jsx';
import { RANGES, inRange, billingStats, isOverdue, fmtDateLong, downloadCSV } from '../data/tally.js';
import { STORE } from '../data/store.js';
import './pages.css';

function Invoice({ o }) {
  return (
    <div className="invoice print-area">
      <div className="inv-head">
        <div><h3>{STORE.name}</h3><p>{STORE.address}</p><p>GSTIN: {STORE.gstin} · {STORE.phones.join(' / ')}</p></div>
        <div className="inv-meta"><small className="muted">TAX INVOICE</small><b>{o.invoice}</b><span className="muted num">{fmtDateLong(o.date)}</span></div>
      </div>
      <div className="inv-to">
        <div><small>Bill to</small><b>{o.customer}</b><div className="muted num">{o.phone}</div></div>
        <div style={{ textAlign: 'right' }}><small>Order</small><b>{o.id}</b><div className="muted">{o.mode} · {o.delivery}</div></div>
      </div>
      <table className="inv-table">
        <thead><tr><th>#</th><th>Item</th><th className="r">Qty</th><th className="r">Rate</th><th className="r">Amount</th></tr></thead>
        <tbody>{o.items.map((it, i) => <tr key={it.productId}><td>{i + 1}</td><td>{it.name}</td><td className="r num">{it.qty}</td><td className="r num">{inr(it.price)}</td><td className="r num">{inr(it.price * it.qty)}</td></tr>)}</tbody>
      </table>
      <div className="inv-sum">
        <div><span>Subtotal</span><span className="num">{inr(o.amount)}</span></div>
        <div><span>Paid</span><span className="num">{inr(o.paid)}</span></div>
        <div className="grand"><span>Balance due</span><span className="num">{inr(o.amount - o.paid)}</span></div>
      </div>
      <p className="muted" style={{ fontSize: 11.5, marginTop: 18 }}>Prices shown are sample prototype rates. GST breakup will be added when tax rates are confirmed.</p>
    </div>
  );
}

export default function Billing() {
  const admin = useAdmin();
  const [range, setRange] = useState('30');
  const [tab, setTab] = useState('all');
  const [q, setQ] = useState('');
  const [view, setView] = useState(null);
  const days = RANGES.find((r) => r.id === range).days;

  const bills = useMemo(() => inRange(admin.orders, days).filter((o) => o.status !== 'Cancelled'), [admin.orders, days]);
  const b = billingStats(bills);
  const list = bills.filter((o) => (tab === 'all' || (tab === 'pending' && o.payment !== 'Paid') || (tab === 'overdue' && isOverdue(o)) || (tab === 'paid' && o.payment === 'Paid')) &&
    (!q || `${o.invoice} ${o.id} ${o.customer}`.toLowerCase().includes(q.toLowerCase())));
  const viewing = view && admin.orders.find((o) => o.id === view);

  return (
    <Page>
      <PageHead title="Billing" sub="Invoices, payments and dues.">
        <Seg label="Date range" options={RANGES} value={range} onChange={setRange} />
        <button className="btn btn-outline" onClick={() => { downloadCSV(`invoices-${range}`, [['Invoice', 'Order', 'Date', 'Due', 'Customer', 'Mode', 'Amount', 'Paid', 'Status'], ...list.map((o) => [o.invoice, o.id, fmtDateLong(o.date), fmtDateLong(o.due), o.customer, o.mode, o.amount, o.paid, isOverdue(o) ? 'Overdue' : o.payment])]); admin.toast('Invoices exported'); }}><Download size={16} /> Export</button>
      </PageHead>

      <div className="kpis" style={{ marginBottom: 16 }}>
        <Kpi i={0} label="Total bills" icon={ReceiptText} value={b.bills} note={`Avg ${inr(b.avg)}`} />
        <Kpi i={1} label="Sales amount" icon={IndianRupee} value={inr(b.sales)} note="Billed in period" />
        <Kpi i={2} label="Received" icon={Wallet} value={inr(b.received)} note={`${b.sales ? Math.round((b.received / b.sales) * 100) : 0}% collected`} />
        <Kpi i={3} label="Pending" icon={Hourglass} value={inr(b.pending)} note={`${b.overdueCount} overdue bills`} />
      </div>

      <Card body={false}>
        <div style={{ padding: '4px 18px 0' }}>
          <Tabs label="Invoice filter" value={tab} onChange={setTab} options={[
            { id: 'all', label: `All (${bills.length})` },
            { id: 'pending', label: `Pending (${bills.filter((o) => o.payment !== 'Paid').length})` },
            { id: 'overdue', label: `Overdue (${bills.filter(isOverdue).length})` },
            { id: 'paid', label: `Paid (${bills.filter((o) => o.payment === 'Paid').length})` },
          ]} />
        </div>
        <div className="toolbar">
          <label className="search"><Search size={16} /><span className="sr-only">Search invoices</span><input className="input" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search invoice, order or customer" /></label>
        </div>
        {list.length === 0 ? <Empty icon={FileX} title="No invoices here" text="Change the filter or date range." /> : (
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>Invoice</th><th className="hide-sm">Customer</th><th className="hide-md">Date</th><th>Due</th><th className="hide-md">Mode</th><th className="r">Amount</th><th>Status</th><th className="r">Actions</th></tr></thead>
              <tbody>
                {list.map((o) => (
                  <tr key={o.id}>
                    <td className="strong">{o.invoice}<span className="cell-sub">{o.id}</span></td>
                    <td className="hide-sm">{o.customer}</td>
                    <td className="hide-md num">{fmtDateLong(o.date)}</td>
                    <td className="num">{fmtDateLong(o.due)}</td>
                    <td className="hide-md">{o.mode}</td>
                    <td className="r num strong">{inr(o.amount)}</td>
                    <td><Badge>{isOverdue(o) ? 'Overdue' : o.payment}</Badge></td>
                    <td className="r" style={{ whiteSpace: 'nowrap' }}>
                      <button className="icon-btn" onClick={() => setView(o.id)} aria-label={`View ${o.invoice}`}><Eye size={16} /></button>
                      {o.payment !== 'Paid' && <button className="btn btn-outline btn-sm" onClick={() => { admin.markPaid(o.id); admin.toast(`${o.invoice} marked as paid`); }}><CheckCircle2 size={14} /> Paid</button>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal open={!!viewing} onClose={() => setView(null)} title={viewing ? `Invoice ${viewing.invoice}` : ''} width={720}
        footer={viewing && <>
          {viewing.payment !== 'Paid' && <button className="btn btn-outline" onClick={() => { admin.markPaid(viewing.id); admin.toast(`${viewing.invoice} marked as paid`); }}>Mark as paid</button>}
          <button className="btn btn-primary" onClick={() => window.print()}><Printer size={16} /> Print / Save PDF</button>
        </>}>
        {viewing && <Invoice o={viewing} />}
      </Modal>
    </Page>
  );
}

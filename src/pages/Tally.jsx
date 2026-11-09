import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, ComposedChart, Line,
} from 'recharts';
import { Download, ShoppingCart, Clock, CheckCircle2, XCircle, Package, Boxes, TrendingUp, AlertTriangle, ReceiptText, IndianRupee, Wallet, Hourglass } from 'lucide-react';
import { useAdmin } from '../context/AdminContext.jsx';
import { Page, PageHead, Card, Kpi, Badge, Seg, Tabs, ChartTip, Legend, inr, COLORS, PIE } from '../components/ui.jsx';
import {
  RANGES, inRange, prevRange, pct, orderStats, perDay, statusBreakdown, channelBreakdown, categoryStats, topProducts, soldMap,
  billingStats, salesByWeek, paymentModes, isOverdue, fmtDateLong, downloadCSV,
} from '../data/tally.js';
import { isLowStock } from '../data/products.js';
import './pages.css';

const axis = { tickLine: false, axisLine: false, tick: { fontSize: 11, fill: '#6b6b75' } };

function OrderTally({ cur, prev, orders, days }) {
  const s = orderStats(cur); const sp = orderStats(prev);
  const daily = perDay(orders, days);
  const status = statusBreakdown(cur);
  const channels = channelBreakdown(cur);
  return (
    <>
      <div className="kpis">
        <Kpi i={0} label="Total orders" icon={ShoppingCart} value={s.total} delta={days < 9999 ? pct(s.total, sp.total) : null} note={days < 9999 ? 'vs previous period' : 'all orders'} />
        <Kpi i={1} label="Pending" icon={Clock} value={s.pending} note="Pending, packed or dispatched" />
        <Kpi i={2} label="Completed" icon={CheckCircle2} value={s.completed} note={`${s.total ? Math.round((s.completed / s.total) * 100) : 0}% of orders delivered`} />
        <Kpi i={3} label="Cancelled" icon={XCircle} value={s.cancelled} invert note={`${s.total ? Math.round((s.cancelled / s.total) * 100) : 0}% of orders`} />
      </div>
      <div className="row r-2-1">
        <Card title="Orders per day" sub="Completed vs pending vs cancelled" action={<Legend items={[[COLORS.brand, 'Completed'], [COLORS.accentL, 'Pending'], [COLORS.slate, 'Cancelled']]} />}>
          <div style={{ height: 280 }}>
            <ResponsiveContainer>
              <BarChart data={daily} margin={{ top: 4, right: 4, left: -18, bottom: 0 }} barCategoryGap="22%">
                <CartesianGrid stroke="#eee" vertical={false} />
                <XAxis dataKey="day" {...axis} interval="preserveStartEnd" minTickGap={14} />
                <YAxis {...axis} allowDecimals={false} width={36} />
                <Tooltip content={<ChartTip />} cursor={{ fill: '#f4f4f5' }} />
                <Bar dataKey="completed" name="Completed" stackId="a" fill={COLORS.brand} animationDuration={800} />
                <Bar dataKey="pending" name="Pending" stackId="a" fill={COLORS.accentL} animationDuration={800} />
                <Bar dataKey="cancelled" name="Cancelled" stackId="a" fill={COLORS.slate} radius={[4, 4, 0, 0]} animationDuration={800} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card title="Status breakdown">
          <div className="donut">
            <div style={{ height: 180 }}>
              <ResponsiveContainer>
                <PieChart><Pie data={status} dataKey="value" nameKey="name" innerRadius={54} outerRadius={80} paddingAngle={2} stroke="none">{status.map((_, i) => <Cell key={i} fill={PIE[i % PIE.length]} />)}</Pie><Tooltip content={<ChartTip />} /></PieChart>
              </ResponsiveContainer>
              <div className="donut-mid"><b className="num">{s.total}</b><small>orders</small></div>
            </div>
            <ul className="donut-list">{status.map((x, i) => <li key={x.name}><i style={{ background: PIE[i % PIE.length] }} />{x.name}<b className="num">{x.value}</b></li>)}</ul>
          </div>
        </Card>
      </div>
      <div className="row r-1-2">
        <Card title="Orders by channel">
          <div style={{ height: 200 }}>
            <ResponsiveContainer>
              <BarChart data={channels} layout="vertical" margin={{ left: 8, right: 16 }}>
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="name" {...axis} width={96} tick={{ fontSize: 12.5, fill: '#17171a' }} />
                <Tooltip content={<ChartTip />} cursor={{ fill: '#f4f4f5' }} />
                <Bar dataKey="value" name="Orders" fill={COLORS.accent} radius={[0, 6, 6, 0]} barSize={20} animationDuration={800} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card title="Order register" sub="Latest 8 orders in this period" body={false}>
          <div className="table-wrap" style={{ marginTop: 12 }}>
            <table className="table">
              <thead><tr><th>Order</th><th className="hide-sm">Customer</th><th>Date</th><th className="r">Amount</th><th>Status</th></tr></thead>
              <tbody>{cur.slice(0, 8).map((o) => (
                <tr key={o.id}><td className="strong">{o.id}</td><td className="hide-sm">{o.customer}</td><td className="num">{fmtDateLong(o.date)}</td><td className="r num strong">{inr(o.amount)}</td><td><Badge>{o.status}</Badge></td></tr>
              ))}</tbody>
            </table>
          </div>
        </Card>
      </div>
    </>
  );
}

function ProductTally({ cur, products }) {
  const cats = categoryStats(products, cur);
  const top = topProducts(products, cur, 6);
  const sold = soldMap(cur);
  const totalStock = products.reduce((s, p) => s + (p.stock || 0), 0);
  const totalSold = Object.values(sold).reduce((a, b) => a + b, 0);
  const low = products.filter(isLowStock).sort((a, b) => a.stock - b.stock);
  const out = products.filter((p) => p.stock === 0).length;
  return (
    <>
      <div className="kpis">
        <Kpi i={0} label="Products listed" icon={Package} value={products.length} note={`${products.filter((p) => p.isNew).length} new arrivals`} />
        <Kpi i={1} label="Units sold" icon={TrendingUp} value={totalSold} note="In selected period" />
        <Kpi i={2} label="Units available" icon={Boxes} value={totalStock} note="Current stock on hand" />
        <Kpi i={3} label="Low / out of stock" icon={AlertTriangle} value={`${low.length} / ${out}`} note="5 or fewer units" />
      </div>
      <div className="row r-2-1">
        <Card title="Sold vs available by category" action={<Legend items={[[COLORS.accent, 'Sold'], [COLORS.brand, 'Available']]} />}>
          <div style={{ height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={cats} margin={{ top: 4, right: 4, left: -14, bottom: 0 }} barGap={3}>
                <CartesianGrid stroke="#eee" vertical={false} />
                <XAxis dataKey="name" {...axis} interval={0} tick={{ fontSize: 10.5, fill: '#6b6b75' }} />
                <YAxis {...axis} width={40} />
                <Tooltip content={<ChartTip />} cursor={{ fill: '#f4f4f5' }} />
                <Bar dataKey="sold" name="Sold" fill={COLORS.accent} radius={[4, 4, 0, 0]} animationDuration={800} />
                <Bar dataKey="available" name="Available" fill={COLORS.brand} radius={[4, 4, 0, 0]} animationDuration={800} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card title="Top sellers" sub="Units sold">
          {top.map((p, i) => (
            <div key={p.id} className="list-row">
              <span className="rank num">{i + 1}</span>
              <div className="grow"><b className="clamp1">{p.name}</b><div className="bar"><span style={{ width: `${(p.sold / top[0].sold) * 100}%` }} /></div></div>
              <span className="num strong">{p.sold}</span>
            </div>
          ))}
        </Card>
      </div>
      <div className="row">
        <Card title="Stock register" sub="Sold in period vs current stock, per product" body={false}>
          <div className="table-wrap" style={{ marginTop: 12, maxHeight: 460 }}>
            <table className="table">
              <thead><tr><th>Product</th><th className="hide-sm">Category</th><th className="r">Sold</th><th className="r">Available</th><th>Status</th></tr></thead>
              <tbody>{[...products].sort((a, b) => (sold[b.id] || 0) - (sold[a.id] || 0)).map((p) => {
                const st = p.stock == null ? 'TBC' : p.stock === 0 ? 'Out of stock' : isLowStock(p) ? 'Low stock' : 'In stock';
                return (
                  <tr key={p.id}>
                    <td><span className="cell-prod"><img src={p.img} alt="" /><span><b>{p.name}</b><small>per {p.unit}</small></span></span></td>
                    <td className="hide-sm">{p.category}</td>
                    <td className="r num strong">{sold[p.id] || 0}</td>
                    <td className="r num">{p.stock ?? '—'}</td>
                    <td><Badge>{st}</Badge></td>
                  </tr>
                );
              })}</tbody>
            </table>
          </div>
        </Card>
      </div>
    </>
  );
}

function BillingTally({ cur, prev, orders }) {
  const b = billingStats(cur); const bp = billingStats(prev);
  const weeks = salesByWeek(orders, 6);
  const modes = paymentModes(cur);
  const pending = cur.filter((o) => o.status !== 'Cancelled' && o.payment !== 'Paid');
  return (
    <>
      <div className="kpis">
        <Kpi i={0} label="Total bills" icon={ReceiptText} value={b.bills} note={`Avg bill ${inr(b.avg)}`} />
        <Kpi i={1} label="Sales amount" icon={IndianRupee} value={inr(b.sales)} delta={pct(b.sales, bp.sales)} note="vs previous period" />
        <Kpi i={2} label="Received" icon={Wallet} value={inr(b.received)} note={`${b.sales ? Math.round((b.received / b.sales) * 100) : 0}% collected`} />
        <Kpi i={3} label="Pending payments" icon={Hourglass} value={inr(b.pending)} note={`${b.pendingCount} bills · ${b.overdueCount} overdue`} />
      </div>
      <div className="row r-2-1">
        <Card title="Weekly sales" sub="Received vs pending, with total" action={<Legend items={[[COLORS.brand, 'Received'], [COLORS.accentL, 'Pending'], [COLORS.accent, 'Total']]} />}>
          <div style={{ height: 290 }}>
            <ResponsiveContainer>
              <ComposedChart data={weeks} margin={{ top: 6, right: 6, left: -6, bottom: 0 }}>
                <CartesianGrid stroke="#eee" vertical={false} />
                <XAxis dataKey="week" {...axis} />
                <YAxis {...axis} width={46} tickFormatter={(v) => (v >= 1000 ? `${Math.round(v / 1000)}k` : v)} />
                <Tooltip content={<ChartTip money />} cursor={{ fill: '#f4f4f5' }} />
                <Bar dataKey="received" name="Received" stackId="s" fill={COLORS.brand} barSize={34} animationDuration={800} />
                <Bar dataKey="pending" name="Pending" stackId="s" fill={COLORS.accentL} radius={[4, 4, 0, 0]} animationDuration={800} />
                <Line dataKey="total" name="Total" stroke={COLORS.accent} strokeWidth={2.2} dot={{ r: 3.5, fill: COLORS.accent }} animationDuration={1000} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card title="Payment modes" sub="Billed amount">
          <div className="donut">
            <div style={{ height: 180 }}>
              <ResponsiveContainer>
                <PieChart><Pie data={modes} dataKey="value" nameKey="name" innerRadius={54} outerRadius={80} paddingAngle={2} stroke="none">{modes.map((_, i) => <Cell key={i} fill={PIE[i % PIE.length]} />)}</Pie><Tooltip content={<ChartTip money />} /></PieChart>
              </ResponsiveContainer>
            </div>
            <ul className="donut-list">{modes.map((x, i) => <li key={x.name}><i style={{ background: PIE[i % PIE.length] }} />{x.name}<b className="num">{inr(x.value)}</b></li>)}</ul>
          </div>
        </Card>
      </div>
      <div className="row">
        <Card title="Pending payments" sub={`${pending.length} unpaid bills in this period`} body={false}>
          <div className="table-wrap" style={{ marginTop: 12 }}>
            <table className="table">
              <thead><tr><th>Bill</th><th className="hide-sm">Customer</th><th>Due</th><th className="hide-sm">Mode</th><th className="r">Amount</th><th>Status</th></tr></thead>
              <tbody>
                {pending.length === 0 && <tr><td colSpan={6} className="muted" style={{ textAlign: 'center', padding: 28 }}>No pending payments in this period</td></tr>}
                {pending.map((o) => (
                  <tr key={o.id}><td className="strong">{o.invoice}</td><td className="hide-sm">{o.customer}</td><td className="num">{fmtDateLong(o.due)}</td><td className="hide-sm">{o.mode}</td><td className="r num strong">{inr(o.amount)}</td><td><Badge>{isOverdue(o) ? 'Overdue' : 'Due soon'}</Badge></td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </>
  );
}

export default function Tally() {
  const { orders, products, toast } = useAdmin();
  const [range, setRange] = useState('30');
  const [tab, setTab] = useState('orders');
  const days = RANGES.find((r) => r.id === range).days;
  const cur = useMemo(() => inRange(orders, days), [orders, days]);
  const prev = useMemo(() => prevRange(orders, days), [orders, days]);

  const exportCSV = () => {
    if (tab === 'orders') downloadCSV(`order-tally-${range}`, [['Order', 'Date', 'Customer', 'Channel', 'Items', 'Amount', 'Status'], ...cur.map((o) => [o.id, fmtDateLong(o.date), o.customer, o.channel, o.items.map((i) => `${i.name} x${i.qty}`).join('; '), o.amount, o.status])]);
    if (tab === 'products') { const s = soldMap(cur); downloadCSV(`product-tally-${range}`, [['Product', 'Category', 'Unit', 'Price', 'Sold', 'Available'], ...products.map((p) => [p.name, p.category, p.unit, p.price, s[p.id] || 0, p.stock ?? 'TBC'])]); }
    if (tab === 'billing') downloadCSV(`billing-tally-${range}`, [['Invoice', 'Order', 'Date', 'Customer', 'Mode', 'Amount', 'Paid', 'Payment status', 'Due'], ...cur.filter((o) => o.status !== 'Cancelled').map((o) => [o.invoice, o.id, fmtDateLong(o.date), o.customer, o.mode, o.amount, o.paid, o.payment, fmtDateLong(o.due)])]);
    toast('Exported to Excel (CSV)');
  };

  return (
    <Page>
      <PageHead title="Tally" sub="Order, product and billing records — computed live from your orders and stock.">
        <button className="btn btn-outline" onClick={exportCSV}><Download size={16} /> Export to Excel</button>
      </PageHead>
      <div className="tally-bar">
        <Tabs label="Tally type" value={tab} onChange={setTab} options={[{ id: 'orders', label: 'Order tally' }, { id: 'products', label: 'Product tally' }, { id: 'billing', label: 'Billing tally' }]} />
        <Seg label="Date range" options={RANGES} value={range} onChange={setRange} />
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.25 }}>
          {tab === 'orders' && <OrderTally cur={cur} prev={prev} orders={orders} days={days} />}
          {tab === 'products' && <ProductTally cur={cur} products={products} />}
          {tab === 'billing' && <BillingTally cur={cur} prev={prev} orders={orders} />}
        </motion.div>
      </AnimatePresence>
    </Page>
  );
}

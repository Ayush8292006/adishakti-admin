import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell } from 'recharts';
import { IndianRupee, ShoppingCart, Clock, PackageX, ArrowRight } from 'lucide-react';
import { useAdmin } from '../context/AdminContext.jsx';
import { Page, PageHead, Card, Kpi, Badge, Seg, ChartTip, inr, inrShort, COLORS, PIE } from '../components/ui.jsx';
import { RANGES, inRange, prevRange, pct, orderStats, perDay, statusBreakdown, billingStats, topProducts, fmtDate, fmtTime } from '../data/tally.js';
import { isLowStock } from '../data/products.js';
import './pages.css';

export default function Dashboard() {
  const { orders, products, user } = useAdmin();
  const navigate = useNavigate();
  const [range, setRange] = useState('30');
  const days = RANGES.find((r) => r.id === range).days;

  const d = useMemo(() => {
    const cur = inRange(orders, days);
    const prev = prevRange(orders, days);
    const b = billingStats(cur); const bp = billingStats(prev);
    const s = orderStats(cur); const sp = orderStats(prev);
    return { cur, b, s, salesDelta: pct(b.sales, bp.sales), orderDelta: pct(s.total, sp.total), trend: perDay(orders, days), status: statusBreakdown(cur), top: topProducts(products, cur, 5) };
  }, [orders, products, days]);

  const low = products.filter(isLowStock).sort((a, b) => a.stock - b.stock);
  const recent = orders.slice(0, 6);
  const hour = new Date().getHours();

  return (
    <Page>
      <PageHead title={`Good ${hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening'}, ${user.name}`} sub="Here’s what’s happening at Adi Shakti Trader.">
        <Seg label="Date range" options={RANGES} value={range} onChange={setRange} />
      </PageHead>

      <div className="kpis">
        <Kpi i={0} label="Sales" icon={IndianRupee} value={inr(d.b.sales)} delta={range === 'all' ? null : d.salesDelta} note={range === 'all' ? `${d.b.bills} bills` : 'vs previous period'} />
        <Kpi i={1} label="Orders" icon={ShoppingCart} value={d.s.total} delta={range === 'all' ? null : d.orderDelta} note={`${d.s.pending} open · ${d.s.completed} delivered`} />
        <Kpi i={2} label="Pending payments" icon={Clock} value={inr(d.b.pending)} note={`${d.b.pendingCount} bills · ${d.b.overdueCount} overdue`} />
        <Kpi i={3} label="Low stock items" icon={PackageX} value={low.length} note="5 or fewer units left" />
      </div>

      <div className="row r-2-1">
        <Card title="Sales trend" sub={`Daily sales · ${RANGES.find((r) => r.id === range).label.toLowerCase()}`} delay={0.1}
          action={<span className="big-num num">{inrShort(d.b.sales)}</span>}>
          <div style={{ height: 260 }}>
            <ResponsiveContainer>
              <AreaChart data={d.trend} margin={{ top: 6, right: 6, left: -12, bottom: 0 }}>
                <defs>
                  <linearGradient id="gSales" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={COLORS.accent} stopOpacity={0.22} /><stop offset="100%" stopColor={COLORS.accent} stopOpacity={0} /></linearGradient>
                </defs>
                <CartesianGrid stroke="#eee" vertical={false} />
                <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#6b6b75' }} interval="preserveStartEnd" minTickGap={18} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#6b6b75' }} tickFormatter={(v) => (v >= 1000 ? `${v / 1000}k` : v)} width={44} />
                <Tooltip content={<ChartTip money />} />
                <Area type="monotone" dataKey="sales" name="Sales" stroke={COLORS.accent} strokeWidth={2.2} fill="url(#gSales)" animationDuration={900} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Order status" sub={`${d.s.total} orders`} delay={0.15}>
          <div className="donut">
            <div style={{ height: 190 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={d.status} dataKey="value" nameKey="name" innerRadius={58} outerRadius={84} paddingAngle={2} stroke="none" animationDuration={900}>
                    {d.status.map((_, i) => <Cell key={i} fill={PIE[i % PIE.length]} />)}
                  </Pie>
                  <Tooltip content={<ChartTip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="donut-mid"><b className="num">{d.s.total}</b><small>orders</small></div>
            </div>
            <ul className="donut-list">
              {d.status.map((s, i) => <li key={s.name}><i style={{ background: PIE[i % PIE.length] }} />{s.name}<b className="num">{s.value}</b></li>)}
            </ul>
          </div>
        </Card>
      </div>

      <div className="row r-2-1">
        <Card title="Recent orders" action={<Link to="/orders" className="btn btn-ghost btn-sm">View all <ArrowRight size={14} /></Link>} body={false} delay={0.2}>
          <div className="table-wrap" style={{ marginTop: 12 }}>
            <table className="table">
              <thead><tr><th>Order</th><th>Customer</th><th>Date</th><th className="r">Amount</th><th>Status</th></tr></thead>
              <tbody>
                {recent.map((o) => (
                  <tr key={o.id} className="clickable" onClick={() => navigate(`/orders?open=${o.id}`)}>
                    <td className="strong">{o.id}</td>
                    <td>{o.customer}<span className="cell-sub">{o.channel}</span></td>
                    <td className="num">{fmtDate(o.date)}<span className="cell-sub">{fmtTime(o.date)}</span></td>
                    <td className="r num strong">{inr(o.amount)}</td>
                    <td><Badge>{o.status}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="stack">
          <Card title="Low stock" sub="Reorder soon" action={<Link to="/products?filter=low" className="btn btn-ghost btn-sm">Manage</Link>} delay={0.25}>
            {low.slice(0, 5).map((p) => (
              <div key={p.id} className="list-row">
                <img className="thumb" src={p.img} alt="" />
                <div className="grow"><b className="clamp1">{p.name}</b><small className="muted">{p.category}</small></div>
                <Badge tone={p.stock <= 2 ? 'b-bad' : 'b-warn'}>{p.stock} left</Badge>
              </div>
            ))}
          </Card>
          <Card title="Top products" sub="By units sold" delay={0.3}>
            {d.top.map((p, i) => (
              <div key={p.id} className="list-row">
                <span className="rank num">{i + 1}</span>
                <div className="grow"><b className="clamp1">{p.name}</b><div className="bar"><span style={{ width: `${(p.sold / d.top[0].sold) * 100}%` }} /></div></div>
                <span className="num strong">{p.sold}</span>
              </div>
            ))}
          </Card>
        </div>
      </div>
      <p className="sample-note muted">Figures are generated sample data for the prototype.</p>
    </Page>
  );
}

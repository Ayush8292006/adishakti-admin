import { useEffect, useMemo, useRef, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, BarChart3, ShoppingCart, Package, ReceiptText, Video, Store, Settings, LogOut, Menu, X, Search, Bell, ChevronDown,
} from 'lucide-react';
import { useAdmin } from '../context/AdminContext.jsx';
import { Toasts } from './ui.jsx';
import { isOverdue } from '../data/tally.js';
import './Shell.css';

export function Brand({ size = 'md' }) {
  return (
    <span className={`brand brand-${size}`}>
      <picture className="brand-logo">
        <source srcSet="/logo.webp" type="image/webp" />
        <img src="/logo.png" alt="Adi Shakti Trader" width="446" height="360" />
      </picture>
      {size !== 'xl' && <span className="brand-tag">Admin Panel</span>}
    </span>
  );
}

function GlobalSearch() {
  const { orders, products } = useAdmin();
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const box = useRef(null);
  const res = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return { o: [], p: [] };
    return {
      o: orders.filter((x) => x.id.toLowerCase().includes(s) || x.invoice.toLowerCase().includes(s) || x.customer.toLowerCase().includes(s)).slice(0, 4),
      p: products.filter((x) => x.name.toLowerCase().includes(s)).slice(0, 4),
    };
  }, [q, orders, products]);
  useEffect(() => {
    const close = (e) => { if (box.current && !box.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);
  const go = (to) => { setOpen(false); setQ(''); navigate(to); };

  return (
    <div className="gsearch" ref={box}>
      <label className="search">
        <Search size={16} />
        <span className="sr-only">Search orders, invoices, products</span>
        <input className="input" value={q} onChange={(e) => { setQ(e.target.value); setOpen(true); }} onFocus={() => setOpen(true)} placeholder="Search orders, invoices, products…" />
      </label>
      <AnimatePresence>
        {open && q.trim() && (
          <motion.div className="gsearch-pop" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.15 }}>
            {!res.o.length && !res.p.length && <p className="muted gs-empty">No results for “{q}”</p>}
            {res.o.length > 0 && <span className="gs-label">Orders</span>}
            {res.o.map((o) => <button key={o.id} onClick={() => go(`/orders?open=${o.id}`)}><b>{o.id}</b><span className="muted">{o.customer}</span></button>)}
            {res.p.length > 0 && <span className="gs-label">Products</span>}
            {res.p.map((p) => <button key={p.id} onClick={() => go(`/products?q=${encodeURIComponent(p.name)}`)}><img src={p.img} alt="" /><span>{p.name}</span></button>)}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Shell() {
  const admin = useAdmin();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [mobileNav, setMobileNav] = useState(false);
  const [menu, setMenu] = useState(false);
  useEffect(() => { setMobileNav(false); setMenu(false); }, [pathname]);

  if (!admin.user) return <Navigate to="/login" replace />;

  const newOrders = admin.orders.filter((o) => o.status === 'Pending').length;
  const overdue = admin.orders.filter(isOverdue).length;
  const pendingPartners = admin.partners.filter((p) => p.status === 'Pending').length;

  const NAV = [
    { group: 'Overview', items: [
      { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
      { to: '/tally', label: 'Tally', icon: BarChart3 },
    ] },
    { group: 'Store', items: [
      { to: '/orders', label: 'Orders', icon: ShoppingCart, count: newOrders },
      { to: '/products', label: 'Products & Stock', icon: Package },
      { to: '/billing', label: 'Billing', icon: ReceiptText, count: overdue, tone: 'bad' },
      { to: '/videos', label: 'Demo Videos', icon: Video },
      { to: '/partners', label: 'Partner Stores', icon: Store, count: pendingPartners },
    ] },
    { group: 'System', items: [{ to: '/settings', label: 'Settings', icon: Settings }] },
  ];

  const sidebar = (
    <>
      <div className="side-top"><Brand /></div>
      <nav className="side-nav" aria-label="Admin">
        {NAV.map((g) => (
          <div key={g.group} className="side-group">
            <span className="side-label">{g.group}</span>
            {g.items.map(({ to, label, icon: Icon, end, count, tone }) => (
              <NavLink key={to} to={to} end={end} className={({ isActive }) => `side-link ${isActive ? 'on' : ''}`}>
                {({ isActive }) => (
                  <>
                    {isActive && <motion.span layoutId="side-active" className="side-active" transition={{ type: 'spring', stiffness: 420, damping: 36 }} />}
                    <Icon size={18} /><span className="side-text">{label}</span>
                    {count > 0 && <span className={`side-count ${tone || ''}`}>{count}</span>}
                  </>
                )}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>
      <div className="side-foot">
        <div className="side-store"><b>Adi Shakti Trader</b><small>Gandhi Bazaar, Bengaluru</small></div>
      </div>
    </>
  );

  return (
    <div className="shell">
      <aside className="side desktop">{sidebar}</aside>
      <AnimatePresence>
        {mobileNav && (
          <motion.div className="side-ov" onClick={() => setMobileNav(false)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.aside className="side mobile" onClick={(e) => e.stopPropagation()} initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'spring', stiffness: 340, damping: 36 }}>
              <button className="icon-btn side-close" onClick={() => setMobileNav(false)} aria-label="Close menu"><X size={18} /></button>
              {sidebar}
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="main">
        <header className="top">
          <button className="icon-btn top-menu" onClick={() => setMobileNav(true)} aria-label="Open menu"><Menu size={20} /></button>
          <span className="top-logo"><Brand size="sm" /></span>
          <GlobalSearch />
          <div className="top-right">
            <button className="icon-btn top-bell" aria-label={`${newOrders + overdue} notifications`} onClick={() => navigate('/orders?status=Pending')}>
              <Bell size={18} />{newOrders + overdue > 0 && <i />}
            </button>
            <div className="profile">
              <button className="profile-btn" onClick={() => setMenu((m) => !m)} aria-expanded={menu}>
                <span className="avatar">{admin.user.name.slice(0, 2).toUpperCase()}</span>
                <span className="profile-txt"><b>{admin.user.name}</b><small>Super Admin</small></span>
                <ChevronDown size={16} />
              </button>
              <AnimatePresence>
                {menu && (
                  <motion.div className="profile-menu" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.15 }}>
                    <button onClick={() => navigate('/settings')}><Settings size={16} /> Settings</button>
                    <button className="danger" onClick={() => { admin.logout(); navigate('/login'); }}><LogOut size={16} /> Log out</button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>
        <main className="content"><Outlet /></main>
      </div>
      <Toasts />
    </div>
  );
}

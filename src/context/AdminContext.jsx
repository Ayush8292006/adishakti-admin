import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { PRODUCTS } from '../data/products.js';
import { VIDEOS } from '../data/videos.js';
import { SAMPLE_ORDERS } from '../data/orders.js';

const Ctx = createContext(null);

// SAMPLE partner data — replace with API
const PARTNERS = [
  { id: 'PS-1021', name: 'Partner store #1', area: 'Jayanagar, Bengaluru', category: 'Cake toppers', products: 24, status: 'Active', since: '2026-09-12', sales: 18400 },
  { id: 'PS-1022', name: 'Partner store #2', area: 'Mysuru', category: 'Packing boxes', products: 12, status: 'Active', since: '2026-10-02', sales: 9650 },
  { id: 'PS-1023', name: 'Partner store #3', area: 'Malleshwaram, Bengaluru', category: 'Baking tools', products: 31, status: 'Pending', since: '2026-11-06', sales: 0 },
  { id: 'PS-1024', name: 'Partner store #4', area: 'Hubballi', category: 'Ribbons & décor', products: 18, status: 'Pending', since: '2026-11-08', sales: 0 },
];

export function AdminProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem('ast-admin')) || null; } catch { return null; }
  });
  const [orders, setOrders] = useState(SAMPLE_ORDERS);
  const [products, setProducts] = useState(PRODUCTS);
  const [videos, setVideos] = useState(VIDEOS);
  const [partners, setPartners] = useState(PARTNERS);
  const [toasts, setToasts] = useState([]);
  const tid = useRef(0);

  const toast = useCallback((text, tone = 'ok') => {
    const id = ++tid.current;
    setToasts((t) => [...t, { id, text, tone }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2800);
  }, []);

  const value = useMemo(() => ({
    user,
    login: (u) => { sessionStorage.setItem('ast-admin', JSON.stringify(u)); setUser(u); },
    logout: () => { sessionStorage.removeItem('ast-admin'); setUser(null); },
    orders,
    setOrderStatus: (id, status) => setOrders((os) => os.map((o) => (o.id === id ? { ...o, status, payment: status === 'Cancelled' ? 'Refunded' : o.payment, paid: status === 'Cancelled' ? 0 : o.paid } : o))),
    markPaid: (id) => setOrders((os) => os.map((o) => (o.id === id ? { ...o, payment: 'Paid', paid: o.amount } : o))),
    products,
    setStock: (id, stock) => setProducts((ps) => ps.map((p) => (p.id === id ? { ...p, stock: Math.max(0, stock) } : p))),
    saveProduct: (prod) => setProducts((ps) => (ps.some((p) => p.id === prod.id) ? ps.map((p) => (p.id === prod.id ? { ...p, ...prod } : p)) : [{ ...prod, id: Math.max(...ps.map((p) => p.id)) + 1 }, ...ps])),
    deleteProduct: (id) => setProducts((ps) => ps.filter((p) => p.id !== id)),
    videos,
    addVideo: (v) => setVideos((vs) => [{ ...v, id: `v${Date.now()}` }, ...vs]),
    deleteVideo: (id) => setVideos((vs) => vs.filter((v) => v.id !== id)),
    partners,
    setPartnerStatus: (id, status) => setPartners((ps) => ps.map((p) => (p.id === id ? { ...p, status } : p))),
    toasts, toast,
  }), [user, orders, products, videos, partners, toasts, toast]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useAdmin = () => useContext(Ctx);

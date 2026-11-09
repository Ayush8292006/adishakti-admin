import { useEffect, useId } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowUpRight, ArrowDownRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAdmin } from '../context/AdminContext.jsx';

export const COLORS = { brand: '#4A2316', accent: '#B8235A', accentL: '#E9A6BF', sand: '#D4B497', slate: '#A1A1AA', ok: '#2F9E63' };
export const PIE = ['#4A2316', '#B8235A', '#D4B497', '#E9A6BF', '#A1A1AA'];
export const inr = (n) => '₹' + Math.round(n).toLocaleString('en-IN');
export const inrShort = (n) => (n >= 100000 ? `₹${(n / 100000).toFixed(2)}L` : n >= 1000 ? `₹${(n / 1000).toFixed(1)}k` : inr(n));

const fadeUp = { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 } };

export function Page({ children }) {
  return <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}>{children}</motion.div>;
}

export function PageHead({ title, sub, children }) {
  return (
    <div className="page-head">
      <div><h1>{title}</h1>{sub && <p>{sub}</p>}</div>
      {children && <div className="page-actions">{children}</div>}
    </div>
  );
}

export function Card({ title, sub, action, children, className = '', body = true, delay = 0 }) {
  return (
    <motion.section className={`card ${className}`} {...fadeUp} transition={{ duration: 0.4, delay, ease: [0.22, 1, 0.36, 1] }}>
      {(title || action) && (
        <div className="card-head">
          <div>{title && <h2>{title}</h2>}{sub && <p>{sub}</p>}</div>
          {action}
        </div>
      )}
      {body ? <div className="card-body">{children}</div> : children}
    </motion.section>
  );
}

export function Kpi({ label, value, icon: Icon, delta, note, i = 0, invert = false }) {
  const good = delta == null ? null : invert ? delta <= 0 : delta >= 0;
  return (
    <motion.div className="card kpi" {...fadeUp} transition={{ duration: 0.4, delay: i * 0.05 }}>
      <div className="kpi-top"><span className="kpi-label">{label}</span>{Icon && <span className="kpi-ico"><Icon size={16} /></span>}</div>
      <div className="kpi-value num">{value}</div>
      <div className="kpi-note">
        {delta != null && (
          <span className={`delta ${good ? 'up' : 'down'}`}>
            {delta >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}{Math.abs(delta)}%
          </span>
        )}
        <span>{note}</span>
      </div>
    </motion.div>
  );
}

const TONE = {
  Pending: 'b-warn', Packed: 'b-info', Dispatched: 'b-info', Delivered: 'b-ok', Cancelled: 'b-bad',
  Paid: 'b-ok', Refunded: 'b-neutral', Overdue: 'b-bad', 'Due soon': 'b-warn',
  Active: 'b-ok', Rejected: 'b-bad', 'In stock': 'b-ok', 'Low stock': 'b-warn', 'Out of stock': 'b-bad', TBC: 'b-neutral',
};
export function Badge({ children, tone }) {
  return <span className={`badge ${tone || TONE[children] || 'b-neutral'}`}>{children}</span>;
}

export function Seg({ options, value, onChange, label }) {
  const id = useId();
  return (
    <div className="seg" role="tablist" aria-label={label}>
      {options.map((o) => (
        <button key={o.id} role="tab" aria-selected={value === o.id} className={value === o.id ? 'on' : ''} onClick={() => onChange(o.id)}>
          {value === o.id && <motion.span layoutId={`seg-${id}`} className="seg-pill" transition={{ type: 'spring', stiffness: 500, damping: 38 }} />}
          <span>{o.label}</span>
        </button>
      ))}
    </div>
  );
}

export function Tabs({ options, value, onChange, label }) {
  const id = useId();
  return (
    <div className="tabs" role="tablist" aria-label={label}>
      {options.map((o) => (
        <button key={o.id} role="tab" aria-selected={value === o.id} className={value === o.id ? 'on' : ''} onClick={() => onChange(o.id)}>
          {o.label}
          {value === o.id && <motion.span layoutId={`tab-${id}`} className="tab-line" transition={{ type: 'spring', stiffness: 500, damping: 40 }} />}
        </button>
      ))}
    </div>
  );
}

function useEsc(open, onClose) {
  useEffect(() => {
    if (!open) return undefined;
    const k = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', k);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', k); document.body.style.overflow = ''; };
  }, [open, onClose]);
}

export function Modal({ open, onClose, title, children, footer, width = 560 }) {
  useEsc(open, onClose);
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="ov" onClick={onClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.div className="modal" role="dialog" aria-modal="true" aria-label={title} style={{ maxWidth: width }} onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, y: 16, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 12, scale: 0.98 }} transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}>
            <div className="modal-head"><h2>{title}</h2><button className="icon-btn" onClick={onClose} aria-label="Close"><X size={18} /></button></div>
            <div className="modal-body">{children}</div>
            {footer && <div className="modal-foot">{footer}</div>}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function Drawer({ open, onClose, title, children, footer }) {
  useEsc(open, onClose);
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="ov ov-right" onClick={onClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.aside className="drawer" role="dialog" aria-modal="true" aria-label={title} onClick={(e) => e.stopPropagation()}
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', stiffness: 320, damping: 36 }}>
            <div className="modal-head"><h2>{title}</h2><button className="icon-btn" onClick={onClose} aria-label="Close"><X size={18} /></button></div>
            <div className="drawer-body">{children}</div>
            {footer && <div className="modal-foot">{footer}</div>}
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function Toasts() {
  const { toasts } = useAdmin();
  return (
    <div className="toasts" aria-live="polite">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div key={t.id} className={`toast ${t.tone}`} layout initial={{ opacity: 0, y: 16, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, x: 40 }}>
            {t.tone === 'ok' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}<span>{t.text}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

export function ChartTip({ active, payload, label, money = false }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="tip">
      {label != null && <b>{label}</b>}
      {payload.map((p) => (
        <div key={p.dataKey || p.name} className="tip-row">
          <span><i style={{ background: p.color || p.payload?.fill }} /> {p.name}</span>
          <strong className="num">{money ? inr(p.value) : p.value}</strong>
        </div>
      ))}
    </div>
  );
}

export function Legend({ items }) {
  return <div className="legend">{items.map(([c, l]) => <span key={l}><i style={{ background: c }} />{l}</span>)}</div>;
}

export function Empty({ icon: Icon, title, text }) {
  return <div className="empty">{Icon && <Icon size={32} />}<b style={{ display: 'block', color: 'var(--text)' }}>{title}</b>{text && <p style={{ margin: '4px 0 0' }}>{text}</p>}</div>;
}

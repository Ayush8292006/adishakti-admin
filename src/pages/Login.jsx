import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Lock, ArrowRight, BarChart3, ShieldCheck, Video } from 'lucide-react';
import { useAdmin } from '../context/AdminContext.jsx';
import { Brand } from '../components/Shell.jsx';
import './Login.css';

const EASE = [0.22, 1, 0.36, 1];

export default function Login() {
  const admin = useAdmin();
  const navigate = useNavigate();
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  if (admin.user) return <Navigate to="/" replace />;

  const submit = (e) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const id = String(f.get('id') || '').trim();
    const pw = String(f.get('password') || '');
    if (!id || pw.length < 4) { setError('Enter your admin ID and a password of at least 4 characters.'); return; }
    setError('');
    setBusy(true);
    // Prototype: accepts any ID/password. Connect to the backend auth API here.
    setTimeout(() => { admin.login({ name: id.split('@')[0].replace(/^\w/, (c) => c.toUpperCase()) || 'Admin', id }); navigate('/'); }, 700);
  };

  return (
    <div className="login">
      <section className="login-side" aria-hidden="true">
        <Brand light />
        <div className="login-side-mid">
          <motion.h2 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: EASE }}>
            Run the whole store from one place.
          </motion.h2>
          <ul>
            {[[BarChart3, 'Order, product & billing tally'], [ShieldCheck, 'Stock, invoices & payments'], [Video, 'Cake demo videos & partner stores']].map(([I, t], i) => (
              <motion.li key={t} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + i * 0.08, duration: 0.5 }}>
                <span><I size={16} /></span>{t}
              </motion.li>
            ))}
          </ul>
        </div>
        <small>Adi Shakti Trader · Gandhi Bazaar, Basavanagudi, Bengaluru</small>
      </section>

      <section className="login-main">
        <motion.form className="login-card" onSubmit={submit} noValidate initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE }}>
          <div className="login-mob-brand"><Brand /></div>
          <span className="login-lock"><Lock size={18} /></span>
          <h1>Admin sign in</h1>
          <p className="muted">Sign in to manage orders, stock, billing and videos.</p>

          <label className="field"><span>Admin ID or email</span><input className="input" name="id" autoComplete="username" placeholder="admin@adishakti" autoFocus /></label>
          <label className="field">
            <span>Password</span>
            <span className="pw">
              <input className="input" name="password" type={show ? 'text' : 'password'} autoComplete="current-password" placeholder="Enter password" />
              <button type="button" className="icon-btn" onClick={() => setShow((s) => !s)} aria-label={show ? 'Hide password' : 'Show password'}>{show ? <EyeOff size={16} /> : <Eye size={16} />}</button>
            </span>
          </label>
          <div className="login-row">
            <label className="check"><input type="checkbox" defaultChecked /> Keep me signed in</label>
            <button type="button" className="link-btn">Forgot password?</button>
          </div>
          {error && <p className="login-err" role="alert">{error}</p>}
          <button className="btn btn-primary login-btn" disabled={busy}>{busy ? 'Signing in…' : <>Sign in <ArrowRight size={16} /></>}</button>
          <p className="login-note muted">Prototype — any admin ID and password (4+ characters) works.</p>
        </motion.form>
      </section>
    </div>
  );
}

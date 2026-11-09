import { useState } from 'react';
import { Save } from 'lucide-react';
import { useAdmin } from '../context/AdminContext.jsx';
import { Page, PageHead, Card } from '../components/ui.jsx';
import { STORE } from '../data/store.js';
import './pages.css';

function Switch({ label, sub, defaultChecked }) {
  return (
    <label className="toggle">
      <span><b>{label}</b><small>{sub}</small></span>
      <span className="switch"><input type="checkbox" defaultChecked={defaultChecked} /><span /></span>
    </label>
  );
}

export default function Settings() {
  const admin = useAdmin();
  const [form, setForm] = useState({ name: STORE.name, tagline: STORE.tagline, address: STORE.address, gstin: STORE.gstin, phone1: STORE.phones[0], phone2: STORE.phones[1] });
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const save = (e) => { e.preventDefault(); admin.toast('Settings saved'); };

  return (
    <Page>
      <PageHead title="Settings" sub="Store profile, notifications and account." />
      <div className="settings-grid">
        <Card title="Store profile" sub="Shown on invoices, the website footer and the app">
          <form className="form-grid two" onSubmit={save}>
            <label className="field"><span>Store name</span><input className="input" value={form.name} onChange={set('name')} /></label>
            <label className="field"><span>Tagline</span><input className="input" value={form.tagline} onChange={set('tagline')} /></label>
            <label className="field full"><span>Address</span><textarea className="textarea" value={form.address} onChange={set('address')} /></label>
            <label className="field"><span>Order booking phone</span><input className="input num" value={form.phone1} onChange={set('phone1')} /></label>
            <label className="field"><span>Mobile</span><input className="input num" value={form.phone2} onChange={set('phone2')} /></label>
            <label className="field full"><span>GSTIN</span><input className="input num" value={form.gstin} onChange={set('gstin')} /><small className="muted">Read from the visiting card photo — please confirm before printing invoices.</small></label>
            <div className="full"><button className="btn btn-primary"><Save size={16} /> Save changes</button></div>
          </form>
        </Card>
        <div className="stack">
          <Card title="Notifications">
            <Switch label="New order alerts" sub="Notify when a customer places an order" defaultChecked />
            <Switch label="Low stock alerts" sub="When a product drops to 5 units or fewer" defaultChecked />
            <Switch label="Overdue payment reminders" sub="Daily summary of overdue bills" defaultChecked />
            <Switch label="Partner requests" sub="When a new store applies to partner" />
          </Card>
          <Card title="Account">
            <form className="form-grid" onSubmit={(e) => { e.preventDefault(); admin.toast('Password updated'); e.currentTarget.reset(); }}>
              <label className="field"><span>Signed in as</span><input className="input" value={admin.user.id} readOnly /></label>
              <label className="field"><span>New password</span><input className="input" type="password" autoComplete="new-password" minLength={6} required /></label>
              <div><button className="btn btn-outline">Update password</button></div>
            </form>
          </Card>
        </div>
      </div>
    </Page>
  );
}

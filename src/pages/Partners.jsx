import { useState } from 'react';
import { Store, Clock, IndianRupee, Package, CheckCircle2, XCircle, Users } from 'lucide-react';
import { useAdmin } from '../context/AdminContext.jsx';
import { Page, PageHead, Card, Kpi, Badge, Tabs, Modal, Empty, inr } from '../components/ui.jsx';
import { fmtDateLong } from '../data/tally.js';
import './pages.css';

export default function Partners() {
  const admin = useAdmin();
  const [tab, setTab] = useState('Pending');
  const [confirm, setConfirm] = useState(null); // { p, action }
  const list = admin.partners.filter((p) => tab === 'All' || p.status === tab);
  const active = admin.partners.filter((p) => p.status === 'Active');

  const act = () => {
    const { p, action } = confirm;
    admin.setPartnerStatus(p.id, action);
    admin.toast(`${p.name} ${action === 'Active' ? 'approved' : 'rejected'}`, action === 'Active' ? 'ok' : 'bad');
    setConfirm(null);
  };

  return (
    <Page>
      <PageHead title="Partner Stores" sub="Approve stores before their products go live on the website and app." />
      <div className="kpis" style={{ marginBottom: 16 }}>
        <Kpi i={0} label="Active partners" icon={Store} value={active.length} note="Selling on the platform" />
        <Kpi i={1} label="Pending requests" icon={Clock} value={admin.partners.filter((p) => p.status === 'Pending').length} note="Awaiting your review" />
        <Kpi i={2} label="Partner products" icon={Package} value={active.reduce((s, p) => s + p.products, 0)} note="Live listings" />
        <Kpi i={3} label="Partner sales" icon={IndianRupee} value={inr(active.reduce((s, p) => s + p.sales, 0))} note="Sample figure" />
      </div>
      <Card body={false}>
        <div style={{ padding: '4px 18px 0' }}>
          <Tabs label="Partner filter" value={tab} onChange={setTab} options={['Pending', 'Active', 'Rejected', 'All'].map((s) => ({ id: s, label: `${s} (${s === 'All' ? admin.partners.length : admin.partners.filter((p) => p.status === s).length})` }))} />
        </div>
        <div className="card-body">
          {list.length === 0 ? <Empty icon={Users} title={`No ${tab.toLowerCase()} partners`} /> : list.map((p) => (
            <div key={p.id} className="pcard-row">
              <span className="p-av">{p.name.split('#')[1] ? `P${p.name.split('#')[1]}` : 'PS'}</span>
              <div className="p-info"><b>{p.name}</b><small>{p.id} · {p.category} · {p.products} products · {p.area}</small></div>
              <div className="p-info" style={{ flex: '0 1 160px' }}><small>{p.status === 'Pending' ? 'Requested' : 'Partner since'}</small><b className="num" style={{ fontWeight: 500 }}>{fmtDateLong(p.since)}</b></div>
              <Badge>{p.status}</Badge>
              {p.status === 'Pending' && (
                <div className="p-actions">
                  <button className="btn btn-outline btn-sm" onClick={() => setConfirm({ p, action: 'Rejected' })}><XCircle size={14} /> Reject</button>
                  <button className="btn btn-primary btn-sm" onClick={() => setConfirm({ p, action: 'Active' })}><CheckCircle2 size={14} /> Approve</button>
                </div>
              )}
              {p.status === 'Active' && <span className="num strong" style={{ minWidth: 90, textAlign: 'right' }}>{inr(p.sales)}</span>}
            </div>
          ))}
        </div>
      </Card>
      <p className="sample-note muted">Partner names and figures are placeholders until real stores sign up through the Partnership App.</p>

      <Modal open={!!confirm} onClose={() => setConfirm(null)} title={confirm?.action === 'Active' ? 'Approve partner?' : 'Reject partner?'} width={440}
        footer={<><button className="btn btn-outline" onClick={() => setConfirm(null)}>Cancel</button><button className={`btn ${confirm?.action === 'Active' ? 'btn-primary' : 'btn-danger'}`} onClick={act}>{confirm?.action === 'Active' ? 'Approve' : 'Reject'}</button></>}>
        <p style={{ margin: 0 }}>{confirm?.action === 'Active' ? `${confirm?.p.name}'s ${confirm?.p.products} products will go live on the website and app.` : `${confirm?.p.name} will be notified that the request was not approved.`}</p>
      </Modal>
    </Page>
  );
}

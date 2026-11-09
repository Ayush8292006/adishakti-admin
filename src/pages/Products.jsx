import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, Minus, Search, Pencil, Trash2, ImagePlus, PackageSearch, Download } from 'lucide-react';
import { useAdmin } from '../context/AdminContext.jsx';
import { Page, PageHead, Card, Badge, Modal, Empty, Kpi, inr } from '../components/ui.jsx';
import { CATEGORIES, isLowStock } from '../data/products.js';
import { downloadCSV } from '../data/tally.js';
import { Package, Boxes, AlertTriangle, Sparkles } from 'lucide-react';
import './pages.css';

const EMPTY = { name: '', category: CATEGORIES[0], price: '', stock: '', unit: 'pc', isNew: true, img: '' };
const stockStatus = (p) => (p.stock == null ? 'TBC' : p.stock === 0 ? 'Out of stock' : isLowStock(p) ? 'Low stock' : 'In stock');

function ProductForm({ open, initial, onClose }) {
  const admin = useAdmin();
  const [f, setF] = useState(EMPTY);
  const [err, setErr] = useState('');
  useEffect(() => { if (open) { setF(initial ? { ...initial, price: String(initial.price), stock: initial.stock == null ? '' : String(initial.stock) } : EMPTY); setErr(''); } }, [open, initial]);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });

  const save = () => {
    if (!f.name.trim()) return setErr('Product name is required.');
    if (!(Number(f.price) > 0)) return setErr('Enter a valid price.');
    admin.saveProduct({ ...f, name: f.name.trim(), price: Number(f.price), stock: f.stock === '' ? null : Number(f.stock), img: f.img || '/products/plunger-cutter.jpg' });
    admin.toast(initial ? 'Product updated' : 'Product added');
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={initial ? 'Edit product' : 'Add product'}
      footer={<><button className="btn btn-outline" onClick={onClose}>Cancel</button><button className="btn btn-primary" onClick={save}>{initial ? 'Save changes' : 'Add product'}</button></>}>
      <div className="form-grid two">
        <label className="img-drop full">
          <input type="file" accept="image/*" className="sr-only" onChange={(e) => e.target.files[0] && setF({ ...f, img: URL.createObjectURL(e.target.files[0]) })} />
          {f.img ? <img src={f.img} alt="Product preview" /> : <span className="ph"><ImagePlus size={22} /></span>}
          <span><b style={{ display: 'block' }}>Product photo</b><small className="muted">Click to upload · square JPG/PNG works best</small></span>
        </label>
        <label className="field full"><span>Product name</span><input className="input" value={f.name} onChange={set('name')} placeholder="e.g. Gold acrylic cake topper" /></label>
        <label className="field"><span>Category</span><select className="select" value={f.category} onChange={set('category')}>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select></label>
        <label className="field"><span>Unit</span><select className="select" value={f.unit} onChange={set('unit')}>{['pc', 'pack', 'box', 'set', 'bundle', 'roll'].map((u) => <option key={u}>{u}</option>)}</select></label>
        <label className="field"><span>Price (₹)</span><input className="input num" inputMode="decimal" value={f.price} onChange={set('price')} placeholder="0" /></label>
        <label className="field"><span>Stock</span><input className="input num" inputMode="numeric" value={f.stock} onChange={set('stock')} placeholder="0" /></label>
        <label className="toggle full" style={{ borderBottom: 0 }}>
          <span><b>Mark as new arrival</b><small>Shows a “New” badge on the website and app</small></span>
          <span className="switch"><input type="checkbox" checked={!!f.isNew} onChange={set('isNew')} /><span /></span>
        </label>
      </div>
      {err && <p className="err">{err}</p>}
    </Modal>
  );
}

export default function Products() {
  const admin = useAdmin();
  const [params] = useSearchParams();
  const [q, setQ] = useState(params.get('q') || '');
  const [cat, setCat] = useState('All');
  const [filter, setFilter] = useState(params.get('filter') || 'all');
  const [edit, setEdit] = useState(null); // null | 'new' | product
  const [del, setDel] = useState(null);

  const { products } = admin;
  const list = useMemo(() => products.filter((p) =>
    (cat === 'All' || p.category === cat) && (!q || p.name.toLowerCase().includes(q.toLowerCase())) &&
    (filter === 'all' || (filter === 'low' && isLowStock(p)) || (filter === 'out' && p.stock === 0) || (filter === 'new' && p.isNew))), [products, cat, q, filter]);

  const units = products.reduce((s, p) => s + (p.stock || 0), 0);
  const value = products.reduce((s, p) => s + (p.stock || 0) * p.price, 0);

  return (
    <Page>
      <PageHead title="Products & Stock" sub="Update stock with the + / − buttons or type a number.">
        <button className="btn btn-outline" onClick={() => { downloadCSV('products', [['ID', 'Product', 'Category', 'Unit', 'Price', 'Stock'], ...products.map((p) => [p.id, p.name, p.category, p.unit, p.price, p.stock ?? 'TBC'])]); admin.toast('Products exported'); }}><Download size={16} /> Export</button>
        <button className="btn btn-primary" onClick={() => setEdit('new')}><Plus size={16} /> Add product</button>
      </PageHead>

      <div className="kpis" style={{ marginBottom: 16 }}>
        <Kpi i={0} label="Products" icon={Package} value={products.length} note={`${CATEGORIES.length} categories`} />
        <Kpi i={1} label="Units in stock" icon={Boxes} value={units} note={`Stock value ${inr(value)}`} />
        <Kpi i={2} label="Low stock" icon={AlertTriangle} value={products.filter(isLowStock).length} note="5 or fewer units" />
        <Kpi i={3} label="New arrivals" icon={Sparkles} value={products.filter((p) => p.isNew).length} note="Shown with a New badge" />
      </div>

      <Card body={false}>
        <div className="toolbar">
          <label className="search"><Search size={16} /><span className="sr-only">Search products</span><input className="input" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products" /></label>
          <label><span className="sr-only">Category</span><select className="select" value={cat} onChange={(e) => setCat(e.target.value)}><option value="All">All categories</option>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select></label>
          <div className="chip-row">
            {[['all', 'All'], ['low', 'Low stock'], ['out', 'Out of stock'], ['new', 'New']].map(([k, l]) => <button key={k} className={`chip ${filter === k ? 'on' : ''}`} onClick={() => setFilter(k)}>{l}</button>)}
          </div>
        </div>
        {list.length === 0 ? <Empty icon={PackageSearch} title="No products match" text="Clear the filters or add a new product." /> : (
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>Product</th><th className="hide-md">Category</th><th className="r">Price</th><th>Stock</th><th className="hide-sm">Status</th><th className="r">Actions</th></tr></thead>
              <tbody>
                {list.map((p) => (
                  <tr key={p.id}>
                    <td><span className="cell-prod"><img src={p.img} alt="" /><span><b>{p.name}{p.isNew && <> <Badge tone="b-brand">New</Badge></>}</b><small>per {p.unit}{p.note ? ` · ${p.note}` : ''}</small></span></span></td>
                    <td className="hide-md">{p.category}</td>
                    <td className="r num strong">{inr(p.price)}</td>
                    <td>
                      <span className="stepper">
                        <button onClick={() => admin.setStock(p.id, (p.stock || 0) - 1)} aria-label={`Decrease stock of ${p.name}`}><Minus size={14} /></button>
                        <input aria-label={`Stock of ${p.name}`} inputMode="numeric" value={p.stock ?? ''} placeholder="—" onChange={(e) => admin.setStock(p.id, Number(e.target.value.replace(/\D/g, '')) || 0)} />
                        <button onClick={() => admin.setStock(p.id, (p.stock || 0) + 1)} aria-label={`Increase stock of ${p.name}`}><Plus size={14} /></button>
                      </span>
                    </td>
                    <td className="hide-sm"><Badge>{stockStatus(p)}</Badge></td>
                    <td className="r" style={{ whiteSpace: 'nowrap' }}>
                      <button className="icon-btn" onClick={() => setEdit(p)} aria-label={`Edit ${p.name}`}><Pencil size={16} /></button>
                      <button className="icon-btn" onClick={() => setDel(p)} aria-label={`Delete ${p.name}`}><Trash2 size={16} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <ProductForm open={!!edit} initial={edit && edit !== 'new' ? edit : null} onClose={() => setEdit(null)} />
      <Modal open={!!del} onClose={() => setDel(null)} title="Delete product?" width={420}
        footer={<><button className="btn btn-outline" onClick={() => setDel(null)}>Cancel</button><button className="btn btn-danger" onClick={() => { admin.deleteProduct(del.id); admin.toast(`${del.name} deleted`, 'bad'); setDel(null); }}>Delete</button></>}>
        <p style={{ margin: 0 }}>“{del?.name}” will be removed from the website and app. This can’t be undone.</p>
      </Modal>
    </Page>
  );
}

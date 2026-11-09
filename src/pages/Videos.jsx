import { useMemo, useState } from 'react';
import { UploadCloud, Trash2, Search, Video as VideoIcon, Play } from 'lucide-react';
import { useAdmin } from '../context/AdminContext.jsx';
import { Page, PageHead, Card, Modal, Empty } from '../components/ui.jsx';
import { CATEGORIES, findProduct } from '../data/products.js';
import './pages.css';

const MAX_SECONDS = 120;
const fmtDur = (s) => `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, '0')}`;

export default function Videos() {
  const admin = useAdmin();
  const [file, setFile] = useState(null);
  const [drag, setDrag] = useState(false);
  const [err, setErr] = useState('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(CATEGORIES[1]);
  const [linked, setLinked] = useState([]);
  const [pq, setPq] = useState('');
  const [del, setDel] = useState(null);
  const [play, setPlay] = useState(null);

  const pickable = useMemo(() => admin.products.filter((p) => !pq || p.name.toLowerCase().includes(pq.toLowerCase())).slice(0, 18), [admin.products, pq]);

  const onFile = (f) => {
    setErr('');
    if (!f) return;
    if (!f.type.startsWith('video/')) { setErr('Please choose a video file (MP4 recommended).'); return; }
    const url = URL.createObjectURL(f);
    const v = document.createElement('video');
    v.preload = 'metadata';
    v.onloadedmetadata = () => {
      if (v.duration > MAX_SECONDS + 5) { setErr(`This video is ${fmtDur(v.duration)} long. Demo videos must be 2:00 or shorter.`); URL.revokeObjectURL(url); setFile(null); return; }
      setFile({ url, name: f.name, secs: v.duration, size: f.size });
      if (!title) setTitle(f.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' '));
    };
    v.onerror = () => setErr('Could not read this video. Try an MP4 file.');
    v.src = url;
  };

  const publish = () => {
    if (!file) return setErr('Upload a video first.');
    if (!title.trim()) return setErr('Add a title.');
    if (!linked.length) return setErr('Link at least one product so the video can be suggested in carts.');
    admin.addVideo({ title: title.trim(), duration: fmtDur(file.secs), category, productIds: linked, poster: findProduct(linked[0])?.img || '', src: file.url });
    admin.toast('Video published');
    setFile(null); setTitle(''); setLinked([]); setErr('');
  };

  return (
    <Page>
      <PageHead title="Cake Demo Videos" sub="Videos up to 2 minutes. Linked products decide which customer carts see each video." />
      <div className="row r-1-2" style={{ marginTop: 0 }}>
        <Card title="Upload a demo" sub="MP4 · max 2:00">
          <label className={`drop ${drag ? 'drag' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)}
            onDrop={(e) => { e.preventDefault(); setDrag(false); onFile(e.dataTransfer.files[0]); }}>
            <input type="file" accept="video/*" className="sr-only" onChange={(e) => onFile(e.target.files[0])} />
            {file ? (
              <><video src={file.url} controls muted playsInline /><small className="num">{file.name} · {fmtDur(file.secs)} · {(file.size / 1048576).toFixed(1)} MB</small></>
            ) : (
              <><UploadCloud size={28} /><b>Drag a video here or click to browse</b><small>Up to 2 minutes</small></>
            )}
          </label>
          <div className="form-grid" style={{ marginTop: 14 }}>
            <label className="field"><span>Title</span><input className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Chocolate flowers with rose mould" /></label>
            <label className="field"><span>Category</span><select className="select" value={category} onChange={(e) => setCategory(e.target.value)}>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select></label>
            <div className="field">
              <span>Linked products ({linked.length})</span>
              <label className="search"><Search size={14} /><span className="sr-only">Find products</span><input className="input" value={pq} onChange={(e) => setPq(e.target.value)} placeholder="Find products to link" /></label>
              <div className="chip-row" style={{ marginTop: 4 }}>
                {pickable.map((p) => (
                  <button key={p.id} type="button" className={`chip ${linked.includes(p.id) ? 'on' : ''}`} aria-pressed={linked.includes(p.id)}
                    onClick={() => setLinked((l) => (l.includes(p.id) ? l.filter((x) => x !== p.id) : [...l, p.id]))}>{p.name}</button>
                ))}
              </div>
            </div>
          </div>
          {err && <p className="err" role="alert">{err}</p>}
          <button className="btn btn-primary" style={{ marginTop: 14, width: '100%' }} onClick={publish}><UploadCloud size={16} /> Publish video</button>
        </Card>

        <Card title={`Published videos (${admin.videos.length})`} sub="Shown on the website and in the customer app">
          {admin.videos.length === 0 ? <Empty icon={VideoIcon} title="No videos yet" /> : (
            <div className="vgrid">
              {admin.videos.map((v) => (
                <article key={v.id} className="vcard">
                  <button className="vthumb" onClick={() => setPlay(v)} aria-label={`Preview ${v.title}`} style={{ display: 'block', width: '100%', border: 0, padding: 0 }}>
                    {v.poster ? <img src={v.poster} alt="" /> : <video src={v.src} muted />}
                    <span style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}><span style={{ width: 40, height: 40, borderRadius: '50%', background: '#fff', display: 'grid', placeItems: 'center', color: 'var(--accent)' }}><Play size={16} fill="currentColor" /></span></span>
                    <span className="dur num">{v.duration}</span>
                  </button>
                  <div className="vinfo">
                    <b>{v.title}</b>
                    <div className="chip-row">{v.productIds.slice(0, 3).map((id) => <span key={id} className="tag">{findProduct(id)?.name.split(' ').slice(0, 3).join(' ')}</span>)}{v.productIds.length > 3 && <span className="tag">+{v.productIds.length - 3}</span>}</div>
                  </div>
                  <div className="vactions">
                    <small className="muted">{v.src ? 'Uploaded' : 'Awaiting file'}</small>
                    <button className="icon-btn" onClick={() => setDel(v)} aria-label={`Delete ${v.title}`}><Trash2 size={16} /></button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </Card>
      </div>

      <Modal open={!!play} onClose={() => setPlay(null)} title={play?.title || ''} width={760}>
        {play && (play.src ? <video src={play.src} controls autoPlay playsInline style={{ width: '100%', borderRadius: 10, background: '#000' }} /> : <Empty icon={VideoIcon} title="No video file uploaded yet" text="Upload the MP4 for this demo to preview it here." />)}
      </Modal>
      <Modal open={!!del} onClose={() => setDel(null)} title="Delete video?" width={420}
        footer={<><button className="btn btn-outline" onClick={() => setDel(null)}>Cancel</button><button className="btn btn-danger" onClick={() => { admin.deleteVideo(del.id); admin.toast('Video deleted', 'bad'); setDel(null); }}>Delete</button></>}>
        <p style={{ margin: 0 }}>“{del?.title}” will no longer be suggested to customers.</p>
      </Modal>
    </Page>
  );
}

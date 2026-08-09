'use client';

import { useEffect, useState } from 'react';

// ADMIN MEDIA LIBRARY - saari uploaded images (Supabase Storage)
type MediaFile = { name: string; url: string; size: number; created: string };

export default function AdminMedia() {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/media');
      const d = await res.json();
      if (d.error) setMsg({ type: 'err', text: d.error });
      setFiles(d.files || []);
    } catch {}
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const copy = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(url);
      setTimeout(() => setCopied(''), 1500);
    } catch {}
  };

  const del = async (name: string) => {
    if (!confirm(`"${name}" delete karni hai?`)) return;
    const res = await fetch(`/api/media?name=${encodeURIComponent(name)}`, { method: 'DELETE' });
    if (res.ok) { setMsg({ type: 'ok', text: '🗑️ Deleted' }); load(); }
    else setMsg({ type: 'err', text: 'Delete fail' });
  };

  const fmtSize = (b: number) => (b > 1024 * 1024 ? (b / 1024 / 1024).toFixed(1) + ' MB' : (b / 1024).toFixed(0) + ' KB');

  return (
    <>
      <div className="admin-page-head">
        <div>
          <h1>🖼️ Media Library <span className="admin-count-badge">{files.length}</span></h1>
          <p className="admin-page-sub">Saari uploaded images — click karke URL copy karo, article mein paste karo</p>
        </div>
        <a href="/admin/articles/new" className="admin-cta-btn"><i className="fas fa-upload" /> Upload (article editor mein)</a>
      </div>

      {msg && <p className={`admin-msg ${msg.type === 'ok' ? 'ok' : 'err'}`}>{msg.text}</p>}

      {loading && (
        <div className="admin-panel" style={{ padding: 24, textAlign: 'center', color: 'var(--text-light)' }}>
          <i className="fas fa-spinner fa-spin" /> Loading media...
        </div>
      )}

      {!loading && files.length === 0 && (
        <div className="admin-panel" style={{ textAlign: 'center', color: 'var(--text-light)', padding: 30, lineHeight: 1.8 }}>
          Abhi koi image nahi. Article editor mein <b>Cover Image Upload</b> se image daalo — yahan dikhegi.
        </div>
      )}

      {!loading && files.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14 }}>
          {files.map((f) => (
            <div key={f.name} className="admin-cat-card" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 10 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={f.url}
                alt={f.name}
                loading="lazy"
                style={{ width: '100%', height: 130, objectFit: 'cover', borderRadius: 10, background: 'var(--bg)' }}
              />
              <div style={{ fontSize: '0.7rem', color: 'var(--text-light)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {f.name} · {fmtSize(f.size)}
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button className="admin-bulk-btn pub" style={{ flex: 1, justifyContent: 'center' }} onClick={() => copy(f.url)}>
                  {copied === f.url ? '✅ Copied!' : '📋 Copy URL'}
                </button>
                <button className="admin-bulk-btn del" onClick={() => del(f.name)} title="Delete"><i className="fas fa-trash" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

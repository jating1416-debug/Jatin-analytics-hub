'use client';

import { useEffect, useState } from 'react';

// ADMIN REDIRECTS - 301 redirect manager (blogger se move hui URLs ke liye)
type Redirect = { from: string; to: string; enabled: boolean };

export default function AdminRedirects() {
  const [redirects, setRedirects] = useState<Redirect[]>([]);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const res = await fetch('/api/redirects');
    const d = await res.json();
    if (Array.isArray(d.redirects)) setRedirects(d.redirects);
  };
  useEffect(() => { load(); }, []);

  const save = async (list: Redirect[]) => {
    setSaving(true);
    setMsg(null);
    try {
      const res = await fetch('/api/redirects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ redirects: list }),
      });
      const d = await res.json();
      if (res.ok) {
        setMsg({ type: 'ok', text: `✅ ${d.count} redirects saved — 1 min mein live` });
        setRedirects(d.redirects || list);
      } else setMsg({ type: 'err', text: d.error || 'Save fail' });
    } catch { setMsg({ type: 'err', text: 'Network error' }); }
    finally { setSaving(false); }
  };

  const add = () => {
    if (!from.trim() || !to.trim()) { setMsg({ type: 'err', text: 'Dono fields bharo (from + to)' }); return; }
    let f = from.trim();
    if (!f.startsWith('/')) f = '/' + f;
    const next = [...redirects.filter((r) => r.from !== f), { from: f, to: to.trim(), enabled: true }];
    setRedirects(next);
    setFrom(''); setTo('');
    save(next);
  };

  const toggle = (idx: number) => {
    const next = redirects.map((r, i) => i === idx ? { ...r, enabled: !r.enabled } : r);
    setRedirects(next);
    save(next);
  };

  const remove = (idx: number) => {
    const next = redirects.filter((_, i) => i !== idx);
    setRedirects(next);
    save(next);
  };

  const inp: React.CSSProperties = {
    flex: 1, minWidth: 140, padding: '9px 12px', border: '1px solid var(--border)',
    borderRadius: 10, background: 'var(--bg)', color: 'var(--text-dark)', fontSize: '0.85rem', outline: 'none',
  };

  return (
    <>
      <div className="admin-page-head">
        <div>
          <h1>🔀 301 Redirects <span className="admin-count-badge">{redirects.length}</span></h1>
          <p className="admin-page-sub">Purane URLs ko naye pe redirect karo — SEO juice bachaao, 404 khatam</p>
        </div>
      </div>

      {msg && <p className={`admin-msg ${msg.type === 'ok' ? 'ok' : 'err'}`}>{msg.text}</p>}

      {/* ADD FORM */}
      <div className="admin-panel" style={{ marginBottom: 18 }}>
        <div className="admin-panel-head"><h2><i className="fas fa-plus" /> New Redirect</h2></div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <input style={inp} value={from} onChange={(e) => setFrom(e.target.value)} placeholder="/old-url (path)" />
          <span style={{ fontWeight: 800, color: 'var(--text-light)' }}>→</span>
          <input style={inp} value={to} onChange={(e) => setTo(e.target.value)} placeholder="/new-url ya https://..." />
          <button className="admin-cta-btn" onClick={add} style={{ border: 'none', cursor: 'pointer' }}>
            <i className="fas fa-plus" /> Add
          </button>
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginTop: 8, lineHeight: 1.6 }}>
          💡 Example: Blogger se aayi purani URL <code>/2019/03/sql-join.html</code> → nayi <code>/sql/sql-joins-complete-guide</code>.
          Redirect save hote hi ~1 min mein live (cache).
        </div>
      </div>

      {/* LIST */}
      {redirects.length === 0 ? (
        <div className="admin-panel" style={{ textAlign: 'center', color: 'var(--text-light)', padding: 30 }}>
          Abhi koi redirect nahi — upar se pehla add karo!
        </div>
      ) : (
        <div className="admin-panel" style={{ padding: '8px 14px' }}>
          {redirects.map((r, i) => (
            <div key={i} className="admin-comment-row" style={{ alignItems: 'center' }}>
              <span className={`admin-status-pill ${r.enabled ? 'pub' : 'arch'}`}>{r.enabled ? 'ON' : 'OFF'}</span>
              <div className="admin-comment-body" style={{ flex: 1 }}>
                <div className="admin-comment-top">
                  <b style={{ fontFamily: "'Fira Code', monospace", fontSize: '0.8rem' }}>{r.from}</b>
                </div>
                <div className="admin-comment-text" style={{ fontFamily: "'Fira Code', monospace" }}>→ {r.to}</div>
              </div>
              <button className="admin-bulk-btn draft" style={{ background: r.enabled ? '#64748b' : '#16a34a' }} onClick={() => toggle(i)}>
                {r.enabled ? 'Disable' : 'Enable'}
              </button>
              <button className="admin-bulk-btn del" onClick={() => remove(i)}><i className="fas fa-trash" /></button>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

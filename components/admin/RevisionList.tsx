'use client';

import { useEffect, useState } from 'react';

// REVISION LIST - article ke pichle versions (Blogger history jaisa)
type Rev = { id: number; title: string; content: string; excerpt: string | null; createdAt: string };

export default function RevisionList({ articleId }: { articleId: number }) {
  const [revs, setRevs] = useState<Rev[]>([]);
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const res = await fetch(`/api/articles/${articleId}/revisions`);
      const d = await res.json();
      setRevs(d.revisions || []);
    } catch {}
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [articleId]);

  const restore = async (revId: number) => {
    if (!confirm('Ye version restore karna hai? (ab wala bhi history mein save ho jayega)')) return;
    const res = await fetch(`/api/articles/${articleId}/revisions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ revisionId: revId }),
    });
    if (res.ok) {
      setMsg('✅ Version restored!');
      load();
      setTimeout(() => window.location.reload(), 800);
    } else setMsg('❌ Restore fail');
  };

  if (loading) return null;
  if (revs.length === 0) return null;

  return (
    <div className="admin-panel" style={{ marginTop: 18 }}>
      <div className="admin-panel-head">
        <h2><i className="fas fa-clock-rotate-left" /> Version History ({revs.length})</h2>
        {msg && <span style={{ fontSize: '0.78rem', fontWeight: 700, color: msg.startsWith('✅') ? '#16a34a' : '#ef4444' }}>{msg}</span>}
      </div>
      <div style={{ maxHeight: 260, overflowY: 'auto' }}>
        {revs.map((r, i) => (
          <div key={r.id} className="admin-comment-row" style={{ alignItems: 'center' }}>
            <span className="admin-list-rank">{i === 0 ? '🕐' : `#${revs.length - i}`}</span>
            <div className="admin-comment-body" style={{ flex: 1 }}>
              <div className="admin-comment-top">
                <b style={{ fontSize: '0.8rem' }}>{r.title.slice(0, 60)}</b>
                <span className="admin-comment-date">
                  {new Date(r.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div className="admin-comment-text">{r.content.replace(/<[^>]+>/g, ' ').slice(0, 90)}...</div>
            </div>
            <button className="admin-bulk-btn pub" onClick={() => restore(r.id)}><i className="fas fa-rotate-left" /> Restore</button>
          </div>
        ))}
      </div>
    </div>
  );
}

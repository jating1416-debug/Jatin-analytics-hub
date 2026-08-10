'use client';

import { useEffect, useState } from 'react';

// ALT TEXT MANAGER - images bina alt text ke dhundho (SEO + a11y)
type Issue = { articleId: number; title: string; url: string; imgCount: number; missingAlt: number };

export default function AdminAltText() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    fetch('/api/health/alt-text')
      .then((r) => r.json())
      .then((d) => { if (Array.isArray(d.issues)) setIssues(d.issues); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <div className="admin-page-head">
        <div>
          <h1>🖼️ Alt Text Manager</h1>
          <p className="admin-page-sub">
            {issues.length === 0 ? '✅ Sab articles ke images mein alt text hai!' : `${issues.length} articles mein alt text missing hai`}
          </p>
        </div>
      </div>

      {msg && <p className="admin-msg ok">{msg}</p>}

      {loading && (
        <div className="admin-panel" style={{ padding: 24, textAlign: 'center', color: 'var(--text-light)' }}>
          <i className="fas fa-spinner fa-spin" /> Scanning articles...
        </div>
      )}

      {!loading && issues.length === 0 && (
        <div className="admin-panel" style={{ textAlign: 'center', color: '#16a34a', padding: 30, fontWeight: 700 }}>
          🎉 Koi issue nahi — saare images accessible + SEO-friendly!
        </div>
      )}

      {!loading && issues.length > 0 && (
        <div className="admin-panel" style={{ padding: '8px 14px' }}>
          {issues.map((a) => (
            <div key={a.articleId} className="admin-comment-row" style={{ alignItems: 'center' }}>
              <span className="admin-list-rank">⚠️</span>
              <div className="admin-comment-body" style={{ flex: 1 }}>
                <div className="admin-comment-top"><b style={{ fontSize: '0.85rem' }}>{a.title.slice(0, 60)}</b></div>
                <div className="admin-comment-text">
                  {a.missingAlt}/{a.imgCount} images bina alt text ke — Google ko samajh nahi aata, screen readers skip karte hain
                </div>
              </div>
              <a href={`/admin/articles/${a.articleId}/edit`} className="admin-bulk-btn pub" style={{ textDecoration: 'none' }}>
                <i className="fas fa-pen" /> Fix
              </a>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

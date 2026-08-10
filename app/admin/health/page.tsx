'use client';

import { useEffect, useState } from 'react';

// CONTENT HEALTH DASHBOARD - site content ka health score
type Health = {
  total: number;
  noExcerpt: number;
  shortContent: number;
  noMeta: number;
  noCover: number;
  missingAlt: number;
  stale: number;
  healthScore: number;
  byCat: { name: string; count: number }[];
};

export default function AdminHealth() {
  const [h, setH] = useState<Health | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/health/content')
      .then((r) => r.json())
      .then((d) => setH(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const color = h ? (h.healthScore >= 80 ? '#16a34a' : h.healthScore >= 50 ? '#f59e0b' : '#ef4444') : '#888';

  const issues = h ? [
    { label: 'Bina excerpt (50+ chars)', count: h.noExcerpt },
    { label: 'Chhota content (<300 words)', count: h.shortContent },
    { label: 'Bina meta description', count: h.noMeta },
    { label: 'Bina cover image', count: h.noCover },
    { label: 'Images bina alt text', count: h.missingAlt },
    { label: 'Stale posts (60+ din purani)', count: h.stale },
  ] : [];

  const maxCat = Math.max(1, ...(h?.byCat.map((c) => c.count) || [1]));

  return (
    <>
      <div className="admin-page-head">
        <div>
          <h1>🏥 Content Health</h1>
          <p className="admin-page-sub">Site content ka overall health score — kya improve karna hai</p>
        </div>
      </div>

      {loading && (
        <div className="admin-panel" style={{ padding: 24, textAlign: 'center', color: 'var(--text-light)' }}>
          <i className="fas fa-spinner fa-spin" /> Analyzing content...
        </div>
      )}

      {h && (
        <>
          {/* SCORE */}
          <div className="admin-panel" style={{ marginBottom: 18, textAlign: 'center' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-light)', marginBottom: 8 }}>
              Content Health Score · {h.total} published articles
            </div>
            <div style={{ width: 140, height: 140, borderRadius: '50%', margin: '0 auto', background: `conic-gradient(${color} ${h.healthScore}%, var(--border) 0)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: 108, height: 108, borderRadius: '50%', background: 'var(--card-bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <b style={{ fontSize: '2rem', color }}>{h.healthScore}</b>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-light)' }}>/ 100</span>
              </div>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-light)', marginTop: 10 }}>
              {h.healthScore >= 80 ? '🟢 Bahut badhiya! Content healthy hai.' : h.healthScore >= 50 ? '🟡 Theek hai — neeche issues fix karo.' : '🔴 Improvement chahiye — neeche checklist dekho.'}
            </p>
          </div>

          {/* ISSUES GRID */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14, marginBottom: 18 }}>
            {issues.map((i) => (
              <div key={i.label} className="admin-panel" style={{ padding: '16px 18px' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: i.count > 0 ? '#f59e0b' : '#16a34a' }}>
                  {i.count}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-light)', fontWeight: 600 }}>{i.label}</div>
              </div>
            ))}
          </div>

          {/* CATEGORY DISTRIBUTION */}
          <div className="admin-panel">
            <div className="admin-panel-head"><h2><i className="fas fa-chart-pie" /> Category Distribution</h2></div>
            <div className="admin-bars">
              {h.byCat.map((c) => (
                <div key={c.name} className="admin-bar-row">
                  <span className="admin-bar-label">{c.name}</span>
                  <div className="admin-bar-track">
                    <div className="admin-bar-fill" style={{ width: `${Math.max(4, (c.count / maxCat) * 100)}%` }} />
                  </div>
                  <span className="admin-bar-value">{c.count}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </>
  );
}

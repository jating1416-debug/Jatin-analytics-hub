'use client';

import { useState } from 'react';

// ATS RESUME SCANNER v2 - more keywords + tips + better UI
const CORE = ['SQL', 'Python', 'Power BI', 'Pandas', 'Excel', 'MySQL', 'Data Analysis', 'Data Cleaning', 'Dashboard', 'Statistics', 'Visualization', 'DAX', 'ETL', 'Data Modeling', 'Storytelling', 'Data Visualization', 'Power Query', 'Analytical Skills'];
const EXTRA = ['NumPy', 'Tableau', 'Machine Learning', 'KPI', 'Git', 'Jupyter', 'PostgreSQL', 'Google Sheets', 'A/B Testing', 'Reporting', 'Excel Pivot', 'Regression', 'Forecasting', 'Data Warehousing', 'BigQuery', 'Looker', 'Excel VBA', 'Automation'];

export default function AtsScanner() {
  const [text, setText] = useState('');
  const [result, setResult] = useState<{ score: number; hits: string[]; misses: string[]; extra: string[] } | null>(null);
  const [copied, setCopied] = useState(false);

  const scan = () => {
    const low = text.toLowerCase();
    const hits = CORE.filter((k) => low.includes(k.toLowerCase()));
    const misses = CORE.filter((k) => !low.includes(k.toLowerCase()));
    const extra = EXTRA.filter((k) => low.includes(k.toLowerCase()));
    const score = Math.round((hits.length / CORE.length) * 100);
    setResult({ score, hits, misses, extra });
  };

  const color = result ? (result.score >= 70 ? '#16a34a' : result.score >= 40 ? '#f59e0b' : '#ef4444') : '#000';
  const verdict = result
    ? result.score >= 70 ? '🔥 Bahut badhiya! Strong match — apply karne ke liye ready.' : result.score >= 40 ? '👍 Theek hai — neeche diye missing keywords add karo.' : '📌 Core keywords add karo — resume ko ATS-friendly banao.'
    : '';

  const copyResult = async () => {
    if (!result) return;
    try {
      const txt = `ATS Score: ${result.score}%\n✅ Found: ${result.hits.join(', ') || 'none'}\n❌ Missing: ${result.misses.join(', ') || 'none'}${result.extra.length ? `\n⭐ Bonus: ${result.extra.join(', ')}` : ''}`;
      await navigator.clipboard.writeText(txt);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  return (
    <div className="layout-wrapper">
      <main className="posts-section">
        <div className="post-content-wrapper" style={{ padding: 24 }}>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: 8 }}>📄 ATS Resume Scanner</h1>
          <p style={{ color: 'var(--text-light)', fontSize: '0.9rem', marginBottom: 20 }}>
            Resume text paste karo — Data Analyst keywords ka score (0-100%). 🔒 100% browser mein, kisi server pe nahi.
          </p>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={'Experienced Data Analyst skilled in SQL, Python, Power BI...'}
            spellCheck={false}
            style={{ width: '100%', minHeight: 160, padding: 12, border: '1px solid var(--border)', borderRadius: 10, background: 'var(--bg)', color: 'var(--text-dark)', fontFamily: "'Fira Code', monospace", fontSize: '0.8rem', boxSizing: 'border-box', marginBottom: 12 }}
          />
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
            <button onClick={scan} className="read-more-btn" style={{ border: 'none' }}>🔍 Scan Resume</button>
            {result && (
              <button onClick={copyResult} className="read-more-btn" style={{ border: 'none', background: 'var(--secondary)' }}>
                {copied ? '✅ Copied!' : '📋 Copy Result'}
              </button>
            )}
          </div>

          {result && (
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <div style={{
                width: 120, height: 120, borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                background: `conic-gradient(${color} ${result.score}%, #e2e8f0 0)`, position: 'relative',
              }}>
                <span style={{ background: 'var(--card-bg)', width: 92, height: 92, borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', fontWeight: 800, color }}>
                  {result.score}%
                </span>
              </div>
              <p style={{ fontWeight: 700, marginTop: 8, color: color }}>{verdict}</p>
            </div>
          )}

          {result && (
            <div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
                {result.hits.map((k) => <span key={k} style={{ background: 'rgba(22,163,74,0.14)', color: '#16a34a', padding: '4px 11px', borderRadius: 14, fontSize: '0.75rem', fontWeight: 700 }}>✅ {k}</span>)}
              </div>
              {result.misses.length > 0 && (
                <div style={{ marginBottom: 10 }}>
                  <p style={{ fontSize: '0.8rem', fontWeight: 700, marginBottom: 6 }}>❌ Missing keywords (add karo):</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {result.misses.map((k) => <span key={k} style={{ background: 'rgba(239,68,68,0.10)', color: '#ef4444', padding: '4px 11px', borderRadius: 14, fontSize: '0.75rem', fontWeight: 700 }}>{k}</span>)}
                  </div>
                </div>
              )}
              {result.extra.length > 0 && (
                <p style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}><b>⭐ Bonus skills:</b> {result.extra.join(', ')}</p>
              )}
            </div>
          )}

          {!result && (
            <div style={{ padding: 14, background: 'var(--gradient-soft)', borderRadius: 12, fontSize: '0.82rem', color: 'var(--text-light)', lineHeight: 1.7 }}>
              <b style={{ color: 'var(--text-dark)' }}>💡 Tips:</b> Resume mein specific tool names likho (sirf "data analysis" nahi) — SQL, Python, Power BI, Pandas, Excel. Numbers use karo: "improved reporting by 30%". Job description ke exact words repeat karo — ATS unhe match karta hai.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

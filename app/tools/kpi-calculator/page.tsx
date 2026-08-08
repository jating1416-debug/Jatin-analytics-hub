'use client';

import { useState } from 'react';

export default function KpiCalculator() {
  const [actual, setActual] = useState('');
  const [target, setTarget] = useState('');
  const [result, setResult] = useState<string | null>(null);

  const calc = () => {
    const a = parseFloat(actual);
    const t = parseFloat(target);
    if (isNaN(a) || isNaN(t) || t === 0) { setResult('Sahi values daalo (target 0 nahi ho sakta)'); return; }
    const pct = (a / t) * 100;
    const status = pct >= 100 ? '🎯 Target achieved!' : '📉 Target se peeche';
    setResult(`Achievement: ${pct.toFixed(1)}% — ${status} (Gap: ${(a - t).toLocaleString()})`);
  };

  return (
    <div className="layout-wrapper">
      <main className="posts-section">
        <div className="post-content-wrapper" style={{ padding: 24 }}>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: 8 }}>📊 KPI Calculator</h1>
          <p style={{ color: 'var(--text-light)', fontSize: '0.9rem', marginBottom: 20 }}>
            Actual vs Target — achievement percentage nikaalo.
          </p>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: 4 }}>Actual Value</label>
          <input type="number" value={actual} onChange={(e) => setActual(e.target.value)} placeholder="e.g. 85000"
            style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--border)', borderRadius: 10, background: 'var(--bg)', color: 'var(--text-dark)', marginBottom: 12, boxSizing: 'border-box' }} />
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: 4 }}>Target Value</label>
          <input type="number" value={target} onChange={(e) => setTarget(e.target.value)} placeholder="e.g. 100000"
            style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--border)', borderRadius: 10, background: 'var(--bg)', color: 'var(--text-dark)', marginBottom: 16, boxSizing: 'border-box' }} />
          <button onClick={calc} className="read-more-btn" style={{ border: 'none' }}>Calculate</button>
          {result && <div style={{ marginTop: 16, padding: 14, background: 'var(--bg)', borderRadius: 10, fontWeight: 700 }}>{result}</div>}
        </div>
      </main>
    </div>
  );
}

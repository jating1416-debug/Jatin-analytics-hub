'use client';

import { useState } from 'react';

export default function GrowthPercent() {
  const [oldV, setOldV] = useState('');
  const [newV, setNewV] = useState('');
  const [result, setResult] = useState<string | null>(null);

  const calc = () => {
    const o = parseFloat(oldV);
    const n = parseFloat(newV);
    if (isNaN(o) || isNaN(n) || o === 0) { setResult('Sahi values daalo (old value 0 nahi ho sakta)'); return; }
    const pct = ((n - o) / o) * 100;
    const dir = pct >= 0 ? '📈 Growth' : '📉 Decline';
    setResult(`${dir}: ${pct >= 0 ? '+' : ''}${pct.toFixed(2)}%`);
  };

  return (
    <div className="layout-wrapper">
      <main className="posts-section">
        <div className="post-content-wrapper" style={{ padding: 24 }}>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: 8 }}>📉 Growth % Calculator</h1>
          <p style={{ color: 'var(--text-light)', fontSize: '0.9rem', marginBottom: 20 }}>
            Old vs New value — percentage change.
          </p>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: 4 }}>Old Value</label>
          <input type="number" value={oldV} onChange={(e) => setOldV(e.target.value)} placeholder="e.g. 50000"
            style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--border)', borderRadius: 10, background: 'var(--bg)', color: 'var(--text-dark)', marginBottom: 12, boxSizing: 'border-box' }} />
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: 4 }}>New Value</label>
          <input type="number" value={newV} onChange={(e) => setNewV(e.target.value)} placeholder="e.g. 65000"
            style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--border)', borderRadius: 10, background: 'var(--bg)', color: 'var(--text-dark)', marginBottom: 16, boxSizing: 'border-box' }} />
          <button onClick={calc} className="read-more-btn" style={{ border: 'none' }}>Calculate</button>
          {result && <div style={{ marginTop: 16, padding: 14, background: 'var(--bg)', borderRadius: 10, fontWeight: 700 }}>{result}</div>}
        </div>
      </main>
    </div>
  );
}

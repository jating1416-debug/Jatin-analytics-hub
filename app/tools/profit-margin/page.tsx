'use client';

import { useState } from 'react';

export default function ProfitMargin() {
  const [revenue, setRevenue] = useState('');
  const [cost, setCost] = useState('');
  const [result, setResult] = useState<string | null>(null);

  const calc = () => {
    const r = parseFloat(revenue);
    const c = parseFloat(cost);
    if (isNaN(r) || isNaN(c) || r === 0) { setResult('Sahi values daalo (revenue 0 nahi ho sakta)'); return; }
    const margin = ((r - c) / r) * 100;
    const profit = r - c;
    setResult(`Profit Margin: ${margin.toFixed(1)}% (Profit: ₹${profit.toLocaleString()})`);
  };

  return (
    <div className="layout-wrapper">
      <main className="posts-section">
        <div className="post-content-wrapper" style={{ padding: 24 }}>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: 8 }}>💰 Profit Margin Calculator</h1>
          <p style={{ color: 'var(--text-light)', fontSize: '0.9rem', marginBottom: 20 }}>
            Revenue vs Cost — margin percentage.
          </p>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: 4 }}>Revenue</label>
          <input type="number" value={revenue} onChange={(e) => setRevenue(e.target.value)} placeholder="e.g. 100000"
            style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--border)', borderRadius: 10, background: 'var(--bg)', color: 'var(--text-dark)', marginBottom: 12, boxSizing: 'border-box' }} />
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: 4 }}>Cost</label>
          <input type="number" value={cost} onChange={(e) => setCost(e.target.value)} placeholder="e.g. 65000"
            style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--border)', borderRadius: 10, background: 'var(--bg)', color: 'var(--text-dark)', marginBottom: 16, boxSizing: 'border-box' }} />
          <button onClick={calc} className="read-more-btn" style={{ border: 'none' }}>Calculate</button>
          {result && <div style={{ marginTop: 16, padding: 14, background: 'var(--bg)', borderRadius: 10, fontWeight: 700 }}>{result}</div>}
        </div>
      </main>
    </div>
  );
}

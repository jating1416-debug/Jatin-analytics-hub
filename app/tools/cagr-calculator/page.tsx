'use client';

import { useState } from 'react';

export default function CagrCalculator() {
  const [begin, setBegin] = useState('');
  const [end, setEnd] = useState('');
  const [years, setYears] = useState('');
  const [result, setResult] = useState<string | null>(null);

  const calc = () => {
    const b = parseFloat(begin);
    const e = parseFloat(end);
    const y = parseFloat(years);
    if (isNaN(b) || isNaN(e) || isNaN(y) || b <= 0 || y <= 0) { setResult('Sahi values daalo (begin > 0, years > 0)'); return; }
    const cagr = Math.pow(e / b, 1 / y) - 1;
    setResult(`CAGR: ${(cagr * 100).toFixed(2)}% per year`);
  };

  return (
    <div className="layout-wrapper">
      <main className="posts-section">
        <div className="post-content-wrapper" style={{ padding: 24 }}>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: 8 }}>📈 CAGR Calculator</h1>
          <p style={{ color: 'var(--text-light)', fontSize: '0.9rem', marginBottom: 20 }}>
            Compound Annual Growth Rate — investment/business growth per year.
          </p>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: 4 }}>Beginning Value</label>
          <input type="number" value={begin} onChange={(e) => setBegin(e.target.value)} placeholder="e.g. 100000"
            style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--border)', borderRadius: 10, background: 'var(--bg)', color: 'var(--text-dark)', marginBottom: 12, boxSizing: 'border-box' }} />
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: 4 }}>Ending Value</label>
          <input type="number" value={end} onChange={(e) => setEnd(e.target.value)} placeholder="e.g. 200000"
            style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--border)', borderRadius: 10, background: 'var(--bg)', color: 'var(--text-dark)', marginBottom: 12, boxSizing: 'border-box' }} />
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: 4 }}>Years</label>
          <input type="number" value={years} onChange={(e) => setYears(e.target.value)} placeholder="e.g. 5"
            style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--border)', borderRadius: 10, background: 'var(--bg)', color: 'var(--text-dark)', marginBottom: 16, boxSizing: 'border-box' }} />
          <button onClick={calc} className="read-more-btn" style={{ border: 'none' }}>Calculate</button>
          {result && <div style={{ marginTop: 16, padding: 14, background: 'var(--bg)', borderRadius: 10, fontWeight: 700 }}>{result}</div>}
        </div>
      </main>
    </div>
  );
}

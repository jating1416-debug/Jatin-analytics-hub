'use client';

import { useState } from 'react';

function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let cur = '', row: string[] = [], inQ = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQ) { if (ch === '"') { if (text[i + 1] === '"') { cur += '"'; i++; } else inQ = false; } else cur += ch; }
    else if (ch === '"') inQ = true;
    else if (ch === ',') { row.push(cur); cur = ''; }
    else if (ch === '\n') { row.push(cur); rows.push(row); row = []; cur = ''; }
    else if (ch !== '\r') cur += ch;
  }
  row.push(cur); if (row.length > 1 || row[0] !== '') rows.push(row);
  return rows;
}

export default function CsvToJson() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  const convert = () => {
    const rows = parseCSV(input);
    if (rows.length < 2) { setOutput('Kam se kam 1 header + 1 row chahiye'); return; }
    const header = rows[0].map((h) => h.trim());
    const arr = rows.slice(1).map((r) => {
      const obj: Record<string, string> = {};
      header.forEach((h, i) => { obj[h] = (r[i] || '').trim(); });
      return obj;
    });
    setOutput(JSON.stringify(arr, null, 2));
  };

  return (
    <div className="layout-wrapper">
      <main className="posts-section">
        <div className="post-content-wrapper" style={{ padding: 24 }}>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: 8 }}>🔄 CSV → JSON Converter</h1>
          <p style={{ color: 'var(--text-light)', fontSize: '0.9rem', marginBottom: 20 }}>CSV paste karo — JSON output milega.</p>
          <textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder={'name,age\nJatin,25\nPriya,28'} spellCheck={false}
            style={{ width: '100%', minHeight: 140, padding: 12, border: '1px solid var(--border)', borderRadius: 10, background: 'var(--bg)', color: 'var(--text-dark)', fontFamily: "'Fira Code', monospace", fontSize: '0.8rem', boxSizing: 'border-box', marginBottom: 12 }} />
          <button onClick={convert} className="read-more-btn" style={{ border: 'none', marginBottom: 12 }}>Convert</button>
          {output && (
            <pre style={{ background: '#1e293b', color: '#e2e8f0', border: '1px solid var(--border)', borderRadius: 10, padding: 14, overflowX: 'auto', fontSize: '0.78rem', lineHeight: 1.5 }}>{output}</pre>
          )}
        </div>
      </main>
    </div>
  );
}

'use client';

import { useState } from 'react';

function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let cur = '', row: string[] = [], inQ = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQ) {
      if (ch === '"') { if (text[i + 1] === '"') { cur += '"'; i++; } else inQ = false; }
      else cur += ch;
    } else if (ch === '"') inQ = true;
    else if (ch === ',') { row.push(cur); cur = ''; }
    else if (ch === '\n') { row.push(cur); rows.push(row); row = []; cur = ''; }
    else if (ch !== '\r') cur += ch;
  }
  row.push(cur); if (row.length > 1 || row[0] !== '') rows.push(row);
  return rows;
}

export default function CsvViewer() {
  const [input, setInput] = useState('');
  const [filter, setFilter] = useState('');
  const [rows, setRows] = useState<string[][]>([]);

  const render = () => {
    const parsed = parseCSV(input);
    setRows(parsed);
  };

  const shown = rows.filter((r) => {
    if (!filter) return true;
    return r.some((cell) => cell.toLowerCase().includes(filter.toLowerCase()));
  });

  return (
    <div className="layout-wrapper">
      <main className="posts-section">
        <div className="post-content-wrapper" style={{ padding: 24 }}>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: 8 }}>📄 CSV Viewer</h1>
          <p style={{ color: 'var(--text-light)', fontSize: '0.9rem', marginBottom: 20 }}>CSV paste karo — table + filter.</p>
          <textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder={'name,age,city\nJatin,25,Mumbai\nPriya,28,Delhi'} spellCheck={false}
            style={{ width: '100%', minHeight: 140, padding: 12, border: '1px solid var(--border)', borderRadius: 10, background: 'var(--bg)', color: 'var(--text-dark)', fontFamily: "'Fira Code', monospace", fontSize: '0.8rem', boxSizing: 'border-box', marginBottom: 12 }} />
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            <button onClick={render} className="read-more-btn" style={{ border: 'none' }}>Render Table</button>
            <input value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Filter rows..."
              style={{ flex: 1, padding: '9px 14px', border: '1px solid var(--border)', borderRadius: 10, background: 'var(--bg)', color: 'var(--text-dark)', outline: 'none' }} />
          </div>
          {rows.length > 0 && (
            <div style={{ overflowX: 'auto' }}>
              <table className="sql-result-table">
                <thead><tr>{rows[0].map((h, i) => <th key={i}>{h}</th>)}</tr></thead>
                <tbody>
                  {shown.slice(1).map((r, ri) => (
                    <tr key={ri}>{r.map((c, ci) => <td key={ci}>{c}</td>)}</tr>
                  ))}
                </tbody>
              </table>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginTop: 8 }}>
                {shown.length - 1} rows shown ({rows.length - 1} total)
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

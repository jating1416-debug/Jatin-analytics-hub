'use client';

import { useState } from 'react';

export default function JsonFormatter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');

  const fmt = (minify: boolean) => {
    try {
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed, null, minify ? 0 : 2));
      setError('');
    } catch (e: any) {
      setError('Invalid JSON: ' + e.message);
      setOutput('');
    }
  };

  return (
    <div className="layout-wrapper">
      <main className="posts-section">
        <div className="post-content-wrapper" style={{ padding: 24 }}>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: 8 }}>🔧 JSON Formatter</h1>
          <p style={{ color: 'var(--text-light)', fontSize: '0.9rem', marginBottom: 20 }}>Paste JSON — beautify ya minify karo.</p>
          <textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder='{"name":"Jatin","skills":["SQL","Python"]}' spellCheck={false}
            style={{ width: '100%', minHeight: 200, padding: 12, border: '1px solid var(--border)', borderRadius: 10, background: '#1e293b', color: '#e2e8f0', fontFamily: "'Fira Code', monospace", fontSize: '0.8rem', boxSizing: 'border-box', marginBottom: 12, whiteSpace: 'pre' }} />
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            <button onClick={() => fmt(false)} className="read-more-btn" style={{ border: 'none' }}>Beautify</button>
            <button onClick={() => fmt(true)} className="read-more-btn" style={{ border: 'none', background: 'var(--secondary)' }}>Minify</button>
          </div>
          {error && <p style={{ color: '#ef4444', fontSize: '0.85rem', marginBottom: 8 }}>{error}</p>}
          {output && (
            <pre style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 10, padding: 14, overflowX: 'auto', fontSize: '0.78rem', lineHeight: 1.5 }}>{output}</pre>
          )}
        </div>
      </main>
    </div>
  );
}

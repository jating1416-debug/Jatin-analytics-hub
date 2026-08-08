'use client';

import { useState } from 'react';

export default function RegexTester() {
  const [pattern, setPattern] = useState('');
  const [flags, setFlags] = useState('g');
  const [testStr, setTestStr] = useState('');
  const [result, setResult] = useState<{ matches: string[]; count: number; error?: string } | null>(null);

  const test = () => {
    try {
      const re = new RegExp(pattern, flags.replace(/[^gimsuy]/g, ''));
      const matches = [...testStr.matchAll(re)].map((m) => m[0]);
      setResult({ matches, count: matches.length });
    } catch (e: any) {
      setResult({ matches: [], count: 0, error: e.message });
    }
  };

  return (
    <div className="layout-wrapper">
      <main className="posts-section">
        <div className="post-content-wrapper" style={{ padding: 24 }}>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: 8 }}>🔍 Regex Tester</h1>
          <p style={{ color: 'var(--text-light)', fontSize: '0.9rem', marginBottom: 20 }}>Pattern test karo turant.</p>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: 4 }}>Pattern</label>
          <input value={pattern} onChange={(e) => setPattern(e.target.value)} placeholder="\d+" spellCheck={false}
            style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--border)', borderRadius: 10, background: '#1e293b', color: '#e2e8f0', fontFamily: "'Fira Code', monospace", marginBottom: 12, boxSizing: 'border-box' }} />
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: 4 }}>Flags</label>
          <input value={flags} onChange={(e) => setFlags(e.target.value)} placeholder="g i m s"
            style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--border)', borderRadius: 10, background: 'var(--bg)', color: 'var(--text-dark)', marginBottom: 12, boxSizing: 'border-box' }} />
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: 4 }}>Test String</label>
          <textarea value={testStr} onChange={(e) => setTestStr(e.target.value)} placeholder="Test string yahan likho" spellCheck={false}
            style={{ width: '100%', minHeight: 100, padding: 12, border: '1px solid var(--border)', borderRadius: 10, background: 'var(--bg)', color: 'var(--text-dark)', fontFamily: "'Fira Code', monospace", fontSize: '0.8rem', boxSizing: 'border-box', marginBottom: 12 }} />
          <button onClick={test} className="read-more-btn" style={{ border: 'none', marginBottom: 12 }}>Test</button>
          {result && (
            <div style={{ background: 'var(--bg)', borderRadius: 10, padding: 14 }}>
              {result.error ? (
                <p style={{ color: '#ef4444', fontSize: '0.85rem' }}>❌ {result.error}</p>
              ) : (
                <>
                  <p style={{ fontWeight: 700, fontSize: '0.9rem' }}>{result.count} matches found</p>
                  {result.matches.length > 0 && (
                    <pre style={{ background: '#1e293b', color: '#a5d6a7', borderRadius: 8, padding: 10, overflowX: 'auto', fontSize: '0.78rem' }}>
                      {result.matches.join('\n')}
                    </pre>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

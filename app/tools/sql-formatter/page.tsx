'use client';

import { useState } from 'react';

const KEYWORDS = ['SELECT', 'FROM', 'WHERE', 'GROUP BY', 'ORDER BY', 'HAVING', 'INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'JOIN', 'ON', 'AND', 'OR', 'LIMIT', 'INSERT INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE FROM', 'UNION', 'UNION ALL', 'CREATE TABLE', 'ALTER TABLE', 'DROP TABLE', 'CASE', 'WHEN', 'THEN', 'ELSE', 'END'];

export default function SqlFormatter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  const fmt = () => {
    let sql = input.replace(/\s+/g, ' ').trim();
    KEYWORDS.forEach((kw) => {
      const re = new RegExp('\\b' + kw.replace(/ /g, '\\s+') + '\\b', 'gi');
      sql = sql.replace(re, '\n' + kw);
    });
    sql = sql.replace(/,/g, ',\n    ');
    setOutput(sql.trim());
  };

  return (
    <div className="layout-wrapper">
      <main className="posts-section">
        <div className="post-content-wrapper" style={{ padding: 24 }}>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: 8 }}>🗄️ SQL Formatter</h1>
          <p style={{ color: 'var(--text-light)', fontSize: '0.9rem', marginBottom: 20 }}>SQL query ko clean format mein badlo.</p>
          <textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder="select * from employees where salary>50000 order by salary desc limit 5;" spellCheck={false}
            style={{ width: '100%', minHeight: 140, padding: 12, border: '1px solid var(--border)', borderRadius: 10, background: '#1e293b', color: '#e2e8f0', fontFamily: "'Fira Code', monospace", fontSize: '0.8rem', boxSizing: 'border-box', marginBottom: 12, whiteSpace: 'pre' }} />
          <button onClick={fmt} className="read-more-btn" style={{ border: 'none', marginBottom: 12 }}>Format</button>
          {output && (
            <pre style={{ background: '#1e293b', color: '#e2e8f0', border: '1px solid var(--border)', borderRadius: 10, padding: 14, overflowX: 'auto', fontSize: '0.78rem', lineHeight: 1.6 }}>{output}</pre>
          )}
        </div>
      </main>
    </div>
  );
}

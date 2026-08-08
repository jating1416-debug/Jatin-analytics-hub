'use client';

import { useEffect, useState } from 'react';

// Smart Assistant - DAX/SQL/Python/Excel quick answers (client-side knowledge base)
const KB: { keys: string; answer: string }[] = [
  { keys: 'calculate dax filter context', answer: 'CALCULATE(SUM(Sales[Amount]), Region[Zone]="North") — current filter context badalta hai. DAX ka sabse important function!' },
  { keys: 'ytd mtd qtd totalytd', answer: 'TOTALYTD([Total Sales], Calendar[Date]) — Year-to-date total. Date table pehle banao + "Mark as Date Table"!' },
  { keys: 'yoy growth sameperiodlastyear', answer: 'YoY = DIVIDE([Current Year] - [Prev Year], [Prev Year]) — SAMEPERIODLASTYEAR(Calendar[Date]) se previous year compare karo.' },
  { keys: 'window function rank row_number', answer: 'SELECT name, salary, RANK() OVER (ORDER BY salary DESC) AS rnk FROM employees; — RANK ties same deta hai, ROW_NUMBER unique.' },
  { keys: 'groupby pandas group', answer: 'df.groupby("dept")["salary"].sum() — pandas mein aggregation. reset_index() bhoolna mat!' },
  { keys: 'xlookup vlookup excel', answer: '=XLOOKUP(A2, Customers[ID], Customers[Name], "Not Found") — VLOOKUP ka modern replacement, dono taraf search karta hai.' },
  { keys: 'join inner left sql', answer: 'INNER JOIN = sirf matching rows. LEFT JOIN = left table ki saari rows + matching right. JOIN se pehle ON condition zaroori!' },
  { keys: 'power query unpivot', answer: 'Table.UnpivotOtherColumns(Source, {"Month"}, "Metric", "Value") — wide to long format, dashboards ke liye zaroori.' },
  { keys: 'cte with sql', answer: 'WITH monthly AS (SELECT ...) SELECT * FROM monthly; — complex queries ko steps mein todo, readability badhao.' },
  { keys: 'interview sql question', answer: 'Common: "Write a query to find 2nd highest salary" → SELECT MAX(salary) FROM employees WHERE salary < (SELECT MAX(salary) FROM employees);' },
];

export default function SmartAssistant() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{ user: boolean; text: string }[]>([
    { user: false, text: '👋 Hello! Main aapka Data Assistant hoon. DAX, SQL, Python, Excel — koi bhi concept poochho!' },
  ]);

  const ask = (q: string) => {
    const query = q.trim();
    if (!query) return;
    setMessages((m) => [...m, { user: true, text: query }]);
    const low = query.toLowerCase();
    const found = KB.find((k) => low.includes(k.keys.split(' ')[0]) || k.keys.split(' ').some((w) => low.includes(w)));
    setMessages((m) => [...m, { user: false, text: found ? found.answer : 'Is topic ka answer abhi knowledge base mein nahi hai. SQL/Python/DAX/Excel ke basics poochho — ya blog search karo! 🔍' }]);
    setInput('');
  };

  useEffect(() => {
    if (!open) return;
    const el = document.getElementById('sa-msg-box');
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, open]);

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        style={{
          position: 'fixed', right: 20, bottom: 20, width: 56, height: 56, borderRadius: '50%',
          background: 'var(--gradient)', color: '#fff', border: 'none', fontSize: '1.3rem',
          cursor: 'pointer', zIndex: 9999, boxShadow: '0 8px 24px rgba(102,126,234,0.45)',
        }}
        title="Ask Data Assistant"
      >
        {open ? <i className="fas fa-times" /> : <i className="fas fa-robot" />}
      </button>

      {open && (
        <div style={{
          position: 'fixed', right: 20, bottom: 88, width: 'min(360px, calc(100vw - 30px))', height: 480,
          background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 18,
          boxShadow: '0 24px 60px rgba(2,6,23,0.28)', zIndex: 9998, display: 'flex', flexDirection: 'column', overflow: 'hidden',
        }}>
          <div style={{ background: 'var(--gradient)', color: '#fff', padding: '14px 16px', fontWeight: 700 }}>
            🤖 Data Assistant
          </div>
          <div id="sa-msg-box" style={{ flex: 1, overflowY: 'auto', padding: 12, display: 'flex', flexDirection: 'column', gap: 8, background: 'var(--bg)' }}>
            {messages.map((m, i) => (
              <div key={i} style={{
                padding: '9px 13px', borderRadius: 12, fontSize: '0.84rem', lineHeight: 1.55, maxWidth: '92%',
                background: m.user ? 'var(--gradient)' : 'var(--card-bg)', color: m.user ? '#fff' : 'var(--text-dark)',
                alignSelf: m.user ? 'flex-end' : 'flex-start', border: m.user ? 'none' : '1px solid var(--border)',
                whiteSpace: 'pre-wrap',
              }}>
                {m.text}
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8, padding: 10, borderTop: '1px solid var(--border)' }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && ask(input)}
              placeholder="Ask: CALCULATE, window function..."
              style={{ flex: 1, padding: '9px 14px', border: '1px solid var(--border)', borderRadius: 20, background: 'var(--bg)', color: 'var(--text-dark)', outline: 'none', fontSize: '0.85rem' }}
            />
            <button onClick={() => ask(input)} style={{ width: 42, borderRadius: '50%', background: 'var(--gradient)', color: '#fff', border: 'none', cursor: 'pointer' }}>
              <i className="fas fa-paper-plane" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}

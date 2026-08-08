'use client';

import { useEffect, useState } from 'react';

// PRODUCTIVITY HUB - VS Code, Git, Excel, Power BI shortcuts (Blogger wale se port)

const HUB: Record<string, { title: string; groups: { heading: string; shortcuts: { k: string; d: string }[] }[] }> = {
  vscode: {
    title: 'VS Code',
    groups: [
      { heading: 'Essential', shortcuts: [
        { k: 'Ctrl+P', d: 'Quick open file' },
        { k: 'Ctrl+Shift+P', d: 'Command palette' },
        { k: 'Ctrl+`', d: 'Toggle terminal' },
        { k: 'Ctrl+B', d: 'Toggle sidebar' },
        { k: 'Ctrl+Shift+F', d: 'Search in all files' },
      ]},
      { heading: 'Editing', shortcuts: [
        { k: 'Alt+↑ / ↓', d: 'Move line up/down' },
        { k: 'Shift+Alt+↓', d: 'Copy line down' },
        { k: 'Ctrl+D', d: 'Select next occurrence' },
        { k: 'Ctrl+/', d: 'Toggle comment' },
        { k: 'F2', d: 'Rename symbol' },
      ]},
    ],
  },
  git: {
    title: 'Git',
    groups: [
      { heading: 'Basics', shortcuts: [
        { k: 'git init', d: 'Repo shuru karo' },
        { k: 'git add .', d: 'Saari files stage karo' },
        { k: 'git commit -m "msg"', d: 'Commit karo' },
        { k: 'git status', d: 'Status dekho' },
        { k: 'git log --oneline', d: 'Commit history' },
      ]},
      { heading: 'Branch & Push', shortcuts: [
        { k: 'git branch', d: 'Branches list' },
        { k: 'git checkout -b new', d: 'Nayi branch banao' },
        { k: 'git push -u origin main', d: 'Pehli push' },
        { k: 'git pull', d: 'Latest changes lo' },
        { k: 'git merge branch', d: 'Branch merge' },
      ]},
    ],
  },
  excel: {
    title: 'Excel',
    groups: [
      { heading: 'Navigation', shortcuts: [
        { k: 'Ctrl+→', d: 'Data ke end tak jao' },
        { k: 'Ctrl+Shift+→', d: 'Select to end' },
        { k: 'Ctrl+Home', d: 'A1 pe jao' },
        { k: 'Ctrl+PageDown', d: 'Next sheet' },
        { k: 'Alt+=', d: 'Auto SUM' },
      ]},
      { heading: 'Formatting', shortcuts: [
        { k: 'Ctrl+B / I / U', d: 'Bold / Italic / Underline' },
        { k: 'Ctrl+1', d: 'Format cells' },
        { k: 'Alt+H+O+I', d: 'Auto fit column width' },
        { k: 'Ctrl+T', d: 'Table banao' },
        { k: 'Ctrl+Shift+L', d: 'Filter toggle' },
      ]},
    ],
  },
  powerbi: {
    title: 'Power BI',
    groups: [
      { heading: 'Power Query', shortcuts: [
        { k: 'Data → Get Data', d: 'Data source chuno' },
        { k: 'Remove Rows → Remove Duplicates', d: 'Duplicates hatao' },
        { k: 'Close & Apply', d: 'Transform apply karo' },
      ]},
      { heading: 'DAX Quick', shortcuts: [
        { k: 'CALCULATE', d: 'Filter context change' },
        { k: 'TOTALYTD', d: 'Year-to-date total' },
        { k: 'SAMEPERIODLASTYEAR', d: 'Previous year compare' },
        { k: 'DIVIDE(a, b, 0)', d: 'Zero-division safe divide' },
      ]},
    ],
  },
  mysql: {
    title: 'MySQL',
    groups: [
      { heading: 'Essentials', shortcuts: [
        { k: 'SHOW DATABASES;', d: 'Databases list' },
        { k: 'USE dbname;', d: 'Database select' },
        { k: 'SHOW TABLES;', d: 'Tables list' },
        { k: 'DESCRIBE table;', d: 'Table structure' },
        { k: 'EXPLAIN SELECT...', d: 'Query plan dekho' },
      ]},
      { heading: 'Tips', shortcuts: [
        { k: 'LIMIT 10', d: 'Pehle 10 rows (test ke liye)' },
        { k: 'COUNT(*) vs COUNT(col)', d: 'COUNT(*) NULL bhi count karta hai' },
        { k: 'Index on WHERE columns', d: 'Query 10x fast' },
      ]},
    ],
  },
};

const TABS = [
  { key: 'vscode', label: '💻 VS Code' },
  { key: 'git', label: '🐙 Git' },
  { key: 'excel', label: '📗 Excel' },
  { key: 'powerbi', label: '📈 Power BI' },
  { key: 'mysql', label: '🗄️ MySQL' },
];

export default function ProductivityHub() {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState('vscode');
  const [query, setQuery] = useState('');

  useEffect(() => {
    // Custom event se kholo (navbar button se)
    const handler = () => setOpen(true);
    window.addEventListener('open-productivity-hub', handler);
    return () => window.removeEventListener('open-productivity-hub', handler);
  }, []);

  if (!open) return null;

  const current = HUB[tab];
  const filteredGroups = current.groups
    .map((g) => ({
      ...g,
      shortcuts: g.shortcuts.filter((s) =>
        !query.trim() || (s.k + ' ' + s.d).toLowerCase().includes(query.toLowerCase())
      ),
    }))
    .filter((g) => g.shortcuts.length > 0);

  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(2,6,23,0.6)', backdropFilter: 'blur(4px)',
        zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
      }}
      onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
    >
      <div style={{
        background: 'var(--card-bg)', borderRadius: 16, width: 'min(680px, 100%)', maxHeight: '85vh',
        display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 24px 80px rgba(0,0,0,0.3)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>
            <i className="fas fa-bolt" style={{ color: 'var(--primary)', marginRight: 8 }} />
            Productivity Hub
          </h3>
          <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', fontSize: '1.3rem', cursor: 'pointer', color: 'var(--text-light)' }}>✕</button>
        </div>

        <div style={{ display: 'flex', gap: 8, padding: '12px 20px', flexWrap: 'wrap' }}>
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => { setTab(t.key); setQuery(''); }}
              style={{
                padding: '7px 14px', borderRadius: 20, fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer',
                background: tab === t.key ? 'var(--gradient)' : 'var(--bg)',
                color: tab === t.key ? '#fff' : 'var(--text-dark)',
                border: '1px solid var(--border)',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div style={{ padding: '0 20px 12px' }}>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Search ${current.title} shortcuts...`}
            style={{
              width: '100%', padding: '10px 14px', border: '1px solid var(--border)', borderRadius: 10,
              background: 'var(--bg)', color: 'var(--text-dark)', outline: 'none', fontSize: '0.88rem', boxSizing: 'border-box',
            }}
          />
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px 20px' }}>
          {filteredGroups.length === 0 ? (
            <p style={{ color: 'var(--text-light)', textAlign: 'center', padding: 20 }}>Kuch nahi mila.</p>
          ) : (
            filteredGroups.map((g) => (
              <div key={g.heading} style={{ marginBottom: 14 }}>
                <div style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: 6, color: 'var(--primary)' }}>{g.heading}</div>
                {g.shortcuts.map((s) => (
                  <div key={s.k} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 10px', borderBottom: '1px solid var(--border)', fontSize: '0.85rem' }}>
                    <code style={{ background: 'var(--bg)', padding: '3px 9px', borderRadius: 6, fontSize: '0.78rem', color: 'var(--text-dark)', fontFamily: "'Fira Code', monospace" }}>{s.k}</code>
                    <span style={{ color: 'var(--text-light)', fontSize: '0.8rem' }}>{s.d}</span>
                  </div>
                ))}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

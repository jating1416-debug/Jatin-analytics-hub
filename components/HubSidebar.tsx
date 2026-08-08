'use client';

import { useState } from 'react';

// PRODUCTIVITY HUB - SIDEBAR WIDGET (hamesha khula, content visible)
// Tab select karo -> shortcuts neeche dikhte hain (kisi modal ki zaroorat nahi)

const HUB: Record<string, { title: string; icon: string; groups: { heading: string; shortcuts: { k: string; d: string }[] }[] }> = {
  vscode: {
    title: 'VS Code', icon: '💻',
    groups: [
      { heading: 'Essential', shortcuts: [
        { k: 'Ctrl+P', d: 'Quick open' }, { k: 'Ctrl+Shift+P', d: 'Command palette' },
        { k: 'Ctrl+`', d: 'Terminal' }, { k: 'Ctrl+B', d: 'Sidebar toggle' },
        { k: 'Ctrl+Shift+F', d: 'Search files' }, { k: 'Ctrl+D', d: 'Next occurrence' },
        { k: 'Alt+↑/↓', d: 'Move line' }, { k: 'Ctrl+/', d: 'Comment toggle' },
        { k: 'Shift+Alt+F', d: 'Format' }, { k: 'F2', d: 'Rename' },
      ]},
    ],
  },
  git: {
    title: 'Git', icon: '🐙',
    groups: [
      { heading: 'Commands', shortcuts: [
        { k: 'git init', d: 'Repo shuru' }, { k: 'git add .', d: 'Stage sab' },
        { k: 'git commit -m "msg"', d: 'Commit' }, { k: 'git status', d: 'Status' },
        { k: 'git log --oneline', d: 'History' }, { k: 'git push -u origin main', d: 'Push' },
        { k: 'git pull', d: 'Update' }, { k: 'git checkout -b new', d: 'Branch banao' },
        { k: 'git merge branch', d: 'Merge' }, { k: 'git stash', d: 'Side rakho' },
      ]},
    ],
  },
  python: {
    title: 'Python', icon: '🐍',
    groups: [
      { heading: 'Pandas', shortcuts: [
        { k: 'df.head()', d: 'Pehli rows' }, { k: 'df.info()', d: 'Info + nulls' },
        { k: 'df.describe()', d: 'Stats' }, { k: 'df.groupby("c").sum()', d: 'Group+agg' },
        { k: 'pd.merge(df1, df2, on="id")', d: 'JOIN' }, { k: 'df.pivot_table(...)', d: 'Pivot' },
        { k: 'df.isnull().sum()', d: 'Missing' }, { k: 'df.fillna(0)', d: 'Fill' },
        { k: 'df.drop_duplicates()', d: 'Dedup' }, { k: 'np.where(c, a, b)', d: 'If-else' },
      ]},
    ],
  },
  excel: {
    title: 'Excel', icon: '📗',
    groups: [
      { heading: 'Formulas & Keys', shortcuts: [
        { k: '=XLOOKUP(...)', d: 'Lookup' }, { k: '=SUMIFS(...)', d: 'Multi sum' },
        { k: '=INDEX+MATCH', d: 'Classic lookup' }, { k: '=IFS(...)', d: 'Multi if' },
        { k: 'Ctrl+T', d: 'Table' }, { k: 'Ctrl+Shift+L', d: 'Filter' },
        { k: 'Alt+=', d: 'Auto SUM' }, { k: 'F4', d: '$ lock' },
        { k: 'Ctrl+1', d: 'Format cells' }, { k: 'Alt+E+S+V', d: 'Paste values' },
      ]},
    ],
  },
  powerbi: {
    title: 'Power BI', icon: '📈',
    groups: [
      { heading: 'DAX', shortcuts: [
        { k: 'CALCULATE(...)', d: 'Filter context' }, { k: 'TOTALYTD(...)', d: 'YTD' },
        { k: 'SAMEPERIODLASTYEAR', d: 'Prev year' }, { k: 'DIVIDE(a,b,0)', d: 'Safe divide' },
        { k: 'FILTER + ALL', d: '% total' }, { k: 'RANKX(...)', d: 'Rank' },
        { k: 'SWITCH(TRUE())', d: 'Multi cond' }, { k: 'DISTINCTCOUNT', d: 'Unique' },
      ]},
    ],
  },
  powerquery: {
    title: 'Power Query', icon: '🔌',
    groups: [
      { heading: 'M Functions', shortcuts: [
        { k: 'Table.SelectRows', d: 'Filter' }, { k: 'Table.Group', d: 'GroupBy' },
        { k: 'Table.AddColumn', d: 'Custom col' }, { k: 'Table.Distinct', d: 'Dedup' },
        { k: 'Table.UnpivotOtherColumns', d: 'Wide→Long' }, { k: 'Table.NestedJoin', d: 'Merge' },
      ]},
    ],
  },
  mysql: {
    title: 'MySQL', icon: '🗄️',
    groups: [
      { heading: 'Queries', shortcuts: [
        { k: 'SHOW DATABASES;', d: 'DB list' }, { k: 'USE db;', d: 'Select DB' },
        { k: 'SHOW TABLES;', d: 'Tables' }, { k: 'DESCRIBE t;', d: 'Structure' },
        { k: 'EXPLAIN SELECT...', d: 'Plan' }, { k: 'LIMIT 10', d: 'Test rows' },
        { k: 'CREATE INDEX ...', d: 'Fast query' }, { k: 'WITH (CTE)', d: 'Steps' },
      ]},
    ],
  },
  docker: {
    title: 'Docker', icon: '🐳',
    groups: [
      { heading: 'Commands', shortcuts: [
        { k: 'docker ps', d: 'Containers' }, { k: 'docker images', d: 'Images' },
        { k: 'docker pull nginx', d: 'Pull' }, { k: 'docker run -d -p 8080:80 nginx', d: 'Run' },
        { k: 'docker stop id', d: 'Stop' }, { k: 'docker build -t app .', d: 'Build' },
      ]},
    ],
  },
  linux: {
    title: 'Linux', icon: '💻',
    groups: [
      { heading: 'Commands', shortcuts: [
        { k: 'ls -la', d: 'Files' }, { k: 'cd ~', d: 'Home' },
        { k: 'grep "x" file', d: 'Search' }, { k: 'head -20 f.csv', d: 'Pehli lines' },
        { k: 'wc -l f.csv', d: 'Line count' }, { k: 'awk -F"," "{print $1}"', d: 'CSV col' },
      ]},
    ],
  },
  jupyter: {
    title: 'Jupyter', icon: '📓',
    groups: [
      { heading: 'Shortcuts', shortcuts: [
        { k: 'Shift+Enter', d: 'Run cell' }, { k: 'M', d: 'Markdown' },
        { k: 'Y', d: 'Code' }, { k: 'A / B', d: 'Cell upar/neeche' },
        { k: 'DD', d: 'Delete cell' }, { k: '%timeit', d: 'Speed test' },
      ]},
    ],
  },
  sheets: {
    title: 'Sheets', icon: '📗',
    groups: [
      { heading: 'Formulas', shortcuts: [
        { k: '=QUERY(A1:D, "SELECT...")', d: 'SQL jaisa' }, { k: '=ARRAYFORMULA(...)', d: 'Col calc' },
        { k: '=SPARKLINE(...)', d: 'Mini chart' }, { k: '=IFERROR(x, "d")', d: 'Error safe' },
        { k: 'Ctrl+Shift+L', d: 'Filter' }, { k: 'Ctrl+Shift+V', d: 'Paste values' },
      ]},
    ],
  },
  tableau: {
    title: 'Tableau', icon: '📐',
    groups: [
      { heading: 'Build', shortcuts: [
        { k: 'Drag → Columns/Rows', d: 'Chart' }, { k: 'Double-click field', d: 'Auto chart' },
        { k: 'Right-click → Dual Axis', d: 'Combine' }, { k: 'Ctrl+D', d: 'Duplicate sheet' },
        { k: 'Dashboard → Actions', d: 'Interactive' }, { k: 'Ctrl+Shift+D', d: 'Dup dashboard' },
      ]},
    ],
  },
};

const TABS = Object.entries(HUB).map(([key, v]) => ({ key, label: `${v.icon} ${v.title}` }));

export default function HubSidebar() {
  const [tab, setTab] = useState('vscode');
  const [open, setOpen] = useState(true);
  const current = HUB[tab];

  return (
    <div className="sidebar-widget">
      <div className="widget-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span><i className="fas fa-bolt" style={{ marginRight: 8 }} /> Productivity Hub</span>
        <button onClick={() => setOpen(!open)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-light)', fontSize: '0.8rem' }}>
          {open ? '▲' : '▼'}
        </button>
      </div>

      {/* Tabs - hamesha visible */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 10 }}>
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              padding: '4px 9px', borderRadius: 14, fontWeight: 700, fontSize: '0.68rem', cursor: 'pointer',
              background: tab === t.key ? 'var(--gradient)' : 'var(--bg)',
              color: tab === t.key ? '#fff' : 'var(--text-dark)',
              border: '1px solid var(--border)',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Content - hamesha khula */}
      {open && current.groups.map((g) => (
        <div key={g.heading} style={{ marginBottom: 8 }}>
          <div style={{ fontWeight: 700, fontSize: '0.75rem', color: 'var(--primary)', marginBottom: 4 }}>{g.heading}</div>
          {g.shortcuts.map((s) => (
            <div key={s.k} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0', borderBottom: '1px dashed var(--border)', fontSize: '0.75rem' }}>
              <code style={{ background: 'var(--bg)', padding: '2px 7px', borderRadius: 5, fontSize: '0.68rem', color: 'var(--text-dark)' }}>{s.k}</code>
              <span style={{ color: 'var(--text-light)', fontSize: '0.72rem' }}>{s.d}</span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

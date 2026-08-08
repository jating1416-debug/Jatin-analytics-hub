'use client';

import { useEffect, useState } from 'react';

// PRODUCTIVITY HUB - Blogger wale theme jaisa (20+ tools/tabs + search)

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
        { k: 'Ctrl+Shift+E', d: 'Explorer' },
        { k: 'Ctrl+Shift+G', d: 'Source control' },
      ]},
      { heading: 'Editing', shortcuts: [
        { k: 'Alt+↑ / ↓', d: 'Move line up/down' },
        { k: 'Shift+Alt+↓', d: 'Copy line down' },
        { k: 'Ctrl+D', d: 'Select next occurrence' },
        { k: 'Ctrl+/', d: 'Toggle comment' },
        { k: 'F2', d: 'Rename symbol' },
        { k: 'Ctrl+Shift+K', d: 'Delete line' },
        { k: 'Alt+Click', d: 'Multi-cursor' },
        { k: 'Ctrl+Space', d: 'IntelliSense' },
      ]},
      { heading: 'Multi-cursor & Format', shortcuts: [
        { k: 'Ctrl+Shift+L', d: 'Select all occurrences' },
        { k: 'Shift+Alt+I', d: 'Cursor at line ends' },
        { k: 'Shift+Alt+F', d: 'Format document' },
        { k: 'Ctrl+Shift+[', d: 'Fold section' },
        { k: 'Ctrl+K Ctrl+S', d: 'Keyboard shortcuts' },
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
        { k: 'git diff', d: 'Changes dekho' },
      ]},
      { heading: 'Branch & Push', shortcuts: [
        { k: 'git branch', d: 'Branches list' },
        { k: 'git checkout -b new', d: 'Nayi branch banao' },
        { k: 'git push -u origin main', d: 'Pehli push' },
        { k: 'git pull', d: 'Latest changes lo' },
        { k: 'git merge branch', d: 'Branch merge' },
        { k: 'git clone url', d: 'Repo copy karo' },
      ]},
      { heading: 'Undo & Fix', shortcuts: [
        { k: 'git reset HEAD file', d: 'Unstage karo' },
        { k: 'git checkout -- file', d: 'File revert' },
        { k: 'git stash', d: 'Changes side rakh do' },
        { k: 'git stash pop', d: 'Stash wapas lo' },
        { k: 'git rebase -i', d: 'Interactive rebase' },
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
        { k: 'Ctrl+G', d: 'Go to' },
      ]},
      { heading: 'Formatting', shortcuts: [
        { k: 'Ctrl+B / I / U', d: 'Bold / Italic / Underline' },
        { k: 'Ctrl+1', d: 'Format cells' },
        { k: 'Alt+H+O+I', d: 'Auto fit column width' },
        { k: 'Ctrl+T', d: 'Table banao' },
        { k: 'Ctrl+Shift+L', d: 'Filter toggle' },
        { k: 'Ctrl+5', d: 'Strikethrough' },
      ]},
      { heading: 'Data & Formulas', shortcuts: [
        { k: 'F4', d: 'Reference lock ($)' },
        { k: 'Ctrl+Shift+Enter', d: 'Array formula' },
        { k: 'Alt+E+S+V', d: 'Paste special - values' },
        { k: 'Ctrl+;', d: 'Aaj ki date' },
        { k: 'Ctrl+Shift+:', d: 'Current time' },
        { k: 'F2', d: 'Edit cell' },
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
        { k: 'Fill Down', d: 'Missing values bharo' },
        { k: 'Split Column', d: 'Column split karo' },
      ]},
      { heading: 'DAX Quick', shortcuts: [
        { k: 'CALCULATE', d: 'Filter context change' },
        { k: 'TOTALYTD', d: 'Year-to-date total' },
        { k: 'SAMEPERIODLASTYEAR', d: 'Previous year compare' },
        { k: 'DIVIDE(a, b, 0)', d: 'Zero-division safe' },
        { k: 'FILTER + ALL', d: '% of total' },
        { k: 'RANKX', d: 'Ranking' },
        { k: 'SWITCH(TRUE())', d: 'Multiple conditions' },
      ]},
      { heading: 'Modeling Tips', shortcuts: [
        { k: 'Star Schema', d: 'Facts + Dimensions' },
        { k: 'Mark as Date Table', d: 'Time intelligence ke liye' },
        { k: 'Relationships 1:*', d: 'Direction sahi rakho' },
        { k: 'Hide measure tables', d: 'Model clean rakho' },
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
      { heading: 'Query Tips', shortcuts: [
        { k: 'LIMIT 10', d: 'Pehle 10 rows (test)' },
        { k: 'COUNT(*) vs COUNT(col)', d: 'COUNT(*) NULL bhi count' },
        { k: 'Index on WHERE cols', d: 'Query 10x fast' },
        { k: 'JOIN vs Subquery', d: 'JOIN usually fast' },
        { k: 'WITH (CTE)', d: 'Complex query steps' },
      ]},
    ],
  },
  python: {
    title: 'Python',
    groups: [
      { heading: 'Pandas', shortcuts: [
        { k: 'df.head()', d: 'Pehli 5 rows' },
        { k: 'df.info()', d: 'Data types + nulls' },
        { k: 'df.describe()', d: 'Stats' },
        { k: 'df.groupby("c").sum()', d: 'Group + aggregate' },
        { k: 'pd.merge(df1, df2, on="id")', d: 'JOIN jaisa' },
        { k: 'df.pivot_table(...)', d: 'Pivot table' },
      ]},
      { heading: 'NumPy', shortcuts: [
        { k: 'np.where(cond, a, b)', d: 'If-else vectorized' },
        { k: 'np.select(conds, choices)', d: 'Multi conditions' },
        { k: 'np.linspace(0,1,10)', d: 'Evenly spaced' },
        { k: 'arr.reshape()', d: 'Shape badlo' },
      ]},
      { heading: 'Cleaning', shortcuts: [
        { k: 'df.isnull().sum()', d: 'Missing values' },
        { k: 'df.fillna(0)', d: 'Fill missing' },
        { k: 'df.drop_duplicates()', d: 'Duplicates hatao' },
        { k: 'df["col"].astype(int)', d: 'Type convert' },
      ]},
    ],
  },
  docker: {
    title: 'Docker',
    groups: [
      { heading: 'Basics', shortcuts: [
        { k: 'docker ps', d: 'Running containers' },
        { k: 'docker images', d: 'Images list' },
        { k: 'docker pull nginx', d: 'Image download' },
        { k: 'docker run -d -p 8080:80 nginx', d: 'Container chalao' },
        { k: 'docker stop id', d: 'Container roko' },
      ]},
      { heading: 'Dockerfile', shortcuts: [
        { k: 'FROM python:3.12', d: 'Base image' },
        { k: 'COPY . /app', d: 'Files copy' },
        { k: 'RUN pip install -r req.txt', d: 'Install deps' },
        { k: 'CMD ["python","app.py"]', d: 'Start command' },
      ]},
    ],
  },
  powerquery: {
    title: 'Power Query M',
    groups: [
      { heading: 'Table Functions', shortcuts: [
        { k: 'Table.SelectRows', d: 'Filter rows' },
        { k: 'Table.Group', d: 'GroupBy + agg' },
        { k: 'Table.AddColumn', d: 'Custom column' },
        { k: 'Table.Distinct', d: 'Remove duplicates' },
        { k: 'Table.UnpivotOtherColumns', d: 'Wide → Long' },
        { k: 'Table.NestedJoin', d: 'Merge (JOIN)' },
      ]},
      { heading: 'M Syntax', shortcuts: [
        { k: 'let ... in', d: 'Steps structure' },
        { k: 'each [Amount] > 50', d: 'Row shortcut' },
        { k: 'List.Sum([col])', d: 'Sum list' },
        { k: 'try ... otherwise', d: 'Error handling' },
      ]},
    ],
  },
  linux: {
    title: 'Linux / Bash',
    groups: [
      { heading: 'Files', shortcuts: [
        { k: 'ls -la', d: 'Saari files detail' },
        { k: 'cd ~', d: 'Home pe jao' },
        { k: 'pwd', d: 'Current folder' },
        { k: 'cp -r a b', d: 'Copy folder' },
        { k: 'mv file dir/', d: 'Move karo' },
        { k: 'rm -rf folder', d: '⚠️ Delete (dhyan se!)' },
      ]},
      { heading: 'Data Tools', shortcuts: [
        { k: 'cat file.csv', d: 'File dekho' },
        { k: 'grep "error" log.txt', d: 'Search in file' },
        { k: 'head -20 file.csv', d: 'Pehli 20 lines' },
        { k: 'wc -l file.csv', d: 'Line count' },
        { k: 'awk -F"," "{print $1}"', d: 'CSV column' },
      ]},
    ],
  },
  jupyter: {
    title: 'Jupyter',
    groups: [
      { heading: 'Shortcuts', shortcuts: [
        { k: 'Shift+Enter', d: 'Run cell' },
        { k: 'Ctrl+Enter', d: 'Run + stay' },
        { k: 'M', d: 'Cell → Markdown' },
        { k: 'Y', d: 'Cell → Code' },
        { k: 'A / B', d: 'Cell upar/neeche' },
        { k: 'DD', d: 'Cell delete' },
      ]},
      { heading: 'Magic Commands', shortcuts: [
        { k: '%timeit', d: 'Speed test' },
        { k: '%%writefile', d: 'File save' },
        { k: '%matplotlib inline', d: 'Charts dikhao' },
        { k: '!pip install x', d: 'Shell command' },
      ]},
    ],
  },
  sheets: {
    title: 'Google Sheets',
    groups: [
      { heading: 'Formulas', shortcuts: [
        { k: '=VLOOKUP(A2, range, 2, FALSE)', d: 'Lookup' },
        { k: '=QUERY(A1:D100, "SELECT...")', d: 'SQL jaisa' },
        { k: '=ARRAYFORMULA(...)', d: 'Column-wise calc' },
        { k: '=SPARKLINE(...)', d: 'Mini chart' },
        { k: '=IFERROR(x, "default")', d: 'Error handle' },
      ]},
      { heading: 'Shortcuts', shortcuts: [
        { k: 'Ctrl+Shift+L', d: 'Filter' },
        { k: 'Alt+Shift+F', d: 'Filter toggle' },
        { k: 'Ctrl+Shift+V', d: 'Paste values' },
        { k: 'F4', d: 'Repeat last action' },
      ]},
    ],
  },
  tableau: {
    title: 'Tableau',
    groups: [
      { heading: 'Build', shortcuts: [
        { k: 'Drag → Columns/Rows', d: 'Chart banao' },
        { k: 'Double-click field', d: 'Auto chart' },
        { k: 'Ctrl+Shift+B', d: 'Create bin' },
        { k: 'Right-click → Dual Axis', d: '2 charts combine' },
      ]},
      { heading: 'Tips', shortcuts: [
        { k: 'Ctrl+D', d: 'Duplicate sheet' },
        { k: 'Ctrl+Shift+D', d: 'Duplicate dashboard' },
        { k: 'Right-click → Animate', d: 'Animation' },
        { k: 'Dashboard → Actions', d: 'Interactive filter' },
      ]},
    ],
  },
};

const TABS = [
  { key: 'vscode', label: '💻 VS Code' },
  { key: 'git', label: '🐙 Git' },
  { key: 'python', label: '🐍 Python' },
  { key: 'excel', label: '📗 Excel' },
  { key: 'powerbi', label: '📈 Power BI' },
  { key: 'powerquery', label: '🔌 Power Query' },
  { key: 'mysql', label: '🗄️ MySQL' },
  { key: 'docker', label: '🐳 Docker' },
  { key: 'linux', label: '💻 Linux' },
  { key: 'jupyter', label: '📓 Jupyter' },
  { key: 'sheets', label: '📗 Sheets' },
  { key: 'tableau', label: '📐 Tableau' },
];

export default function ProductivityHub() {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState('vscode');
  const [query, setQuery] = useState('');

  useEffect(() => {
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
        background: 'var(--card-bg)', borderRadius: 16, width: 'min(760px, 100%)', maxHeight: '85vh',
        display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 24px 80px rgba(0,0,0,0.3)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>
            <i className="fas fa-bolt" style={{ color: 'var(--primary)', marginRight: 8 }} />
            Productivity Hub <span style={{ fontSize: '0.7rem', color: 'var(--text-light)', fontWeight: 600 }}>({TABS.length} tools)</span>
          </h3>
          <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', fontSize: '1.3rem', cursor: 'pointer', color: 'var(--text-light)' }}>✕</button>
        </div>

        <div style={{ display: 'flex', gap: 6, padding: '12px 20px', flexWrap: 'wrap' }}>
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => { setTab(t.key); setQuery(''); }}
              style={{
                padding: '6px 12px', borderRadius: 18, fontWeight: 700, fontSize: '0.76rem', cursor: 'pointer',
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

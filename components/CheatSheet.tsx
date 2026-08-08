'use client';

import { useEffect, useState } from 'react';

// CHEAT SHEET MODAL - MySQL/Python/Power BI/Excel tabs + live search
// (Blogger wale theme se port)

const CHEAT_SHEETS: Record<string, { title: string; blocks: { heading: string; code: string }[] }> = {
  mysql: {
    title: 'MySQL',
    blocks: [
      { heading: 'SELECT & WHERE', code: `-- Basic SELECT\nSELECT col1, col2 FROM table_name;\n\n-- With WHERE\nSELECT * FROM employees WHERE salary > 50000;\n\n-- DISTINCT\nSELECT DISTINCT department FROM employees;` },
      { heading: 'JOIN Operations', code: `-- INNER JOIN\nSELECT e.name, d.dept_name\nFROM employees e\nINNER JOIN departments d ON e.dept_id = d.id;\n\n-- LEFT JOIN\nSELECT * FROM employees e\nLEFT JOIN salaries s ON e.id = s.emp_id;` },
      { heading: 'GROUP BY & AGGREGATE', code: `SELECT department, COUNT(*) as emp_count, AVG(salary) as avg_sal\nFROM employees\nGROUP BY department\nHAVING COUNT(*) > 5;\n\n-- Common: SUM, COUNT, AVG, MIN, MAX` },
      { heading: 'WINDOW FUNCTIONS', code: `-- ROW_NUMBER, RANK, DENSE_RANK\nSELECT name, salary,\n  ROW_NUMBER() OVER(PARTITION BY dept ORDER BY salary DESC) as rn,\n  RANK() OVER(PARTITION BY dept ORDER BY salary DESC) as rnk\nFROM employees;\n\n-- LAG & LEAD\nSELECT name, salary,\n  LAG(salary) OVER(ORDER BY hire_date) as prev_salary\nFROM employees;` },
      { heading: 'DATE FUNCTIONS', code: `CURDATE(), CURTIME(), NOW()\nDATE_ADD(date, INTERVAL 1 DAY)\nDATEDIFF(date1, date2)\nYEAR(), MONTH(), DAY()\nDATE_FORMAT(date, '%Y-%m-%d')` },
      { heading: 'CASE STATEMENT', code: `SELECT name, salary,\n  CASE\n    WHEN salary > 100000 THEN 'Senior'\n    WHEN salary > 50000 THEN 'Mid'\n    ELSE 'Junior'\n  END as level\nFROM employees;` },
      { heading: 'CTEs', code: `WITH high_earners AS (\n  SELECT * FROM employees WHERE salary > 80000\n)\nSELECT name, dept FROM high_earners;` },
    ],
  },
  python: {
    title: 'Python',
    blocks: [
      { heading: 'Pandas Basics', code: `import pandas as pd\nimport numpy as np\n\ndf = pd.read_csv('file.csv')\ndf.head()\ndf.info()\ndf.describe()\ndf.shape` },
      { heading: 'Filtering & Selection', code: `df[df['salary'] > 50000]\ndf[(df['dept'] == 'IT') & (df['salary'] > 60000)]\n\ndf['name']          # column\ndf[['name','age']]  # multiple\ndf.loc[0]           # row by label\ndf.iloc[0]          # row by position` },
      { heading: 'GroupBy', code: `df.groupby('dept')['salary'].sum()\ndf.groupby('dept')['salary'].agg(['sum','mean','count'])\n\ndf.groupby('dept').agg({\n  'salary': ['sum','mean'],\n  'emp_id': 'count'\n})` },
      { heading: 'Joins & Merges', code: `pd.merge(df1, df2, on='id', how='inner')\npd.merge(df1, df2, on='id', how='left')\n\ndf1.join(df2)                # index join\npd.concat([df1, df2], axis=0) # vertical` },
      { heading: 'Data Cleaning', code: `df.isnull().sum()\ndf.dropna()\ndf.fillna(0)\n\ndf.drop_duplicates()\ndf['col'].str.strip()\ndf['col'].astype(int)` },
      { heading: 'np.where / np.select', code: `import numpy as np\n\n# If-else ek line mein\ndf['status'] = np.where(df['score'] > 60, 'Pass', 'Fail')\n\n# Multiple conditions\nconds = [df['a']>10, df['a']>5]\nchoices = ['High', 'Medium']\ndf['band'] = np.select(conds, choices, default='Low')` },
    ],
  },
  powerbi: {
    title: 'Power BI',
    blocks: [
      { heading: 'CALCULATE', code: `Sales North =\nCALCULATE(\n    SUM(Sales[Amount]),\n    Region[Zone] = "North"\n)` },
      { heading: 'Time Intelligence', code: `Sales YTD = TOTALYTD([Total Sales], Calendar[Date])\nSales QTD = TOTALQTD([Total Sales], Calendar[Date])\nSales MTD = TOTALMTD([Total Sales], Calendar[Date])` },
      { heading: 'YoY Growth', code: `YoY % =\nVAR CurrentYear = SUM(Sales[Amount])\nVAR PrevYear = CALCULATE(SUM(Sales[Amount]),\n    SAMEPERIODLASTYEAR(Calendar[Date]))\nRETURN DIVIDE(CurrentYear - PrevYear, PrevYear, 0)` },
      { heading: 'FILTER + ALL', code: `Total All = CALCULATE(SUM(Sales[Amount]), ALL(Region))\n% of Total = DIVIDE(SUM(Sales[Amount]), [Total All])` },
      { heading: 'RANKX', code: `Product Rank = RANKX(\n    ALL(Product[Name]),\n    [Total Sales],\n    , DESC, Dense\n)` },
      { heading: 'IF / SWITCH', code: `Band = SWITCH(TRUE(),\n  [Sales] > 100000, "High",\n  [Sales] > 50000, "Mid",\n  "Low"\n)` },
    ],
  },
  excel: {
    title: 'Excel',
    blocks: [
      { heading: 'XLOOKUP', code: `=XLOOKUP(A2, Customers[ID], Customers[Name], "Not Found")` },
      { heading: 'SUMIFS / COUNTIFS', code: `=SUMIFS(Sales[Amount], Sales[Region], "North", Sales[Year], 2025)\n=COUNTIFS(A:A, ">50", B:B, "<100")` },
      { heading: 'INDEX + MATCH', code: `=INDEX(Result[Column], MATCH(A2, Result[Lookup], 0))` },
      { heading: 'IF / IFS', code: `=IF(A1>90, "A", IF(A1>75, "B", "C"))\n\n=IFS(A1>90,"A", A1>75,"B", TRUE,"C")` },
      { heading: 'TEXT Functions', code: `=TEXT(A1, "DD-MMM-YYYY")\n=TRIM(A1)\n=UPPER(A1), =LOWER(A1)\n=LEFT(A1,5), =RIGHT(A1,5), =MID(A1,2,3)` },
      { heading: 'Pivot Table Tips', code: `Pivot table:\n- Rows: Category\n- Values: Sum of Amount\n- Filter: Year\n\nQuick: Alt+N+V (Insert PivotTable)` },
    ],
  },
};

const TABS = [
  { key: 'mysql', label: 'MySQL' },
  { key: 'python', label: 'Python' },
  { key: 'powerbi', label: 'Power BI' },
  { key: 'excel', label: 'Excel' },
];

export default function CheatSheet() {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState('mysql');
  const [query, setQuery] = useState('');

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // Ctrl+Shift+C / Cmd+Shift+C open cheat sheet
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'c') {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const current = CHEAT_SHEETS[tab];
  const filtered = current.blocks.filter((b) =>
    !query.trim() || (b.heading + ' ' + b.code).toLowerCase().includes(query.toLowerCase())
  );

  if (!open) return null;

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
            <i className="fas fa-code" style={{ color: 'var(--primary)', marginRight: 8 }} />
            Quick Reference Cheat Sheet
          </h3>
          <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', fontSize: '1.3rem', cursor: 'pointer', color: 'var(--text-light)' }}>✕</button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 8, padding: '12px 20px', flexWrap: 'wrap' }}>
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{
                padding: '7px 16px', borderRadius: 20, fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer',
                background: tab === t.key ? 'var(--gradient)' : 'var(--bg)',
                color: tab === t.key ? '#fff' : 'var(--text-dark)',
                border: '1px solid var(--border)',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div style={{ padding: '0 20px 12px' }}>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Search ${current.title} formulas... e.g. JOIN, groupby, CALCULATE`}
            style={{
              width: '100%', padding: '10px 14px', border: '1px solid var(--border)', borderRadius: 10,
              background: 'var(--bg)', color: 'var(--text-dark)', outline: 'none', fontSize: '0.88rem', boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px 20px' }}>
          {filtered.length === 0 ? (
            <p style={{ color: 'var(--text-light)', textAlign: 'center', padding: 20 }}>Kuch nahi mila — koi aur keyword try karo.</p>
          ) : (
            filtered.map((b) => (
              <div key={b.heading} style={{ marginBottom: 14 }}>
                <div style={{ fontWeight: 700, fontSize: '0.88rem', marginBottom: 6, color: 'var(--primary)' }}>
                  <i className="fas fa-search" /> {b.heading}
                </div>
                <pre style={{
                  background: '#1e293b', color: '#e2e8f0', borderRadius: 10, padding: 14,
                  fontSize: '0.78rem', lineHeight: 1.6, overflowX: 'auto', margin: 0,
                  fontFamily: "'Fira Code', monospace",
                }}>{b.code}</pre>
              </div>
            ))
          )}
        </div>

        <div style={{ padding: '10px 20px', borderTop: '1px solid var(--border)', fontSize: '0.72rem', color: 'var(--text-light)' }}>
          💡 Shortcut: <b>Ctrl+Shift+C</b> se kholo/band karo
        </div>
      </div>
    </div>
  );
}

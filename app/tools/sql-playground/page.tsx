'use client';

import { useEffect, useState } from 'react';

// SQL.js script CDN se load hota hai (client-side, free)
const SQL_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/';

const SETUP = [
  "CREATE TABLE IF NOT EXISTS departments (id INTEGER PRIMARY KEY, dept_name TEXT, location TEXT);",
  "CREATE TABLE IF NOT EXISTS employees (id INTEGER PRIMARY KEY, name TEXT, department TEXT, salary REAL, hire_date TEXT, city TEXT);",
  "CREATE TABLE IF NOT EXISTS sales (id INTEGER PRIMARY KEY, product TEXT, category TEXT, amount REAL, region TEXT, sale_date TEXT);",
  "INSERT INTO departments VALUES (1,'Sales','Mumbai'),(2,'Engineering','Bangalore'),(3,'HR','Delhi'),(4,'Marketing','Pune');",
  "INSERT INTO employees VALUES (1,'Amit Sharma','Sales',65000,'2021-03-15','Mumbai'),(2,'Priya Patel','Engineering',82000,'2020-06-01','Bangalore'),(3,'Rahul Verma','Sales',72000,'2022-01-10','Delhi'),(4,'Sneha Iyer','Marketing',58000,'2021-09-20','Pune'),(5,'Vikram Singh','Engineering',95000,'2019-04-11','Bangalore'),(6,'Anjali Gupta','HR',54000,'2023-02-14','Delhi'),(7,'Rohit Kumar','Sales',61000,'2020-11-30','Mumbai'),(8,'Kavita Nair','Marketing',56000,'2022-07-05','Pune'),(9,'Arjun Mehta','Engineering',78000,'2021-12-01','Bangalore'),(10,'Pooja Joshi','HR',52000,'2023-08-19','Delhi');",
  "INSERT INTO sales VALUES (1,'Laptop','Electronics',75000,'North','2025-01-10'),(2,'Phone','Electronics',45000,'South','2025-01-12'),(3,'Chair','Furniture',12000,'North','2025-01-15'),(4,'Table','Furniture',25000,'East','2025-02-01'),(5,'Monitor','Electronics',18000,'West','2025-02-03'),(6,'Desk','Furniture',32000,'South','2025-02-10'),(7,'Keyboard','Electronics',5000,'North','2025-02-12'),(8,'Mouse','Electronics',1500,'East','2025-02-15'),(9,'Bookshelf','Furniture',22000,'West','2025-03-01'),(10,'Printer','Electronics',28000,'South','2025-03-05');",
];

const SAMPLES = [
  { label: 'All employees', sql: 'SELECT * FROM employees LIMIT 10;' },
  { label: 'Avg salary by dept', sql: 'SELECT department, ROUND(AVG(salary),0) AS avg_salary FROM employees GROUP BY department ORDER BY avg_salary DESC;' },
  { label: 'JOIN departments', sql: 'SELECT e.name, d.dept_name FROM employees e INNER JOIN departments d ON e.department = d.dept_name LIMIT 10;' },
  { label: 'Top sales', sql: 'SELECT * FROM sales WHERE amount > 50000 ORDER BY amount DESC;' },
  { label: 'Window rank', sql: 'SELECT name, salary, RANK() OVER (ORDER BY salary DESC) AS rnk FROM employees LIMIT 10;' },
];

type Result = { columns: string[]; values: (string | number | null)[][] };

export default function SqlPlayground() {
  const [sql, setSql] = useState('SELECT * FROM employees LIMIT 10;');
  const [loading, setLoading] = useState(true);
  const [db, setDb] = useState<any>(null);
  const [result, setResult] = useState<Result[] | null>(null);
  const [error, setError] = useState('');
  const [time, setTime] = useState<number | null>(null);

  // Try in Playground se aayi query auto-load
  useEffect(() => {
    try {
      const draft = localStorage.getItem('di_sql_draft');
      if (draft) {
        setSql(draft);
        localStorage.removeItem('di_sql_draft');
      }
    } catch {}
  }, []);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        // @ts-ignore
        const initSqlJs = (await import(/* webpackIgnore: true */ SQL_CDN + 'sql-wasm.js')).default;
        const SQL = await initSqlJs({ locateFile: (f: string) => SQL_CDN + f });
        const database = new SQL.Database();
        SETUP.forEach((q) => database.run(q));
        if (mounted) {
          setDb(database);
          setLoading(false);
          // agar draft se aayi query hai to auto-run
          try {
            const draft = localStorage.getItem('di_sql_draft_auto');
            if (draft) {
              localStorage.removeItem('di_sql_draft_auto');
              const res = database.exec(draft);
              if (res.length) {
                setResult(res.map((r: any) => ({ columns: r.columns, values: r.values })));
              } else {
                setResult([]);
              }
              setSql(draft);
            }
          } catch {}
        }
      } catch (e: any) {
        if (mounted) { setError('SQL engine load fail: ' + e.message); setLoading(false); }
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  const run = (query: string) => {
    if (!db) return;
    setError('');
    try {
      const t0 = performance.now();
      const res = db.exec(query);
      const t1 = performance.now();
      setTime(Math.round((t1 - t0) * 10) / 10);
      setResult(res.length ? res.map((r: any) => ({ columns: r.columns, values: r.values })) : null);
    } catch (e: any) {
      setResult(null);
      setError(e.message || 'SQL error');
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', minHeight: 140, padding: 12, border: '1px solid var(--border)', borderRadius: 10,
    background: '#1e293b', color: '#e2e8f0', fontFamily: "'Fira Code', monospace", fontSize: '0.8rem',
    boxSizing: 'border-box', marginBottom: 10, whiteSpace: 'pre', outline: 'none',
  };

  return (
    <div className="layout-wrapper">
      <main className="posts-section">
        <div className="post-content-wrapper" style={{ padding: 24 }}>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: 8 }}>🧠 SQL Playground</h1>
          <p style={{ color: 'var(--text-light)', fontSize: '0.9rem', marginBottom: 20 }}>
            100% browser mein SQLite (sql.js WASM) — real SQL run karo, koi server/API nahi.
          </p>

          {loading && !error && <p style={{ color: 'var(--text-light)' }}>⏳ SQL engine load ho raha hai (pehli baar ~1.5MB)...</p>}
          {error && <p style={{ color: '#ef4444', marginBottom: 10 }}>❌ {error}</p>}

          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
            {SAMPLES.map((s) => (
              <button key={s.label} onClick={() => { setSql(s.sql); run(s.sql); }}
                style={{ padding: '5px 12px', borderRadius: 16, fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer', background: 'var(--bg)', color: 'var(--text-dark)', border: '1px solid var(--border)' }}>
                {s.label}
              </button>
            ))}
          </div>

          <textarea value={sql} onChange={(e) => setSql(e.target.value)} spellCheck={false} style={inputStyle} />

          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            <button onClick={() => run(sql)} className="read-more-btn" style={{ border: 'none' }}>▶ Run Query</button>
          </div>

          {time !== null && result && (
            <p style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginBottom: 8 }}>
              ⚡ Executed in {time} ms | {result[0]?.values.length || 0} rows fetched
            </p>
          )}

          {result && result.map((r, ri) => (
            <div key={ri} style={{ overflowX: 'auto', marginBottom: 14 }}>
              <table className="sql-result-table">
                <thead><tr>{r.columns.map((c) => <th key={c}>{c}</th>)}</tr></thead>
                <tbody>
                  {r.values.slice(0, 100).map((row, i) => (
                    <tr key={i}>{row.map((v, ci) => <td key={ci}>{v === null ? 'NULL' : String(v)}</td>)}</tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
          {result === null && !error && time !== null && (
            <p style={{ color: '#16a34a', fontWeight: 700 }}>✅ Query executed! (INSERT/UPDATE/DELETE — koi result rows nahi)</p>
          )}
        </div>
      </main>
    </div>
  );
}

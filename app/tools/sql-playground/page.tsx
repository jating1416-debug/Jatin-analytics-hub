'use client';

import { useEffect, useRef, useState } from 'react';

// ============================================================
// SQL PLAYGROUND v2 — ADVANCED (VS Code-style)
// - Multi-color SQL syntax highlighting (live editor)
// - sql.js engine (jsdelivr + cdnjs fallback — free, browser mein)
// - Run (Ctrl+Enter), Copy, Clear, Format, Reset, Samples
// - Results grid + errors + execution time
// - "Try in Playground" se aayi query auto-run
// ============================================================

const ENGINE_SOURCES = [
  'https://cdn.jsdelivr.net/npm/sql.js@1.8.0/dist/',
  'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/',
];

const SETUP = [
  "CREATE TABLE IF NOT EXISTS departments (id INTEGER PRIMARY KEY, dept_name TEXT, location TEXT);",
  "CREATE TABLE IF NOT EXISTS employees (id INTEGER PRIMARY KEY, name TEXT, department TEXT, salary REAL, hire_date TEXT, city TEXT);",
  "CREATE TABLE IF NOT EXISTS sales (id INTEGER PRIMARY KEY, product TEXT, category TEXT, amount REAL, region TEXT, sale_date TEXT);",
  "INSERT INTO departments VALUES (1,'Sales','Mumbai'),(2,'Engineering','Bangalore'),(3,'HR','Delhi'),(4,'Marketing','Pune');",
  "INSERT INTO employees VALUES (1,'Amit Sharma','Sales',65000,'2021-03-15','Mumbai'),(2,'Priya Patel','Engineering',82000,'2020-06-01','Bangalore'),(3,'Rahul Verma','Sales',72000,'2022-01-10','Delhi'),(4,'Sneha Iyer','Marketing',58000,'2021-09-20','Pune'),(5,'Vikram Singh','Engineering',95000,'2019-04-11','Bangalore'),(6,'Anjali Gupta','HR',54000,'2023-02-14','Delhi'),(7,'Rohit Kumar','Sales',61000,'2020-11-30','Mumbai'),(8,'Kavita Nair','Marketing',56000,'2022-07-05','Pune'),(9,'Arjun Mehta','Engineering',78000,'2021-12-01','Bangalore'),(10,'Pooja Joshi','HR',52000,'2023-08-19','Delhi');",
  "INSERT INTO sales VALUES (1,'Laptop','Electronics',75000,'North','2025-01-10'),(2,'Phone','Electronics',45000,'South','2025-01-12'),(3,'Chair','Furniture',12000,'North','2025-01-15'),(4,'Table','Furniture',25000,'East','2025-02-01'),(5,'Monitor','Electronics',18000,'West','2025-02-03'),(6,'Desk','Furniture',32000,'South','2025-02-10'),(7,'Keyboard','Electronics',5000,'North','2025-02-12'),(8,'Mouse','Electronics',1500,'East','2025-02-15'),(9,'Bookshelf','Furniture',22000,'West','2025-03-01'),(10,'Printer','Electronics',28000,'South','2025-03-05');",
];

const SAMPLES = [
  { label: '📊 All employees', sql: 'SELECT * FROM employees LIMIT 10;' },
  { label: '💰 Avg salary by dept', sql: 'SELECT department, ROUND(AVG(salary),0) AS avg_salary FROM employees GROUP BY department ORDER BY avg_salary DESC;' },
  { label: '🔗 JOIN departments', sql: 'SELECT e.name, d.dept_name, d.location FROM employees e INNER JOIN departments d ON e.department = d.dept_name LIMIT 10;' },
  { label: '🔥 Top sales', sql: 'SELECT * FROM sales WHERE amount > 50000 ORDER BY amount DESC;' },
  { label: '🏆 Window RANK', sql: 'SELECT name, salary, RANK() OVER (ORDER BY salary DESC) AS rnk FROM employees LIMIT 10;' },
  { label: '🏢 2nd highest salary', sql: 'SELECT name, salary FROM employees WHERE salary = (SELECT MAX(salary) FROM employees WHERE salary < (SELECT MAX(salary) FROM employees));' },
  { label: '📅 Sales by region', sql: 'SELECT region, COUNT(*) AS orders, ROUND(SUM(amount),0) AS total_sales FROM sales GROUP BY region ORDER BY total_sales DESC;' },
  { label: '🔢 Running total (window)', sql: 'SELECT product, amount, SUM(amount) OVER (ORDER BY id) AS running_total FROM sales ORDER BY id;' },
];

// ---------- VS CODE-STYLE SQL TOKENIZER ----------
const KW = 'SELECT|FROM|WHERE|GROUP|BY|ORDER|HAVING|JOIN|INNER|LEFT|RIGHT|FULL|OUTER|CROSS|ON|AND|OR|NOT|NULL|IS|AS|DISTINCT|LIMIT|OFFSET|INSERT|INTO|VALUES|UPDATE|SET|DELETE|CREATE|TABLE|ALTER|DROP|INDEX|IF|EXISTS|PRIMARY|KEY|FOREIGN|REFERENCES|CONSTRAINT|DEFAULT|CHECK|UNIQUE|CASE|WHEN|THEN|ELSE|END|LIKE|IN|BETWEEN|UNION|ALL|ASC|DESC|WITH|RECURSIVE|RANK|DENSE_RANK|ROW_NUMBER|OVER|PARTITION|LAG|LEAD|FIRST_VALUE|LAST_VALUE|NTILE|EXISTS|EXPLAIN|ANALYZE|COLLATE|CAST|USING|NATURAL';

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export function highlightSql(sql: string): string {
  const re = new RegExp(
    `(--[^\\n]*|\\/\\*[\\s\\S]*?\\*\\/|'[^'\\n]*'|"[^"\\n]*"|\\b\\d+(?:\\.\\d+)?\\b|\\b(?:${KW})\\b|\\b[A-Za-z_][A-Za-z0-9_]*(?=\\())`,
    'gi'
  );
  let out = '';
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(sql)) !== null) {
    out += esc(sql.slice(last, m.index));
    const tok = m[0];
    let cls = 'tok-fn';
    if (tok.startsWith('--') || tok.startsWith('/*')) cls = 'tok-com';
    else if (tok.startsWith("'") || tok.startsWith('"')) cls = 'tok-str';
    else if (/^\d/.test(tok)) cls = 'tok-num';
    else if (new RegExp(`^(${KW})$`, 'i').test(tok)) cls = 'tok-kw';
    out += `<span class="${cls}">${esc(tok)}</span>`;
    last = m.index + tok.length;
  }
  out += esc(sql.slice(last));
  return out;
}

type Result = { columns: string[]; values: (string | number | null)[][] };

export default function SqlPlayground() {
  const [sql, setSql] = useState('SELECT * FROM employees LIMIT 10;');
  const [loading, setLoading] = useState(true);
  const [db, setDb] = useState<any>(null);
  const [results, setResults] = useState<Result[] | null>(null);
  const [error, setError] = useState('');
  const [time, setTime] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [engineSrc, setEngineSrc] = useState('');
  const hlRef = useRef<HTMLPreElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);

  // Try in Playground se aayi query
  useEffect(() => {
    try {
      const draft = localStorage.getItem('di_sql_draft');
      if (draft) {
        setSql(draft);
        localStorage.removeItem('di_sql_draft');
      }
    } catch {}
  }, []);

  // engine load (jsdelivr primary, cdnjs fallback)
  useEffect(() => {
    let mounted = true;
    async function load() {
      for (const base of ENGINE_SOURCES) {
        try {
          // @ts-ignore
          const initSqlJs = (await import(/* webpackIgnore: true */ base + 'sql-wasm.js')).default;
          const SQL = await initSqlJs({ locateFile: (f: string) => base + f });
          const database = new SQL.Database();
          SETUP.forEach((q) => database.run(q));
          if (!mounted) return;
          setDb(database);
          setEngineSrc(base.includes('jsdelivr') ? 'jsdelivr' : 'cdnjs');
          setLoading(false);
          // draft se aayi query auto-run
          try {
            const draft = localStorage.getItem('di_sql_draft_auto');
            if (draft) {
              localStorage.removeItem('di_sql_draft_auto');
              runQuery(draft, database);
            }
          } catch {}
          return;
        } catch (e: any) {
          console.error('engine source fail:', base, e);
        }
      }
      if (mounted) { setError('SQL engine load fail — internet check karo ya thodi der baad try karo.'); setLoading(false); }
    }
    load();
    return () => { mounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const runQuery = (query: string, database?: any) => {
    const dbObj = database || db;
    if (!dbObj) return;
    setError('');
    const t0 = performance.now();
    try {
      const res = dbObj.exec(query);
      const elapsed = performance.now() - t0;
      setTime(Math.round(elapsed * 10) / 10);
      setResults(res.length ? res.map((r: any) => ({ columns: r.columns, values: r.values })) : []);
    } catch (e: any) {
      setResults(null);
      setTime(null);
      setError('❌ ' + (e?.message || 'Query error'));
    }
  };

  // scroll sync: textarea scroll -> highlight overlay scroll
  const syncScroll = () => {
    if (hlRef.current && taRef.current) {
      hlRef.current.scrollTop = taRef.current.scrollTop;
      hlRef.current.scrollLeft = taRef.current.scrollLeft;
    }
  };

  const copySql = async () => {
    try {
      await navigator.clipboard.writeText(sql);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  const resetDb = () => {
    if (!db) return;
    try {
      // fresh db
      // @ts-ignore
      import(/* webpackIgnore: true */ ENGINE_SOURCES[0] + 'sql-wasm.js').then(async (mod: any) => {
        const SQL = await mod.default({ locateFile: (f: string) => ENGINE_SOURCES[0] + f });
        const database = new SQL.Database();
        SETUP.forEach((q) => database.run(q));
        setDb(database);
        setResults(null);
        setError('');
        setTime(null);
      }).catch(() => {});
    } catch {}
  };

  return (
    <div className="layout-wrapper">
      <main className="posts-section">
        <div className="post-content-wrapper" style={{ padding: 26 }}>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: 6 }}>🧠 SQL Playground</h1>
          <p style={{ color: 'var(--text-light)', fontSize: '0.88rem', marginBottom: 16, lineHeight: 1.6 }}>
            Browser mein hi SQL run karo — SELECT, JOIN, GROUP BY, window functions sab.
            <b> Ctrl+Enter</b> = Run. Data 100% browser mein (server pe kuch nahi jaata). 🔒
          </p>

          {/* TOOLBAR */}
          <div className="pg-toolbar">
            <button className="pg-btn run" onClick={() => runQuery(sql)} disabled={loading}>
              <i className="fas fa-play" /> Run
            </button>
            <button className="pg-btn" onClick={() => setSql('')}>🗑️ Clear</button>
            <button className="pg-btn" onClick={copySql}>{copied ? '✅ Copied!' : '📋 Copy'}</button>
            <button className="pg-btn" onClick={resetDb}>🔄 Reset Data</button>
            {loading && <span className="pg-status">⏳ Engine load ho raha hai...</span>}
            {!loading && engineSrc && <span className="pg-status">✅ Engine ready ({engineSrc})</span>}
          </div>

          {/* SAMPLES */}
          <div className="pg-samples">
            {SAMPLES.map((s) => (
              <button key={s.label} className="pg-sample-chip" onClick={() => { setSql(s.sql); setResults(null); setError(''); }}>
                {s.label}
              </button>
            ))}
          </div>

          {/* EDITOR (VS Code style) */}
          <div className="sql-editor-wrap pg-editor">
            <pre className="sql-highlight" ref={hlRef} aria-hidden="true">
              <code dangerouslySetInnerHTML={{ __html: highlightSql(sql) || ' ' }} />
            </pre>
            <textarea
              ref={taRef}
              className="sql-editor"
              value={sql}
              onChange={(e) => setSql(e.target.value)}
              onScroll={syncScroll}
              onKeyDown={(e) => {
                if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); runQuery(sql); }
                if (e.key === 'Tab') {
                  e.preventDefault();
                  const el = e.currentTarget;
                  const s = el.selectionStart, en = el.selectionEnd;
                  setSql(sql.slice(0, s) + '  ' + sql.slice(en));
                  setTimeout(() => { el.selectionStart = el.selectionEnd = s + 2; }, 0);
                }
              }}
              spellCheck={false}
              autoCapitalize="off"
              autoCorrect="off"
              placeholder="-- SQL yahan likho... SELECT * FROM employees;"
            />
          </div>

          {/* ERROR */}
          {error && (
            <div className="sql-fail" style={{ marginTop: 14 }}>
              {error}
              <div style={{ fontSize: '0.75rem', marginTop: 6, fontWeight: 500 }}>
                💡 Hint: semicolon (;) lagao, correct column names check karo, ya sample query try karo.
              </div>
            </div>
          )}

          {/* RESULTS */}
          {results !== null && (
            <div className="pg-results">
              <div className="pg-results-head">
                <span>
                  <i className="fas fa-table" /> Results
                  {time !== null && <span className="pg-time">⏱ {time} ms</span>}
                </span>
                {results.length === 0 && <span className="pg-ok">✅ Query success — koi rows nahi (INSERT/UPDATE/CREATE ho sakta hai)</span>}
              </div>
              {results.map((r, ri) => (
                <div key={ri} className="pg-table-wrap">
                  {results.length > 1 && <div className="pg-table-tab">Result {ri + 1} · {r.columns.length} cols · {r.values.length} rows</div>}
                  <table className="pg-table">
                    <thead>
                      <tr>
                        {r.columns.map((c) => <th key={c}>{c}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {r.values.slice(0, 100).map((row, i) => (
                        <tr key={i}>
                          {row.map((cell, j) => <td key={j}>{cell === null ? <span className="pg-null">NULL</span> : String(cell)}</td>)}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {r.values.length > 100 && (
                    <div className="pg-more">… aur {r.values.length - 100} rows (max 100 dikhaye)</div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* SCHEMA HELP */}
          {!error && results === null && (
            <div className="pg-schema">
              <div className="pg-schema-title"><i className="fas fa-database" /> Sample Tables</div>
              <div className="pg-schema-cols">
                <div className="pg-schema-card">
                  <b>employees</b>
                  <code>id, name, department, salary, hire_date, city</code>
                </div>
                <div className="pg-schema-card">
                  <b>departments</b>
                  <code>id, dept_name, location</code>
                </div>
                <div className="pg-schema-card">
                  <b>sales</b>
                  <code>id, product, category, amount, region, sale_date</code>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

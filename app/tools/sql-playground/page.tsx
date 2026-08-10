'use client';

import { useEffect, useRef, useState } from 'react';

// ============================================================
// SQL PLAYGROUND PRO v3 — ADVANCED LEVEL
// - 7 sample tables (employees, departments, sales, products,
//   customers, orders, student_scores)
// - 20 sample queries (JOIN, WINDOW, CTE, SUBQUERY, STRING,
//   DATE, CASE, AGGREGATE)
// - SQL Function Reference (formulas!) - click karke insert
// - Table Browser - click karke SELECT * run
// - Query History (localStorage)
// - Export Results as CSV
// - VS Code-style editor + multi-color highlighting
// - Ctrl+Enter run, Tab indent
// ============================================================

const ENGINE_SOURCES = [
  'https://cdn.jsdelivr.net/npm/sql.js@1.8.0/dist/',
  'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/',
];

// ---------- 7 TABLES + DATA ----------
const SETUP = [
  // 1. departments
  "CREATE TABLE IF NOT EXISTS departments (id INTEGER PRIMARY KEY, dept_name TEXT, location TEXT, budget REAL);",
  "INSERT INTO departments VALUES (1,'Sales','Mumbai',500000),(2,'Engineering','Bangalore',1200000),(3,'HR','Delhi',200000),(4,'Marketing','Pune',300000),(5,'Finance','Mumbai',800000);",

  // 2. employees (15 rows)
  "CREATE TABLE IF NOT EXISTS employees (id INTEGER PRIMARY KEY, name TEXT, department TEXT, salary REAL, hire_date TEXT, city TEXT, age INTEGER, rating REAL);",
  "INSERT INTO employees VALUES (1,'Amit Sharma','Sales',65000,'2021-03-15','Mumbai',28,4.5),(2,'Priya Patel','Engineering',82000,'2020-06-01','Bangalore',30,4.8),(3,'Rahul Verma','Sales',72000,'2022-01-10','Delhi',32,4.2),(4,'Sneha Iyer','Marketing',58000,'2021-09-20','Pune',26,3.9),(5,'Vikram Singh','Engineering',95000,'2019-04-11','Bangalore',35,4.9),(6,'Anjali Gupta','HR',54000,'2023-02-14','Delhi',27,4.0),(7,'Rohit Kumar','Sales',61000,'2020-11-30','Mumbai',29,3.7),(8,'Kavita Nair','Marketing',56000,'2022-07-05','Pune',31,4.1),(9,'Arjun Mehta','Engineering',78000,'2021-12-01','Bangalore',33,4.4),(10,'Pooja Joshi','HR',52000,'2023-08-19','Delhi',25,3.6),(11,'Sanjay Rao','Finance',88000,'2018-05-21','Mumbai',38,4.7),(12,'Neha Kapoor','Finance',67000,'2020-09-14','Mumbai',29,4.3),(13,'Ravi Kumar','Engineering',105000,'2017-03-30','Bangalore',40,5.0),(14,'Meera Pillai','Sales',59000,'2022-11-08','Chennai',27,3.8),(15,'Deepak Chawla','Marketing',62000,'2019-08-25','Delhi',34,4.2);",

  // 3. sales (15 rows)
  "CREATE TABLE IF NOT EXISTS sales (id INTEGER PRIMARY KEY, product TEXT, category TEXT, amount REAL, region TEXT, sale_date TEXT, quantity INTEGER);",
  "INSERT INTO sales VALUES (1,'Laptop','Electronics',75000,'North','2025-01-10',1),(2,'Phone','Electronics',45000,'South','2025-01-12',2),(3,'Chair','Furniture',12000,'North','2025-01-15',4),(4,'Table','Furniture',25000,'East','2025-02-01',2),(5,'Monitor','Electronics',18000,'West','2025-02-03',3),(6,'Desk','Furniture',32000,'South','2025-02-10',1),(7,'Keyboard','Electronics',5000,'North','2025-02-12',5),(8,'Mouse','Electronics',1500,'East','2025-02-15',10),(9,'Bookshelf','Furniture',22000,'West','2025-03-01',2),(10,'Printer','Electronics',28000,'South','2025-03-05',1),(11,'Laptop','Electronics',78000,'West','2025-03-12',1),(12,'Phone','Electronics',46000,'North','2025-03-18',2),(13,'Chair','Furniture',13000,'South','2025-04-02',3),(14,'Monitor','Electronics',19000,'East','2025-04-08',2),(15,'Desk','Furniture',33000,'North','2025-04-15',1);",

  // 4. products
  "CREATE TABLE IF NOT EXISTS products (id INTEGER PRIMARY KEY, name TEXT, category TEXT, price REAL, stock INTEGER);",
  "INSERT INTO products VALUES (1,'Laptop Pro','Electronics',78000,25),(2,'Smartphone X','Electronics',46000,60),(3,'Office Chair','Furniture',13000,40),(4,'Standing Desk','Furniture',33000,15),(5,'4K Monitor','Electronics',19000,35),(6,'Mechanical Keyboard','Electronics',5000,80),(7,'Wireless Mouse','Electronics',1500,120),(8,'Bookshelf','Furniture',22000,20);",

  // 5. customers
  "CREATE TABLE IF NOT EXISTS customers (id INTEGER PRIMARY KEY, name TEXT, city TEXT, join_date TEXT, tier TEXT);",
  "INSERT INTO customers VALUES (1,'Rajesh Kumar','Mumbai','2020-01-15','Gold'),(2,'Sunita Rao','Delhi','2021-03-22','Silver'),(3,'Amit Verma','Bangalore','2019-07-10','Gold'),(4,'Farah Khan','Pune','2022-05-30','Bronze'),(5,'Karan Singh','Chennai','2020-11-05','Silver'),(6,'Divya Menon','Mumbai','2023-02-14','Bronze'),(7,'Rohit Jain','Delhi','2021-09-18','Gold');",

  // 6. orders
  "CREATE TABLE IF NOT EXISTS orders (id INTEGER PRIMARY KEY, customer_id INTEGER, product_id INTEGER, quantity INTEGER, order_date TEXT, status TEXT);",
  "INSERT INTO orders VALUES (1,1,1,1,'2025-01-10','Delivered'),(2,2,2,2,'2025-01-12','Delivered'),(3,3,3,4,'2025-01-15','Shipped'),(4,4,4,2,'2025-02-01','Delivered'),(5,5,5,3,'2025-02-03','Pending'),(6,6,6,5,'2025-02-10','Delivered'),(7,7,7,10,'2025-02-12','Shipped'),(8,1,8,2,'2025-02-15','Delivered'),(9,2,1,1,'2025-03-01','Cancelled'),(10,3,2,2,'2025-03-05','Delivered');",

  // 7. student_scores
  "CREATE TABLE IF NOT EXISTS student_scores (id INTEGER PRIMARY KEY, name TEXT, subject TEXT, score INTEGER);",
  "INSERT INTO student_scores VALUES (1,'Aarav','Math',85),(2,'Aarav','Science',78),(3,'Aarav','English',92),(4,'Diya','Math',95),(5,'Diya','Science',88),(6,'Diya','English',90),(7,'Kabir','Math',72),(8,'Kabir','Science',85),(9,'Kabir','English',76),(10,'Isha','Math',88),(11,'Isha','Science',94),(12,'Isha','English',81);",
];

// ---------- 20 SAMPLE QUERIES ----------
const SAMPLES = [
  { label: '📊 All employees', sql: 'SELECT * FROM employees LIMIT 10;' },
  { label: '💰 Avg salary by dept', sql: 'SELECT department, ROUND(AVG(salary),0) AS avg_salary, COUNT(*) AS emp_count FROM employees GROUP BY department ORDER BY avg_salary DESC;' },
  { label: '🔗 INNER JOIN', sql: 'SELECT o.id AS order_id, c.name AS customer, p.name AS product, o.quantity FROM orders o INNER JOIN customers c ON o.customer_id = c.id INNER JOIN products p ON o.product_id = p.id LIMIT 10;' },
  { label: '🏆 Window RANK', sql: 'SELECT name, department, salary, RANK() OVER (PARTITION BY department ORDER BY salary DESC) AS dept_rank FROM employees ORDER BY department, dept_rank;' },
  { label: '🏢 2nd highest salary', sql: 'SELECT name, salary FROM employees WHERE salary = (SELECT MAX(salary) FROM employees WHERE salary < (SELECT MAX(salary) FROM employees));' },
  { label: '📅 Sales by region', sql: 'SELECT region, COUNT(*) AS orders, ROUND(SUM(amount),0) AS total_sales, ROUND(AVG(amount),0) AS avg_order FROM sales GROUP BY region ORDER BY total_sales DESC;' },
  { label: '🔢 Running total (window)', sql: 'SELECT product, amount, sale_date, SUM(amount) OVER (ORDER BY sale_date) AS running_total FROM sales ORDER BY sale_date;' },
  { label: '🧠 CTE + Rank', sql: 'WITH dept_avg AS (SELECT department, AVG(salary) AS avg_sal FROM employees GROUP BY department) SELECT e.name, e.department, e.salary, ROUND(d.avg_sal,0) AS dept_avg FROM employees e JOIN dept_avg d ON e.department = d.department WHERE e.salary > d.avg_sal ORDER BY e.salary DESC;' },
  { label: '🔤 String functions', sql: "SELECT UPPER(name) AS upper_name, LENGTH(name) AS name_len, SUBSTR(city,1,3) AS city_short, CONCAT(name,' - ',city) AS full_label FROM employees LIMIT 8;" },
  { label: '📆 Date functions', sql: "SELECT name, hire_date, CAST(strftime('%Y','now') AS INTEGER) - CAST(strftime('%Y',hire_date) AS INTEGER) AS years_at_company FROM employees ORDER BY years_at_company DESC;" },
  { label: '🔀 CASE WHEN', sql: 'SELECT name, salary, CASE WHEN salary >= 90000 THEN \'High\' WHEN salary >= 65000 THEN \'Medium\' ELSE \'Low\' END AS salary_band FROM employees ORDER BY salary DESC;' },
  { label: '🎓 Student avg (pivot-like)', sql: 'SELECT name, ROUND(AVG(score),1) AS avg_score, MAX(score) AS best, MIN(score) AS worst, COUNT(*) AS subjects FROM student_scores GROUP BY name ORDER BY avg_score DESC;' },
  { label: '💸 Top customers (JOIN+GROUP)', sql: 'SELECT c.name, c.tier, COUNT(o.id) AS orders, ROUND(SUM(o.quantity * p.price),0) AS total_spent FROM customers c JOIN orders o ON c.id = o.customer_id JOIN products p ON o.product_id = p.id WHERE o.status = \'Delivered\' GROUP BY c.id ORDER BY total_spent DESC;' },
  { label: '🏷️ Products low stock', sql: 'SELECT name, category, price, stock FROM products WHERE stock < 30 ORDER BY stock ASC;' },
  { label: '📈 Monthly sales trend', sql: "SELECT SUBSTR(sale_date,1,7) AS month, COUNT(*) AS orders, ROUND(SUM(amount),0) AS revenue FROM sales GROUP BY month ORDER BY month;" },
  { label: '🔗 LEFT JOIN (all customers)', sql: 'SELECT c.name, c.tier, COUNT(o.id) AS order_count FROM customers c LEFT JOIN orders o ON c.id = o.customer_id GROUP BY c.id ORDER BY order_count DESC;' },
  { label: '🧮 HAVING filter', sql: 'SELECT department, COUNT(*) AS emp_count, ROUND(AVG(salary),0) AS avg_salary FROM employees GROUP BY department HAVING COUNT(*) >= 2 ORDER BY avg_salary DESC;' },
  { label: '⭐ Top rated employees', sql: 'SELECT name, department, salary, rating FROM employees WHERE rating >= 4.5 ORDER BY rating DESC;' },
  { label: '🔄 UNION (all names)', sql: "SELECT name FROM employees UNION SELECT name FROM customers ORDER BY name;" },
  { label: '🎯 Sales vs quantity', sql: 'SELECT category, COUNT(*) AS sales_count, SUM(quantity) AS units_sold, ROUND(AVG(amount/quantity),2) AS avg_unit_price FROM sales GROUP BY category;' },
];

// ---------- SQL FUNCTION REFERENCE (formulas!) ----------
const FUNCTIONS = [
  { cat: 'Aggregate', items: [
    { name: 'COUNT(*)', desc: 'Rows count', sql: 'SELECT COUNT(*) AS total FROM employees;' },
    { name: 'SUM(col)', desc: 'Total sum', sql: 'SELECT SUM(salary) AS total_salary FROM employees;' },
    { name: 'AVG(col)', desc: 'Average', sql: 'SELECT AVG(salary) AS avg_salary FROM employees;' },
    { name: 'MIN/MAX', desc: 'Min & Max', sql: 'SELECT MIN(salary) AS min_sal, MAX(salary) AS max_sal FROM employees;' },
    { name: 'ROUND(col,n)', desc: 'Round value', sql: 'SELECT name, ROUND(salary/12,0) AS monthly FROM employees LIMIT 5;' },
  ]},
  { cat: 'String', items: [
    { name: 'UPPER/LOWER', desc: 'Case change', sql: "SELECT UPPER(name) AS up, LOWER(city) AS lo FROM employees LIMIT 5;" },
    { name: 'LENGTH(col)', desc: 'Char count', sql: 'SELECT name, LENGTH(name) AS len FROM employees LIMIT 5;' },
    { name: 'SUBSTR(col,a,b)', desc: 'Part of text', sql: "SELECT name, SUBSTR(name,1,4) AS first4 FROM employees LIMIT 5;" },
    { name: 'CONCAT(a,b)', desc: 'Join text', sql: "SELECT CONCAT(name,' | ',city) AS label FROM employees LIMIT 5;" },
    { name: 'REPLACE(col,a,b)', desc: 'Replace text', sql: "SELECT REPLACE(city,'Mumbai','BOM') AS city_code FROM employees LIMIT 5;" },
  ]},
  { cat: 'Date', items: [
    { name: "strftime(%Y,col)", desc: "Year from date", sql: "SELECT hire_date, CAST(strftime('%Y',hire_date) AS INTEGER) AS yr FROM employees LIMIT 5;" },
    { name: 'Year diff (tenure)', desc: 'Years at company', sql: "SELECT name, CAST(strftime('%Y','now') AS INTEGER) - CAST(strftime('%Y',hire_date) AS INTEGER) AS tenure FROM employees LIMIT 5;" },
    { name: 'Month from date', desc: 'Month number', sql: "SELECT sale_date, CAST(strftime('%m',sale_date) AS INTEGER) AS month_no FROM sales LIMIT 5;" },
  ]},
  { cat: 'Logic', items: [
    { name: 'CASE WHEN', desc: 'If-else logic', sql: 'SELECT name, salary, CASE WHEN salary > 70000 THEN \'High\' ELSE \'Normal\' END AS band FROM employees LIMIT 8;' },
    { name: 'COALESCE(col,d)', desc: 'Null fallback', sql: "SELECT COALESCE(NULL, 'fallback') AS demo;" },
    { name: 'IN (list)', desc: 'Multi match', sql: "SELECT name, department FROM employees WHERE department IN ('Sales','HR');" },
    { name: 'BETWEEN', desc: 'Range filter', sql: 'SELECT name, salary FROM employees WHERE salary BETWEEN 50000 AND 70000;' },
  ]},
  { cat: 'Window', items: [
    { name: 'ROW_NUMBER()', desc: 'Row numbering', sql: 'SELECT name, salary, ROW_NUMBER() OVER (ORDER BY salary DESC) AS rn FROM employees;' },
    { name: 'RANK() / DENSE_RANK()', desc: 'Ranking', sql: 'SELECT name, salary, RANK() OVER (ORDER BY salary DESC) AS rnk, DENSE_RANK() OVER (ORDER BY salary DESC) AS drnk FROM employees;' },
    { name: 'SUM() OVER (ORDER BY)', desc: 'Running total', sql: 'SELECT sale_date, amount, SUM(amount) OVER (ORDER BY sale_date) AS running FROM sales;' },
    { name: 'LAG()', desc: 'Previous row', sql: 'SELECT sale_date, amount, LAG(amount,1) OVER (ORDER BY sale_date) AS prev_amount FROM sales LIMIT 8;' },
  ]},
];

// ---------- HIGHLIGHTER ----------
const KW = 'SELECT|FROM|WHERE|GROUP|BY|ORDER|HAVING|JOIN|INNER|LEFT|RIGHT|FULL|OUTER|CROSS|ON|AND|OR|NOT|NULL|IS|AS|DISTINCT|LIMIT|OFFSET|INSERT|INTO|VALUES|UPDATE|SET|DELETE|CREATE|TABLE|ALTER|DROP|INDEX|IF|EXISTS|PRIMARY|KEY|FOREIGN|REFERENCES|CONSTRAINT|DEFAULT|CHECK|UNIQUE|CASE|WHEN|THEN|ELSE|END|LIKE|IN|BETWEEN|UNION|ALL|ASC|DESC|WITH|RECURSIVE|RANK|DENSE_RANK|ROW_NUMBER|OVER|PARTITION|LAG|LEAD|FIRST_VALUE|LAST_VALUE|NTILE|EXISTS|EXPLAIN|ANALYZE|COLLATE|CAST|USING|NATURAL|COUNT|SUM|AVG|MIN|MAX|ROUND|COALESCE|NULLIF|CONCAT|SUBSTR|LENGTH|UPPER|LOWER|TRIM|REPLACE|YEAR|MONTH|DAY|NOW|CURRENT_DATE|CURRENT_TIMESTAMP|strftime';

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

// ---------- TABLE BROWSER ----------
const TABLES = [
  { name: 'employees', desc: '15 employees - salary, dept, city' },
  { name: 'departments', desc: '5 departments - budget' },
  { name: 'sales', desc: '15 sales - product, amount, region' },
  { name: 'products', desc: '8 products - price, stock' },
  { name: 'customers', desc: '7 customers - tier, city' },
  { name: 'orders', desc: '10 orders - joins products+customers' },
  { name: 'student_scores', desc: '12 scores - 4 students, 3 subjects' },
];

export default function SqlPlayground() {
  const [sql, setSql] = useState('SELECT * FROM employees LIMIT 10;');
  const [loading, setLoading] = useState(true);
  const [db, setDb] = useState<any>(null);
  const [results, setResults] = useState<Result[] | null>(null);
  const [error, setError] = useState('');
  const [time, setTime] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [engineSrc, setEngineSrc] = useState('');
  const [activeTab, setActiveTab] = useState<'samples' | 'functions' | 'tables'>('samples');
  const [history, setHistory] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [expandedFn, setExpandedFn] = useState<string | null>(null);
  const hlRef = useRef<HTMLPreElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);

  // history load
  useEffect(() => {
    try {
      const h = JSON.parse(localStorage.getItem('di_sql_history') || '[]');
      if (Array.isArray(h)) setHistory(h.slice(0, 10));
    } catch {}
  }, []);

  // Try in Playground draft
  useEffect(() => {
    try {
      const draft = localStorage.getItem('di_sql_draft');
      if (draft) { setSql(draft); localStorage.removeItem('di_sql_draft'); }
    } catch {}
  }, []);

  // script loader
  const loadScript = (src: string): Promise<any> =>
    new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = src;
      s.onload = () => { (window as any).initSqlJs ? resolve((window as any).initSqlJs) : resolve(null); };
      s.onerror = () => reject(new Error('Script load fail: ' + src));
      document.head.appendChild(s);
    });

  const loadEngine = async () => {
    setLoading(true);
    setError('');
    for (const base of ENGINE_SOURCES) {
      try {
        const initSqlJs = await loadScript(base + 'sql-wasm.js');
        const SQL = await initSqlJs({ locateFile: (f: string) => base + f });
        const database = new SQL.Database();
        SETUP.forEach((q) => database.run(q));
        setDb(database);
        setEngineSrc(base.includes('jsdelivr') ? 'jsdelivr' : 'cdnjs');
        setLoading(false);
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
    setError('SQL engine load fail — internet check karo ya Retry dabao.');
    setLoading(false);
  };

  useEffect(() => {
    let mounted = true;
    (async () => { await loadEngine(); if (!mounted) return; })();
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
      // history save
      try {
        const h = JSON.parse(localStorage.getItem('di_sql_history') || '[]');
        const next = [query, ...h.filter((x: string) => x !== query)].slice(0, 10);
        localStorage.setItem('di_sql_history', JSON.stringify(next));
        setHistory(next);
      } catch {}
    } catch (e: any) {
      setResults(null);
      setTime(null);
      setError('❌ ' + (e?.message || 'Query error'));
    }
  };

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

  const exportCsv = () => {
    if (!results || results.length === 0) return;
    try {
      const rows = results[0];
      const csv = [
        rows.columns.join(','),
        ...rows.values.slice(0, 500).map((r) => r.map((c) => `"${String(c ?? '').replace(/"/g, '""')}"`).join(',')),
      ].join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'sql-results.csv';
      a.click();
      URL.revokeObjectURL(a.href);
    } catch {}
  };

  const resetDb = () => { if (db) loadEngine(); };

  const useSample = (s: string) => {
    setSql(s);
    setResults(null);
    setError('');
    setActiveTab('samples');
  };

  const browseTable = (t: string) => {
    const q = `SELECT * FROM ${t} LIMIT 10;`;
    setSql(q);
    setResults(null);
    setError('');
    setTimeout(() => runQuery(q), 50);
  };

  const fnSearch = (func: string, sqlText: string) => {
    setSql(sqlText);
    setResults(null);
    setError('');
    setExpandedFn(expandedFn === func ? null : func);
  };

  return (
    <div className="layout-wrapper">
      <main className="posts-section">
        <div className="post-content-wrapper" style={{ padding: 26 }}>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: 6 }}>🧠 SQL Playground Pro</h1>
          <p style={{ color: 'var(--text-light)', fontSize: '0.88rem', marginBottom: 16, lineHeight: 1.6 }}>
            7 sample tables · 20 sample queries · Function Reference · Table Browser · Query History · CSV Export.
            <b> Ctrl+Enter</b> = Run · <b>Tab</b> = Indent. Data 100% browser mein. 🔒
          </p>

          {/* TOOLBAR */}
          <div className="pg-toolbar">
            <button className="pg-btn run" onClick={() => runQuery(sql)} disabled={loading}>
              <i className="fas fa-play" /> Run
            </button>
            <button className="pg-btn" onClick={() => setSql('')}>🗑️ Clear</button>
            <button className="pg-btn" onClick={copySql}>{copied ? '✅ Copied!' : '📋 Copy'}</button>
            <button className="pg-btn" onClick={resetDb}>🔄 Reset</button>
            {results && results.length > 0 && (
              <button className="pg-btn" onClick={exportCsv}>📥 Export CSV</button>
            )}
            <button className="pg-btn" onClick={() => setShowHistory(!showHistory)}>
              🕘 History {history.length > 0 ? `(${history.length})` : ''}
            </button>
            {loading && <span className="pg-status">⏳ Engine load...</span>}
            {!loading && engineSrc && <span className="pg-status">✅ Engine ready ({engineSrc})</span>}
            {error && !loading && (
              <button className="pg-btn" onClick={() => { setError(''); loadEngine(); }}>🔄 Retry Engine</button>
            )}
          </div>

          {/* HISTORY */}
          {showHistory && history.length > 0 && (
            <div className="pg-history">
              {history.map((h, i) => (
                <button key={i} className="pg-history-item" onClick={() => { setSql(h); setShowHistory(false); }}>
                  <i className="fas fa-clock-rotate-left" /> {h.length > 70 ? h.slice(0, 70) + '…' : h}
                </button>
              ))}
            </div>
          )}

          {/* TABS */}
          <div className="pg-tabs">
            <button className={`pg-tab${activeTab === 'samples' ? ' active' : ''}`} onClick={() => setActiveTab('samples')}>
              💡 Sample Queries ({SAMPLES.length})
            </button>
            <button className={`pg-tab${activeTab === 'functions' ? ' active' : ''}`} onClick={() => setActiveTab('functions')}>
              🧮 Function Reference
            </button>
            <button className={`pg-tab${activeTab === 'tables' ? ' active' : ''}`} onClick={() => setActiveTab('tables')}>
              🗄️ Tables ({TABLES.length})
            </button>
          </div>

          {/* SAMPLES */}
          {activeTab === 'samples' && (
            <div className="pg-samples">
              {SAMPLES.map((s) => (
                <button key={s.label} className="pg-sample-chip" onClick={() => useSample(s.sql)}>
                  {s.label}
                </button>
              ))}
            </div>
          )}

          {/* FUNCTIONS (formulas!) */}
          {activeTab === 'functions' && (
            <div className="pg-fn">
              {FUNCTIONS.map((cat) => (
                <div key={cat.cat} className="pg-fn-cat">
                  <div className="pg-fn-cat-title">{cat.cat}</div>
                  <div className="pg-fn-grid">
                    {cat.items.map((f) => (
                      <div key={f.name} className="pg-fn-item">
                        <button
                          className="pg-fn-name"
                          onClick={() => fnSearch(f.name, f.sql)}
                          title="Click = run example"
                        >
                          {f.name}
                        </button>
                        <span className="pg-fn-desc">{f.desc}</span>
                        {expandedFn === f.name && (
                          <pre className="pg-fn-sql"><code>{f.sql}</code></pre>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TABLES */}
          {activeTab === 'tables' && (
            <div className="pg-table-browser">
              {TABLES.map((t) => (
                <div key={t.name} className="pg-table-item">
                  <button className="pg-table-name" onClick={() => browseTable(t.name)}>
                    🗄️ {t.name}
                  </button>
                  <span className="pg-table-desc">{t.desc}</span>
                </div>
              ))}
              <div className="pg-table-hint">👆 Table name pe click karo — SELECT * turant run hoga.</div>
            </div>
          )}

          {/* EDITOR */}
          <div className="sql-editor-wrap pg-editor" style={{ marginTop: 12 }}>
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
                  {results.length > 0 && results[0].values.length > 0 && (
                    <span className="pg-time"> · {results[0].values.length} rows</span>
                  )}
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
                      {r.values.slice(0, 200).map((row, i) => (
                        <tr key={i}>
                          {row.map((cell, j) => <td key={j}>{cell === null ? <span className="pg-null">NULL</span> : String(cell)}</td>)}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {r.values.length > 200 && (
                    <div className="pg-more">… aur {r.values.length - 200} rows (max 200 dikhaye — Export CSV se sab lo)</div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* SCHEMA HELP (jab results nahi) */}
          {!error && results === null && (
            <div className="pg-schema">
              <div className="pg-schema-title"><i className="fas fa-database" /> Sample Tables (7)</div>
              <div className="pg-schema-cols">
                <div className="pg-schema-card">
                  <b>employees</b>
                  <code>id, name, department, salary, hire_date, city, age, rating</code>
                </div>
                <div className="pg-schema-card">
                  <b>departments</b>
                  <code>id, dept_name, location, budget</code>
                </div>
                <div className="pg-schema-card">
                  <b>sales</b>
                  <code>id, product, category, amount, region, sale_date, quantity</code>
                </div>
                <div className="pg-schema-card">
                  <b>products</b>
                  <code>id, name, category, price, stock</code>
                </div>
                <div className="pg-schema-card">
                  <b>customers</b>
                  <code>id, name, city, join_date, tier</code>
                </div>
                <div className="pg-schema-card">
                  <b>orders</b>
                  <code>id, customer_id, product_id, quantity, order_date, status</code>
                </div>
                <div className="pg-schema-card">
                  <b>student_scores</b>
                  <code>id, name, subject, score</code>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

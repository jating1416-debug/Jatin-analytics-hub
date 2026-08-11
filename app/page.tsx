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
  // 1. departments - 9 columns
  "CREATE TABLE IF NOT EXISTS departments (id INTEGER PRIMARY KEY, dept_name TEXT, location TEXT, budget REAL, head_name TEXT, founded_year INTEGER, employee_count INTEGER, avg_salary REAL, rating REAL);",
  "INSERT INTO departments VALUES (1,'Sales','Mumbai',500000,'Rajesh Malhotra',2012,45,62000,4.5),(2,'Engineering','Bangalore',1200000,'Anita Desai',2010,120,88000,4.8),(3,'HR','Delhi',200000,'Suresh Gupta',2015,15,54000,4.0),(4,'Marketing','Pune',300000,'Neha Singh',2016,25,58000,4.2),(5,'Finance','Mumbai',800000,'Vikram Joshi',2011,30,75000,4.6);",

  // 2. employees - 12 columns (id, name, department, salary, hire_date, city, age, rating, email, gender, experience_years, bonus)
  "CREATE TABLE IF NOT EXISTS employees (id INTEGER PRIMARY KEY, name TEXT, department TEXT, salary REAL, hire_date TEXT, city TEXT, age INTEGER, rating REAL, email TEXT, gender TEXT, experience_years INTEGER, bonus REAL);",
  "INSERT INTO employees VALUES (1,'Amit Sharma','Sales',65000,'2021-03-15','Mumbai',28,4.5,'amit.sharma@gmail.com','M',4,12000),(2,'Priya Patel','Engineering',82000,'2020-06-01','Bangalore',30,4.8,'priya.patel@gmail.com','F',5,20000),(3,'Rahul Verma','Sales',72000,'2022-01-10','Delhi',32,4.2,'rahul.verma@gmail.com','M',3,9000),(4,'Sneha Iyer','Marketing',58000,'2021-09-20','Pune',26,3.9,'sneha.iyer@gmail.com','F',4,7000),(5,'Vikram Singh','Engineering',95000,'2019-04-11','Bangalore',35,4.9,'vikram.singh@gmail.com','M',6,25000),(6,'Anjali Gupta','HR',54000,'2023-02-14','Delhi',27,4.0,'anjali.gupta@gmail.com','F',2,5000),(7,'Rohit Kumar','Sales',61000,'2020-11-30','Mumbai',29,3.7,'rohit.kumar@gmail.com','M',4,8000),(8,'Kavita Nair','Marketing',56000,'2022-07-05','Pune',31,4.1,'kavita.nair@gmail.com','F',3,6000),(9,'Arjun Mehta','Engineering',78000,'2021-12-01','Bangalore',33,4.4,'arjun.mehta@gmail.com','M',4,15000),(10,'Pooja Joshi','HR',52000,'2023-08-19','Delhi',25,3.6,'pooja.joshi@gmail.com','F',2,4000),(11,'Sanjay Rao','Finance',88000,'2018-05-21','Mumbai',38,4.7,'sanjay.rao@gmail.com','M',7,22000),(12,'Neha Kapoor','Finance',67000,'2020-09-14','Mumbai',29,4.3,'neha.kapoor@gmail.com','F',5,14000),(13,'Ravi Kumar','Engineering',105000,'2017-03-30','Bangalore',40,5.0,'ravi.kumar@gmail.com','M',8,30000),(14,'Meera Pillai','Sales',59000,'2022-11-08','Chennai',27,3.8,'meera.pillai@gmail.com','F',3,7000),(15,'Deepak Chawla','Marketing',62000,'2019-08-25','Delhi',34,4.2,'deepak.chawla@gmail.com','M',6,10000),(16,'Farhan Ali','Finance',72000,'2021-01-19','Mumbai',31,4.4,'farhan.ali@gmail.com','M',4,13000),(17,'Ishita Bose','Engineering',86000,'2020-03-11','Kolkata',29,4.6,'ishita.bose@gmail.com','F',5,18000),(18,'Karan Mehta','Sales',68000,'2022-06-27','Delhi',30,4.1,'karan.mehta@gmail.com','M',3,9500);",

  // 3. sales - 10 columns (id, product, category, amount, region, sale_date, quantity, discount, profit, payment_method)
  "CREATE TABLE IF NOT EXISTS sales (id INTEGER PRIMARY KEY, product TEXT, category TEXT, amount REAL, region TEXT, sale_date TEXT, quantity INTEGER, discount REAL, profit REAL, payment_method TEXT);",
  "INSERT INTO sales VALUES (1,'Laptop','Electronics',75000,'North','2025-01-10',1,5,15000,'UPI'),(2,'Phone','Electronics',45000,'South','2025-01-12',2,10,9000,'Card'),(3,'Chair','Furniture',12000,'North','2025-01-15',4,0,3600,'Cash'),(4,'Table','Furniture',25000,'East','2025-02-01',2,8,5000,'UPI'),(5,'Monitor','Electronics',18000,'West','2025-02-03',3,15,3600,'Card'),(6,'Desk','Furniture',32000,'South','2025-02-10',1,5,8000,'Card'),(7,'Keyboard','Electronics',5000,'North','2025-02-12',5,10,1500,'UPI'),(8,'Mouse','Electronics',1500,'East','2025-02-15',10,0,600,'Cash'),(9,'Bookshelf','Furniture',22000,'West','2025-03-01',2,10,5500,'UPI'),(10,'Printer','Electronics',28000,'South','2025-03-05',1,5,7000,'Card'),(11,'Laptop','Electronics',78000,'West','2025-03-12',1,8,16000,'Card'),(12,'Phone','Electronics',46000,'North','2025-03-18',2,12,9200,'UPI'),(13,'Chair','Furniture',13000,'South','2025-04-02',3,5,3900,'Cash'),(14,'Monitor','Electronics',19000,'East','2025-04-08',2,10,3800,'UPI'),(15,'Desk','Furniture',33000,'North','2025-04-15',1,0,8250,'Card'),(16,'Keyboard','Electronics',5200,'West','2025-04-22',4,8,1560,'UPI'),(17,'Phone','Electronics',47000,'East','2025-05-05',1,5,9400,'Card'),(18,'Table','Furniture',26000,'North','2025-05-18',1,10,5200,'Cash');",

  // 4. products - 9 columns (id, name, category, price, stock, brand, rating, weight_kg, supplier)
  "CREATE TABLE IF NOT EXISTS products (id INTEGER PRIMARY KEY, name TEXT, category TEXT, price REAL, stock INTEGER, brand TEXT, rating REAL, weight_kg REAL, supplier TEXT);",
  "INSERT INTO products VALUES (1,'Laptop Pro','Electronics',78000,25,'Dell',4.6,1.8,'TechDist'),(2,'Smartphone X','Electronics',46000,60,'Samsung',4.4,0.2,'MobileHub'),(3,'Office Chair','Furniture',13000,40,'UrbanSeat',4.2,8.5,'FurniWorld'),(4,'Standing Desk','Furniture',33000,15,'WorkWell',4.5,22,'FurniWorld'),(5,'4K Monitor','Electronics',19000,35,'LG',4.7,5.2,'TechDist'),(6,'Mechanical Keyboard','Electronics',5000,80,'Logitech',4.5,0.9,'MobileHub'),(7,'Wireless Mouse','Electronics',1500,120,'Logitech',4.3,0.1,'MobileHub'),(8,'Bookshelf','Furniture',22000,20,'WoodCraft',4.1,30,'FurniWorld'),(9,'Smartwatch','Electronics',22000,45,'Apple',4.8,0.05,'MobileHub'),(10,'Gaming Laptop','Electronics',110000,12,'Asus',4.7,2.4,'TechDist'),(11,'Conference Table','Furniture',45000,8,'WorkWell',4.4,45,'FurniWorld'),(12,'Printer','Electronics',28000,18,'HP',4.2,7.5,'TechDist');",

  // 5. customers - 9 columns (id, name, city, join_date, tier, email, phone, age, gender)
  "CREATE TABLE IF NOT EXISTS customers (id INTEGER PRIMARY KEY, name TEXT, city TEXT, join_date TEXT, tier TEXT, email TEXT, phone TEXT, age INTEGER, gender TEXT);",
  "INSERT INTO customers VALUES (1,'Rajesh Kumar','Mumbai','2020-01-15','Gold','rajesh.k@gmail.com','9820012345',35,'M'),(2,'Sunita Rao','Delhi','2021-03-22','Silver','sunita.rao@gmail.com','9811122233',42,'F'),(3,'Amit Verma','Bangalore','2019-07-10','Gold','amit.v@gmail.com','9900112233',38,'M'),(4,'Farah Khan','Pune','2022-05-30','Bronze','farah.k@gmail.com','9765432100',29,'F'),(5,'Karan Singh','Chennai','2020-11-05','Silver','karan.s@gmail.com','9888776655',45,'M'),(6,'Divya Menon','Mumbai','2023-02-14','Bronze','divya.m@gmail.com','9966778899',26,'F'),(7,'Rohit Jain','Delhi','2021-09-18','Gold','rohit.j@gmail.com','9800012345',33,'M'),(8,'Sneha Reddy','Hyderabad','2022-08-12','Silver','sneha.r@gmail.com','9745566778',31,'F'),(9,'Arun Nair','Kochi','2023-06-20','Bronze','arun.n@gmail.com','9622334455',27,'M'),(10,'Pooja Shah','Ahmedabad','2020-04-05','Gold','pooja.s@gmail.com','9955443322',36,'F');",

  // 6. orders - 9 columns (id, customer_id, product_id, quantity, order_date, status, total_price, discount, payment_method)
  "CREATE TABLE IF NOT EXISTS orders (id INTEGER PRIMARY KEY, customer_id INTEGER, product_id INTEGER, quantity INTEGER, order_date TEXT, status TEXT, total_price REAL, discount REAL, payment_method TEXT);",
  "INSERT INTO orders VALUES (1,1,1,1,'2025-01-10','Delivered',78000,5,'UPI'),(2,2,2,2,'2025-01-12','Delivered',92000,10,'Card'),(3,3,3,4,'2025-01-15','Shipped',52000,0,'Cash'),(4,4,4,2,'2025-02-01','Delivered',66000,8,'UPI'),(5,5,5,3,'2025-02-03','Pending',57000,15,'Card'),(6,6,6,5,'2025-02-10','Delivered',25000,10,'Card'),(7,7,7,10,'2025-02-12','Shipped',15000,0,'UPI'),(8,1,8,2,'2025-02-15','Delivered',44000,10,'UPI'),(9,2,1,1,'2025-03-01','Cancelled',78000,5,'Card'),(10,3,2,2,'2025-03-05','Delivered',92000,10,'UPI'),(11,4,9,1,'2025-03-12','Delivered',22000,0,'Card'),(12,5,10,1,'2025-03-18','Shipped',110000,8,'Card'),(13,6,3,3,'2025-04-02','Delivered',39000,5,'Cash'),(14,7,5,2,'2025-04-08','Pending',38000,10,'UPI'),(15,8,4,1,'2025-04-15','Delivered',33000,0,'Card'),(16,9,12,1,'2025-04-22','Delivered',28000,5,'UPI'),(17,10,2,1,'2025-05-05','Shipped',46000,5,'Card'),(18,1,3,1,'2025-05-18','Delivered',13000,0,'Cash');",

  // 7. student_scores - 7 columns (id, name, subject, score, class, term, attempts)
  "CREATE TABLE IF NOT EXISTS student_scores (id INTEGER PRIMARY KEY, name TEXT, subject TEXT, score INTEGER, class TEXT, term TEXT, attempts INTEGER);",
  "INSERT INTO student_scores VALUES (1,'Aarav','Math',85,'10A','Term 1',1),(2,'Aarav','Science',78,'10A','Term 1',1),(3,'Aarav','English',92,'10A','Term 1',1),(4,'Diya','Math',95,'10B','Term 1',1),(5,'Diya','Science',88,'10B','Term 1',1),(6,'Diya','English',90,'10B','Term 1',1),(7,'Kabir','Math',72,'10A','Term 1',2),(8,'Kabir','Science',85,'10A','Term 1',1),(9,'Kabir','English',76,'10A','Term 1',1),(10,'Isha','Math',88,'10B','Term 1',1),(11,'Isha','Science',94,'10B','Term 1',1),(12,'Isha','English',81,'10B','Term 1',1),(13,'Aarav','Math',88,'10A','Term 2',1),(14,'Diya','Science',92,'10B','Term 2',1),(15,'Kabir','English',80,'10A','Term 2',2);",
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
  { label: '💵 Profit by region', sql: 'SELECT region, ROUND(SUM(profit),0) AS total_profit, ROUND(AVG(discount),1) AS avg_discount FROM sales GROUP BY region ORDER BY total_profit DESC;' },
  { label: '👥 Employees by gender', sql: 'SELECT gender, COUNT(*) AS emp_count, ROUND(AVG(salary),0) AS avg_salary FROM employees GROUP BY gender;' },
  { label: '📧 Email domain count', sql: "SELECT SUBSTR(email, INSTR(email,'@')+1) AS domain, COUNT(*) AS cnt FROM employees GROUP BY domain ORDER BY cnt DESC;" },
  { label: '⭐ Top rated products', sql: 'SELECT name, brand, price, rating, stock FROM products WHERE rating >= 4.5 ORDER BY rating DESC;' },
  { label: '🏷️ Customer tier analysis', sql: 'SELECT tier, COUNT(*) AS customers, ROUND(AVG(age),0) AS avg_age FROM customers GROUP BY tier ORDER BY customers DESC;' },
  { label: '💳 Payment method split', sql: "SELECT payment_method, COUNT(*) AS orders, ROUND(SUM(total_price),0) AS revenue FROM orders GROUP BY payment_method ORDER BY revenue DESC;" },
  { label: '🎓 Term comparison', sql: "SELECT subject, term, ROUND(AVG(score),1) AS avg_score FROM student_scores GROUP BY subject, term ORDER BY subject, term;" },
  { label: '🏢 Dept by avg salary', sql: 'SELECT d.dept_name, d.location, d.employee_count, d.avg_salary, d.rating FROM departments d ORDER BY d.avg_salary DESC;' },
  { label: '📊 Bonus analysis', sql: 'SELECT department, ROUND(SUM(bonus),0) AS total_bonus, ROUND(AVG(bonus),0) AS avg_bonus FROM employees GROUP BY department ORDER BY total_bonus DESC;' },
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
const SQL_KW = 'SELECT|FROM|WHERE|GROUP|BY|ORDER|HAVING|JOIN|INNER|LEFT|RIGHT|FULL|OUTER|CROSS|ON|AND|OR|NOT|NULL|IS|AS|DISTINCT|LIMIT|OFFSET|INSERT|INTO|VALUES|UPDATE|SET|DELETE|CREATE|TABLE|ALTER|DROP|INDEX|IF|EXISTS|PRIMARY|KEY|FOREIGN|REFERENCES|CONSTRAINT|DEFAULT|CHECK|UNIQUE|CASE|WHEN|THEN|ELSE|END|LIKE|IN|BETWEEN|UNION|ALL|ASC|DESC|WITH|RECURSIVE|OVER|PARTITION|EXPLAIN|ANALYZE|COLLATE|CAST|USING|NATURAL';
const SQL_FN = 'COUNT|SUM|AVG|MIN|MAX|ROUND|COALESCE|NULLIF|CONCAT|SUBSTR|LENGTH|UPPER|LOWER|TRIM|REPLACE|YEAR|MONTH|DAY|NOW|CURRENT_DATE|CURRENT_TIMESTAMP|strftime|RANK|DENSE_RANK|ROW_NUMBER|LAG|LEAD|FIRST_VALUE|LAST_VALUE|NTILE|ABS|CEIL|FLOOR|MOD|POWER|SQRT';

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export function highlightSql(sql: string): string {
  // VS Code Dark+ tokenizer (same as CodeHighlighter) - inline colors
  const tokens: { text: string; cls: string }[] = [];
  let i = 0;
  const n = sql.length;
  while (i < n) {
    const rest = sql.slice(i);
    let m = rest.match(/^--[^\n]*/);
    if (m) { tokens.push({ text: m[0], cls: 'tok-com' }); i += m[0].length; continue; }
    m = rest.match(/^\/\*[\s\S]*?\*\//);
    if (m) { tokens.push({ text: m[0], cls: 'tok-com' }); i += m[0].length; continue; }
    m = rest.match(/^'[^'\n]*'/);
    if (m) { tokens.push({ text: m[0], cls: 'tok-str' }); i += m[0].length; continue; }
    m = rest.match(/^"[^"\n]*"/);
    if (m) { tokens.push({ text: m[0], cls: 'tok-str' }); i += m[0].length; continue; }
    m = rest.match(/^\d+(?:\.\d+)?/);
    if (m) { tokens.push({ text: m[0], cls: 'tok-num' }); i += m[0].length; continue; }
    m = rest.match(/^[A-Za-z_][A-Za-z0-9_]*/);
    if (m) {
      const word = m[0];
      const isFn = new RegExp(`^(?:${SQL_FN})$`, 'i').test(word);
      const isKw = new RegExp(`^(?:${SQL_KW})$`, 'i').test(word);
      let j = i + word.length;
      while (j < n && /\s/.test(sql[j])) j++;
      const followedByParen = sql[j] === '(';
      if (isFn && followedByParen) tokens.push({ text: word, cls: 'tok-fn' });
      else if (isKw) tokens.push({ text: word, cls: 'tok-kw' });
      else if (followedByParen) tokens.push({ text: word, cls: 'tok-fn' });
      else tokens.push({ text: word, cls: 'tok-idn' });
      i += word.length;
      continue;
    }
    tokens.push({ text: sql[i], cls: 'tok-plain' });
    i += 1;
  }
  return tokens.map((t) => {
    if (t.cls === 'tok-plain') return esc(t.text);
    const colorMap: Record<string, string> = {
      'tok-kw': '#569CD6', 'tok-fn': '#DCDCAA', 'tok-str': '#CE9178',
      'tok-num': '#B5CEA8', 'tok-com': '#6A9955', 'tok-idn': '#9CDCFE',
    };
    const color = colorMap[t.cls] || '#d4d4d4';
    const extra = t.cls === 'tok-kw' ? 'font-weight:600;' : t.cls === 'tok-com' ? 'font-style:italic;' : '';
    return `<span class="${t.cls}" style="color:${color};${extra}">${esc(t.text)}</span>`;
  }).join('');
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
    // COPY with fallback (sirf navigator.clipboard bharosa nahi - mobile/safari pe fail hota hai)
    try {
      await navigator.clipboard.writeText(sql);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      try {
        const ta = document.createElement('textarea');
        ta.value = sql;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      } catch {
        window.prompt('Copy karo:', sql);
      }
    }
  };

  // SQL FORMATTER - query ko readable banata hai (SQL formatter jaisa)
  const formatSql = (input: string) => {
    let q = input.replace(/;\s*$/, '');
    // keywords ke baad newline
    q = q
      .replace(/\b(SELECT|FROM|WHERE|GROUP BY|ORDER BY|HAVING|JOIN|INNER JOIN|LEFT JOIN|RIGHT JOIN|FULL JOIN|CROSS JOIN|ON|AND|OR|UNION|INSERT INTO|VALUES|UPDATE|SET|DELETE FROM|CREATE TABLE|WITH|LIMIT|OFFSET)\b/gi, '\n$1')
      // commas ke baad newline (SELECT columns ke liye)
      .replace(/(SELECT[\s\S]*?)(,)(?=\s*[A-Za-z_])/gi, '$1,')
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .join('\n')
      .replace(/,/g, ',\n  ')
      .replace(/\n\s*\n/g, '\n');
    // SELECT ke baad columns indent + FROM align
    return q.trim() + ';';
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
            <button className="pg-btn" onClick={() => { setSql(formatSql(sql)); }}>✨ Format</button>
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
                  <code>id, name, department, salary, hire_date, city, age, rating, email, gender, experience_years, bonus</code>
                </div>
                <div className="pg-schema-card">
                  <b>departments</b>
                  <code>id, dept_name, location, budget, head_name, founded_year, employee_count, avg_salary, rating</code>
                </div>
                <div className="pg-schema-card">
                  <b>sales</b>
                  <code>id, product, category, amount, region, sale_date, quantity, discount, profit, payment_method</code>
                </div>
                <div className="pg-schema-card">
                  <b>products</b>
                  <code>id, name, category, price, stock, brand, rating, weight_kg, supplier</code>
                </div>
                <div className="pg-schema-card">
                  <b>customers</b>
                  <code>id, name, city, join_date, tier, email, phone, age, gender</code>
                </div>
                <div className="pg-schema-card">
                  <b>orders</b>
                  <code>id, customer_id, product_id, quantity, order_date, status, total_price, discount, payment_method</code>
                </div>
                <div className="pg-schema-card">
                  <b>student_scores</b>
                  <code>id, name, subject, score, class, term, attempts</code>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

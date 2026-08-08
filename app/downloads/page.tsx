import type { Metadata } from 'next';
import CopyAllButton from '@/components/CopyAllButton';

export const metadata: Metadata = {
  title: 'Downloads — Cheat Sheets & Resources',
  description: 'Free Data Analytics cheat sheets and resources — SQL, Python, Power BI, Excel.',
};

// SELF-CONTAINED - koi broken link nahi, sab resources yahin dikhte hain
export default function DownloadsPage() {
  const resources = [
    {
      icon: '🗄️', title: 'SQL Cheat Sheet', desc: 'SELECT, JOIN, GROUP BY, window functions — ek page mein',
      blocks: [
        ['SELECT', 'SELECT col1, col2 FROM table WHERE cond;'],
        ['JOIN', 'SELECT * FROM a INNER JOIN b ON a.id = b.id;'],
        ['GROUP BY', 'SELECT dept, COUNT(*) FROM emp GROUP BY dept;'],
        ['Window', 'SELECT name, RANK() OVER (ORDER BY salary DESC) FROM emp;'],
      ],
    },
    {
      icon: '🐍', title: 'Python Pandas Cheat Sheet', desc: 'groupby, merge, pivot — sabse common functions',
      blocks: [
        ['Read', 'df = pd.read_csv("data.csv")'],
        ['Group', 'df.groupby("dept")["salary"].sum()'],
        ['Merge', 'pd.merge(df1, df2, on="id", how="left")'],
        ['Clean', 'df.dropna(); df.fillna(0); df.drop_duplicates()'],
      ],
    },
    {
      icon: '📈', title: 'Power BI DAX Cheat Sheet', desc: 'CALCULATE, TOTALYTD, FILTER, RANKX — quick reference',
      blocks: [
        ['CALCULATE', 'CALCULATE(SUM(Sales[Amount]), Region="North")'],
        ['YTD', 'TOTALYTD([Total Sales], Calendar[Date])'],
        ['YoY', 'CALCULATE(SUM(Sales), SAMEPERIODLASTYEAR(Calendar[Date]))'],
        ['Rank', 'RANKX(ALL(Product[Name]), [Total Sales], , DESC, Dense)'],
      ],
    },
    {
      icon: '📗', title: 'Excel Formulas Cheat Sheet', desc: 'XLOOKUP, SUMIFS, INDEX+MATCH — daily formulas',
      blocks: [
        ['XLOOKUP', '=XLOOKUP(A2, B:B, C:C, "Not Found")'],
        ['SUMIFS', '=SUMIFS(Sales[Amt], Sales[Reg], "North")'],
        ['INDEX+MATCH', '=INDEX(C:C, MATCH(A2, B:B, 0))'],
        ['IFS', '=IFS(A1>90,"A", A1>75,"B", TRUE,"C")'],
      ],
    },
    {
      icon: '🎯', title: 'SQL Interview Questions', desc: 'Top 30+ questions with answers — interview prep',
      blocks: [
        ['2nd Highest', 'SELECT MAX(salary) FROM emp WHERE salary < (SELECT MAX(salary) FROM emp);'],
        ['Dept Count', 'SELECT dept, COUNT(*) FROM emp GROUP BY dept;'],
        ['Top 3', 'SELECT name FROM emp ORDER BY salary DESC LIMIT 3;'],
        ['RANK', 'SELECT name, RANK() OVER (ORDER BY salary DESC) FROM emp;'],
      ],
    },
    {
      icon: '🧠', title: 'SQL Playground', desc: '257 problems + 8 datasets — practice free',
      blocks: [
        ['Problems', '257 SQL problems (Easy/Medium/Hard)'],
        ['Datasets', '8 real-world datasets (Fraud, Zomato, HR...)'],
        ['Submit', 'Answer check + confetti!'],
        ['URL', '/tools/sql-playground'],
      ],
    },
  ];

  return (
    <div className="layout-wrapper">
      <main className="posts-section">
        <h2 className="section-title">📥 Free Resources & Cheat Sheets</h2>
        <p style={{ color: 'var(--text-light)', fontSize: '0.9rem', marginBottom: 20 }}>
          Sab resources free hain — copy karo, practice karo, interviews crack karo!
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
          {resources.map((r) => (
            <div key={r.title} className="sidebar-widget" style={{ marginBottom: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <span style={{ fontSize: '1.5rem' }}>{r.icon}</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{r.title}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>{r.desc}</div>
                </div>
              </div>
              <div style={{ background: '#1e293b', borderRadius: 10, padding: 10, marginBottom: 10 }}>
                {r.blocks.map(([k, v]) => (
                  <div key={k} style={{ marginBottom: 8 }}>
                    <div style={{ color: '#c792ea', fontSize: '0.72rem', fontWeight: 700, marginBottom: 2 }}>{k}</div>
                    <code style={{ color: '#a5d6a7', fontSize: '0.7rem', fontFamily: "'Fira Code', monospace", whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{v}</code>
                  </div>
                ))}
              </div>
              {r.title === 'SQL Playground' ? (
                <a className="read-more-btn" href="/tools/sql-playground" style={{ textDecoration: 'none', display: 'inline-block' }}>🧠 Open Playground</a>
              ) : (
                <CopyAllButton text={r.blocks.map(([k, v]) => `${k}: ${v}`).join('\n')} />
              )}
            </div>
          ))}
        </div>

        <div style={{ marginTop: 24, padding: 16, background: 'var(--bg)', borderRadius: 12, fontSize: '0.85rem', color: 'var(--text-light)', lineHeight: 1.7 }}>
          <b style={{ color: 'var(--text-dark)' }}>💡 Aur resources chahiye?</b><br />
          🔍 <a href="/search" style={{ color: 'var(--primary)' }}>Search</a> karke dhundho | 📚 <a href="/category/sql" style={{ color: 'var(--primary)' }}>SQL tutorials</a> | 🐍 <a href="/category/python" style={{ color: 'var(--primary)' }}>Python</a> | 📈 <a href="/category/power-bi" style={{ color: 'var(--primary)' }}>Power BI</a> | 📗 <a href="/category/excel" style={{ color: 'var(--primary)' }}>Excel</a> | 🎯 <a href="/category/interview-questions" style={{ color: 'var(--primary)' }}>Interview Q&A</a>
        </div>
      </main>
    </div>
  );
}

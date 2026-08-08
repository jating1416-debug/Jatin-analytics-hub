import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Downloads — Cheat Sheets & Resources',
  description: 'Free Data Analytics cheat sheets and resources — SQL, Python, Power BI, Excel.',
};

const RESOURCES = [
  { icon: '🗄️', title: 'SQL Cheat Sheet', desc: 'SELECT, JOIN, GROUP BY, window functions — ek page mein', type: 'HTML', url: '/category/sql' },
  { icon: '🐍', title: 'Python Pandas Cheat Sheet', desc: 'groupby, merge, pivot — sabse common functions', type: 'HTML', url: '/category/python' },
  { icon: '📈', title: 'Power BI DAX Cheat Sheet', desc: 'CALCULATE, TOTALYTD, FILTER, RANKX — quick reference', type: 'HTML', url: '/category/power-bi' },
  { icon: '📗', title: 'Excel Formulas Cheat Sheet', desc: 'XLOOKUP, SUMIFS, INDEX+MATCH — daily formulas', type: 'HTML', url: '/category/excel' },
  { icon: '🎯', title: 'SQL Interview Questions', desc: 'Top 30+ questions with answers', type: 'HTML', url: '/category/interview-questions' },
  { icon: '📁', title: 'Case Studies', desc: 'Real-world analytics case studies', type: 'HTML', url: '/category/case-study' },
  { icon: '🧠', title: 'SQL Playground', desc: '257 problems practice karo — free', type: 'Tool', url: '/tools/sql-playground' },
  { icon: '📄', title: 'ATS Resume Scanner', desc: 'Apna resume check karo', type: 'Tool', url: '/tools/ats-scanner' },
];

export default function DownloadsPage() {
  return (
    <div className="layout-wrapper">
      <main className="posts-section">
        <h2 className="section-title">📥 Free Resources & Cheat Sheets</h2>
        <p style={{ color: 'var(--text-light)', fontSize: '0.9rem', marginBottom: 20 }}>
          Sab resources free hain — padho, practice karo, interviews crack karo!
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16 }}>
          {RESOURCES.map((r) => (
            <a
              key={r.title}
              href={r.url}
              style={{
                background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 12,
                padding: '18px 20px', textDecoration: 'none', transition: 'var(--transition)',
                display: 'block',
              }}
            >
              <div style={{ fontSize: '1.6rem', marginBottom: 8 }}>{r.icon}</div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-dark)', marginBottom: 6 }}>{r.title}</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-light)', lineHeight: 1.5, marginBottom: 10 }}>{r.desc}</div>
              <span style={{ background: 'rgba(102,126,234,0.12)', color: 'var(--primary)', padding: '3px 10px', borderRadius: 12, fontSize: '0.7rem', fontWeight: 700 }}>
                {r.type === 'Tool' ? '🛠️ Tool' : '📄 Resource'}
              </span>
            </a>
          ))}
        </div>
      </main>
    </div>
  );
}

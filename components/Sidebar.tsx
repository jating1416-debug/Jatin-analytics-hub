import Link from 'next/link';

const TOOLS = [
  { slug: 'kpi-calculator', icon: '📊', name: 'KPI Calculator' },
  { slug: 'cagr-calculator', icon: '📈', name: 'CAGR Calculator' },
  { slug: 'growth-percent', icon: '📉', name: 'Growth %' },
  { slug: 'profit-margin', icon: '💰', name: 'Profit Margin' },
  { slug: 'json-formatter', icon: '🔧', name: 'JSON Formatter' },
  { slug: 'csv-viewer', icon: '📄', name: 'CSV Viewer' },
  { slug: 'csv-to-json', icon: '🔄', name: 'CSV → JSON' },
  { slug: 'sql-formatter', icon: '🗄️', name: 'SQL Formatter' },
  { slug: 'regex-tester', icon: '🔍', name: 'Regex Tester' },
  { slug: 'ats-scanner', icon: '📄', name: 'ATS Scanner' },
  { slug: 'sql-playground', icon: '🧠', name: 'SQL Playground' },
  { slug: 'dax-explorer', icon: '📊', name: 'DAX Explorer' },
];

import XPStreak from '@/components/XPStreak';
import NewsletterWidget from '@/components/NewsletterWidget';

export default function Sidebar({
  categories,
  recent,
  popular,
}: {
  categories: { name: string; slug: string; _count: { articles: number } }[];
  recent: { title: string; slug: string; categorySlug: string; date: string }[];
  popular: { title: string; slug: string; categorySlug: string; views: number }[];
}) {
  return (
    <aside className="sidebar">
      <XPStreak />
      <NewsletterWidget />

      {/* 📣 TELEGRAM CHANNEL */}
      <div className="sidebar-widget">
        <div className="widget-title"><i className="fab fa-telegram-plane" /> Telegram Channel</div>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-light)', marginBottom: 12, lineHeight: 1.5 }}>
          Daily data analytics tips, code snippets aur naye posts ke links — join karo!
        </p>
        <a
          className="cta-btn-white"
          href="https://t.me/+o5aSSYK-6Xk1ZjFl"
          target="_blank"
          rel="noopener"
          style={{ display: 'block', textAlign: 'center', textDecoration: 'none' }}
        >
          <i className="fab fa-telegram-plane" /> Join Channel
        </a>
      </div>

      <div className="sidebar-widget about-widget">
        <div className="about-avatar">👤</div>
        <div className="about-name">Jatin Kumar</div>
        <div className="about-role">Data Analyst</div>
        <p className="about-desc">
          Passionate about Python, SQL, Power BI and turning raw data into meaningful insights.
        </p>
        <a className="about-portfolio-btn" href="https://jatinanalytics.co.in" target="_blank" rel="noopener">
          🚀 View Live Portfolio
        </a>
        <div className="social-links">
          <a className="social-link social-linkedin" href="https://linkedin.com/in/jatin-kumar-5a46a720a" target="_blank" rel="noopener"><i className="fab fa-linkedin" /> LinkedIn</a>
          <a className="social-link social-github" href="https://github.com/jating1416-debug" target="_blank" rel="noopener"><i className="fab fa-github" /> GitHub</a>
          <a className="social-link social-kaggle" href="https://kaggle.com/jatinkhandelwal112" target="_blank" rel="noopener"><i className="fab fa-kaggle" /> Kaggle</a>
          <a className="social-link social-email" href="mailto:jating1416@gmail.com"><i className="fas fa-envelope" /> Email</a>
        </div>
      </div>

      {/* 🛠️ TOOLS WIDGET - sidebar mein (footer se yahan shift) */}
      <div className="sidebar-widget">
        <div className="widget-title"><i className="fas fa-tools" /> All Tools</div>
        <ul className="hub-list" style={{ maxHeight: 280, overflowY: 'auto' }}>
          {TOOLS.map((t) => (
            <li key={t.slug}>
              <Link href={`/tools/${t.slug}`} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>{t.icon}</span> {t.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div className="sidebar-widget">
        <div className="widget-title"><i className="fas fa-layer-group" /> Categories</div>
        <ul className="category-list">
          {categories.map((c) => (
            <li className="category-item" key={c.slug}>
              <div className="category-item-left">
                <div className="category-dot" />
                <Link href={`/category/${c.slug}`}>{c.name}</Link>
              </div>
              <span className="category-count">{c._count.articles}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="sidebar-widget">
        <div className="widget-title"><i className="fas fa-clock" /> Recent Posts</div>
        <ul className="recent-posts-list">
          {recent.map((p) => (
            <li className="recent-post-item" key={p.slug}>
              <div className="recent-post-info">
                <Link href={`/${p.categorySlug}/${p.slug}`}>{p.title}</Link>
                <div className="recent-post-date"><i className="fas fa-calendar-alt" /> {p.date}</div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="sidebar-widget">
        <div className="widget-title"><i className="fas fa-fire" /> Popular Posts</div>
        <ul className="recent-posts-list">
          {popular.map((p) => (
            <li className="recent-post-item" key={p.slug}>
              <div className="recent-post-info">
                <Link href={`/${p.categorySlug}/${p.slug}`}>{p.title}</Link>
                <div className="recent-post-date"><i className="fas fa-eye" /> {p.views} reads</div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="sidebar-widget cta-widget">
        <div className="widget-title"><i className="fas fa-rocket" /> My Portfolio</div>
        <p>Explore my live Data Analytics projects, Power BI dashboards, and datasets!</p>
        <a className="cta-btn-white" href="https://jatinanalytics.co.in" target="_blank" rel="noopener">🚀 Visit jatinanalytics.co.in</a>
        <a className="cta-btn-outline" href="https://www.kaggle.com/jatinkhandelwal112" target="_blank" rel="noopener">🏆 View Kaggle Datasets</a>
      </div>
    </aside>
  );
}

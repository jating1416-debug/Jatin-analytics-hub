'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

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

const TOOLKIT = [
  { slug: 'kpi-calculator', icon: '📊', name: 'KPI' },
  { slug: 'cagr-calculator', icon: '📈', name: 'CAGR' },
  { slug: 'growth-percent', icon: '📉', name: 'Growth %' },
  { slug: 'profit-margin', icon: '💰', name: 'Margin' },
];

const TOOLBOX = [
  { slug: 'json-formatter', icon: '🔧', name: 'JSON' },
  { slug: 'csv-viewer', icon: '📄', name: 'CSV' },
  { slug: 'sql-formatter', icon: '🗄️', name: 'SQL' },
  { slug: 'regex-tester', icon: '🔍', name: 'Regex' },
  { slug: 'sql-playground', icon: '🧠', name: 'SQL Play' },
  { slug: 'dax-explorer', icon: '📊', name: 'DAX' },
];

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
      {/* QUOTE OF THE DAY */}
      <QuoteOfDay />

      {/* READING LIST WIDGET (live) */}
      <ReadingListWidget />

      {/* RANDOM + SAVED */}
      <div className="sidebar-widget" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button
          onClick={() => { window.location.href = '/api/random-article'; }}
          style={{ flex: 1, background: 'var(--gradient)', color: '#fff', border: 'none', padding: '10px', borderRadius: 10, fontWeight: 700, cursor: 'pointer', fontSize: '0.82rem' }}
        >
          🎲 Random Article
        </button>
        <Link
          href="/saved"
          style={{ flex: 1, background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text-dark)', padding: '10px', borderRadius: 10, fontWeight: 700, fontSize: '0.82rem', textAlign: 'center', textDecoration: 'none' }}
        >
          🔖 Reading List
        </Link>
      </div>

      {/* ANALYST TOOLKIT */}
      <div className="sidebar-widget">
        <div className="widget-title"><i className="fas fa-toolbox" /> Analyst Toolkit</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
          {TOOLKIT.map((t) => (
            <Link key={t.slug} href={`/tools/${t.slug}`} style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 10, padding: '8px 10px', textDecoration: 'none', color: 'var(--text-dark)', fontSize: '0.78rem', fontWeight: 600, textAlign: 'center' }}>
              {t.icon} {t.name}
            </Link>
          ))}
        </div>
      </div>

      {/* DEVELOPER TOOLBOX */}
      <div className="sidebar-widget">
        <div className="widget-title"><i className="fas fa-wrench" /> Developer Toolbox</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
          {TOOLBOX.map((t) => (
            <Link key={t.slug} href={`/tools/${t.slug}`} style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 10, padding: '8px 10px', textDecoration: 'none', color: 'var(--text-dark)', fontSize: '0.78rem', fontWeight: 600, textAlign: 'center' }}>
              {t.icon} {t.name}
            </Link>
          ))}
        </div>
      </div>

      {/* ALL TOOLS */}
      <div className="sidebar-widget">
        <div className="widget-title"><i className="fas fa-tools" /> All Tools</div>
        <ul className="hub-list" style={{ maxHeight: 220, overflowY: 'auto' }}>
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

      {/* TELEGRAM */}
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

      <div className="sidebar-widget cta-widget">
        <div className="widget-title"><i className="fas fa-rocket" /> My Portfolio</div>
        <p>Explore my live Data Analytics projects, Power BI dashboards, and datasets!</p>
        <a className="cta-btn-white" href="https://jatinanalytics.co.in" target="_blank" rel="noopener">🚀 Visit jatinanalytics.co.in</a>
        <a className="cta-btn-outline" href="https://www.kaggle.com/jatinkhandelwal112" target="_blank" rel="noopener">🏆 View Kaggle Datasets</a>
      </div>
    </aside>
  );
}

// READING LIST WIDGET - localStorage saved posts live dikhao
function ReadingListWidget() {
  const [items, setItems] = useState<{ title: string; url: string }[]>([]);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const load = () => {
      try {
        const list = JSON.parse(localStorage.getItem('di_saved') || '[]');
        setItems(list.slice(0, 5));
      } catch { setItems([]); }
    };
    load();
    window.addEventListener('storage', load);
    const iv = setInterval(load, 3000); // har 3 sec refresh (same tab)
    return () => { window.removeEventListener('storage', load); clearInterval(iv); };
  }, []);

  const remove = (url: string) => {
    try {
      const list = JSON.parse(localStorage.getItem('di_saved') || '[]');
      const next = list.filter((x: any) => x.url !== url);
      localStorage.setItem('di_saved', JSON.stringify(next));
      setItems(next);
      setTick(tick + 1);
    } catch {}
  };

  if (items.length === 0) {
    return (
      <div className="sidebar-widget">
        <div className="widget-title"><i className="fas fa-bookmark" /> Reading List</div>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>Post pe 🔖 Save dabao — yahan dikhega!</p>
      </div>
    );
  }

  return (
    <div className="sidebar-widget">
      <div className="widget-title"><i className="fas fa-bookmark" /> Reading List</div>
      <ul className="recent-posts-list">
        {items.map((it) => (
          <li className="recent-post-item" key={it.url}>
            <div className="recent-post-info">
              <Link href={it.url}>{it.title.slice(0, 45)}</Link>
              <button onClick={() => remove(it.url)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.72rem', marginTop: 2 }}>✕ Remove</button>
            </div>
          </li>
        ))}
      </ul>
      <Link href="/saved" style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 700 }}>Saari saved posts dekho →</Link>
    </div>
  );
}

// QUOTE OF DAY - client component (din ke hisaab se)
function QuoteOfDay() {
  const QUOTES = [
    ['Data is the new oil, but analytics is the engine.', '— Anonymous'],
    ["Without data, you're just another person with an opinion.", '— W. Edwards Deming'],
    ['In God we trust. All others must bring data.', '— W. Edwards Deming'],
    ['The goal is to turn data into information, and information into insight.', '— Carly Fiorina'],
    ['Numbers have an important story to tell. They rely on you to give them a voice.', '— Stephen Few'],
    ['Errors using inadequate data are less than those using no data at all.', '— Charles Babbage'],
  ];
  const day = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  const [q, a] = QUOTES[day % QUOTES.length];
  return (
    <div className="sidebar-widget" style={{ textAlign: 'center' }}>
      <div className="widget-title"><i className="fas fa-quote-left" /> Quote of the Day</div>
      <p style={{ fontSize: '0.85rem', fontStyle: 'italic', lineHeight: 1.6, marginBottom: 6 }}>“{q}”</p>
      <span style={{ fontSize: '0.75rem', color: 'var(--text-light)', fontWeight: 600 }}>{a}</span>
    </div>
  );
}

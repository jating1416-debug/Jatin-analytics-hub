'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import HubSidebar from '@/components/HubSidebar';
import AdSlots from '@/components/AdSlots';

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
  const [widgets, setWidgets] = useState<Record<string, boolean> | null>(null);

  // SETTINGS - widget on/off (admin Settings se)
  useEffect(() => {
    let cancelled = false;
    fetch('/api/settings')
      .then((r) => r.json())
      .then((d) => { if (!cancelled && d && d.widgets) setWidgets(d.widgets); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  const w = (k: string) => (widgets === null ? true : widgets[k] !== false);

  return (
    <aside className="sidebar">
      {/* 👤 ABOUT WIDGET - photo + naam + social links (Blogger wala) */}
      {w('about') && (
      <div className="sidebar-widget about-widget" style={{ textAlign: 'center' }}>
        <div className="about-avatar" style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.2rem', margin: '0 auto 12px', boxShadow: '0 4px 15px rgba(102,126,234,0.3)' }}>
          👤
        </div>
        <div className="about-name" style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: 4 }}>Jatin Kumar</div>
        <div className="about-role" style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600, marginBottom: 10 }}>Data Analyst</div>
        <p className="about-desc" style={{ fontSize: '0.85rem', color: 'var(--text-light)', lineHeight: 1.6, marginBottom: 12 }}>
          Passionate about Python, SQL, Power BI and turning raw data into meaningful insights.
        </p>
        <a className="about-portfolio-btn" href="https://jatinanalytics.co.in" target="_blank" rel="noopener" style={{ display: 'block', background: 'var(--gradient)', color: '#fff', padding: '10px', borderRadius: 8, fontWeight: 700, fontSize: '0.85rem', textAlign: 'center', textDecoration: 'none', marginBottom: 12 }}>
          🚀 View Live Portfolio
        </a>
        <div className="social-links" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <a className="social-link social-linkedin" href="https://linkedin.com/in/jatin-kumar-5a46a720a" target="_blank" rel="noopener" style={{ background: '#0077b5', color: '#fff', padding: '8px', borderRadius: 8, textDecoration: 'none', fontSize: '0.8rem', fontWeight: 600, textAlign: 'center' }}><i className="fab fa-linkedin" /> LinkedIn</a>
          <a className="social-link social-github" href="https://github.com/jating1416-debug" target="_blank" rel="noopener" style={{ background: '#171515', color: '#fff', padding: '8px', borderRadius: 8, textDecoration: 'none', fontSize: '0.8rem', fontWeight: 600, textAlign: 'center' }}><i className="fab fa-github" /> GitHub</a>
          <a className="social-link social-kaggle" href="https://kaggle.com/jatinkhandelwal112" target="_blank" rel="noopener" style={{ background: '#0069a3', color: '#fff', padding: '8px', borderRadius: 8, textDecoration: 'none', fontSize: '0.8rem', fontWeight: 600, textAlign: 'center' }}><i className="fab fa-kaggle" /> Kaggle</a>
          <a className="social-link social-email" href="mailto:jating1416@gmail.com" style={{ background: '#c5221f', color: '#fff', padding: '8px', borderRadius: 8, textDecoration: 'none', fontSize: '0.8rem', fontWeight: 600, textAlign: 'center' }}><i className="fas fa-envelope" /> Email</a>
        </div>
      </div>
      )}

      {/* ⚡ PRODUCTIVITY HUB - sidebar mein hamesha khula */}
      {w('hub') && <HubSidebar />}

      {/* QUOTE OF THE DAY */}
      {w('quote') && <QuoteOfDay />}

      {/* READING LIST WIDGET (live) */}
      {w('readingList') && <ReadingListWidget />}

      {/* RANDOM + SAVED */}
      {w('randomSaved') && (
      <div className="sidebar-widget" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button
          onClick={async () => {
            try {
              const res = await fetch('/api/random-article');
              const data = await res.json();
              if (data.url) window.location.href = data.url;
            } catch { window.location.href = '/'; }
          }}
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
      )}

      {/* ANALYST TOOLKIT */}
      {w('toolkit') && (
      <div className="sidebar-widget">
        <div className="widget-title"><i className="fas fa-toolbox" /> <span data-i18n="sidebar.toolkit">Analyst Toolkit</span></div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
          {TOOLKIT.map((t) => (
            <Link key={t.slug} href={`/tools/${t.slug}`} style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 10, padding: '8px 10px', textDecoration: 'none', color: 'var(--text-dark)', fontSize: '0.78rem', fontWeight: 600, textAlign: 'center' }}>
              {t.icon} {t.name}
            </Link>
          ))}
        </div>
      </div>
      )}

      {/* DEVELOPER TOOLBOX */}
      {w('toolbox') && (
      <div className="sidebar-widget">
        <div className="widget-title"><i className="fas fa-wrench" /> <span data-i18n="sidebar.toolbox">Developer Toolbox</span></div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
          {TOOLBOX.map((t) => (
            <Link key={t.slug} href={`/tools/${t.slug}`} style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 10, padding: '8px 10px', textDecoration: 'none', color: 'var(--text-dark)', fontSize: '0.78rem', fontWeight: 600, textAlign: 'center' }}>
              {t.icon} {t.name}
            </Link>
          ))}
        </div>
      </div>
      )}

      {/* ALL TOOLS */}
      {w('allTools') && (
      <div className="sidebar-widget">
        <div className="widget-title"><i className="fas fa-tools" /> <span data-i18n="sidebar.alltools">All Tools</span></div>
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
      )}

      {w('categories') && (
      <div className="sidebar-widget">
        <div className="widget-title"><i className="fas fa-layer-group" /> <span data-i18n="sidebar.categories">Categories</span></div>
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
      )}

      {w('recent') && (
      <div className="sidebar-widget">
        <div className="widget-title"><i className="fas fa-clock" /> <span data-i18n="sidebar.recent">Recent Posts</span></div>
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
      )}

      {w('popular') && (
      <div className="sidebar-widget">
        <div className="widget-title"><i className="fas fa-fire" /> <span data-i18n="sidebar.popular">Popular Posts</span></div>
        <ul className="recent-posts-list">
          {popular.map((p) => (
            <li className="recent-post-item" key={p.slug}>
              <div className="recent-post-info">
                <Link href={`/${p.categorySlug}/${p.slug}`}>{p.title}</Link>
                <div className="recent-post-date">
                  {/* Views SIRF admin ko dikhte hain - public pe "Trending" label */}
                  <i className="fas fa-fire" /> <span data-i18n="sidebar.trending">Trending</span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
      )}

      {/* TELEGRAM */}
      {w('telegram') && (
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
      )}

      {w('portfolio') && (
      <div className="sidebar-widget cta-widget">
        <div className="widget-title"><i className="fas fa-rocket" /> My Portfolio</div>
        <p>Explore my live Data Analytics projects, Power BI dashboards, and datasets!</p>
        <a className="cta-btn-white" href="https://jatinanalytics.co.in" target="_blank" rel="noopener">🚀 Visit jatinanalytics.co.in</a>
        <a className="cta-btn-outline" href="https://www.kaggle.com/jatinkhandelwal112" target="_blank" rel="noopener">🏆 View Kaggle Datasets</a>
      </div>
      )}
      {/* ADS (optional - settings se) */}
      <AdSlots position="sidebar" />
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
        <div className="widget-title"><i className="fas fa-bookmark" /> <span data-i18n="sidebar.reading">Reading List</span></div>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>Post pe 🔖 Save dabao — yahan dikhega!</p>
      </div>
    );
  }

  return (
    <div className="sidebar-widget">
      <div className="widget-title"><i className="fas fa-bookmark" /> <span data-i18n="sidebar.reading">Reading List</span></div>
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
  // JATIN KE QUOTES - 25 apne quotes, har din ek naya (daily rotate)
  const QUOTES = [
    'Data sirf numbers nahi, sahi decision ki kahani hoti hai.',
    'Jab data bolta hai, assumptions ko chup rehna padta hai.',
    'Good analysts data ko read nahi karte, data ko understand karte hain.',
    'Har dataset ke andar ek story hoti hai, bas analyst ko use find karna aana chahiye.',
    'Clean data se better analysis aur better analysis se better decisions aate hain.',
    'Data Analytics ka goal numbers dikhana nahi, insights dikhana hai.',
    'SQL data nikal sakta hai, lekin insight analyst nikalta hai.',
    'Dashboard tab useful hai jab woh sirf beautiful nahi, actionable bhi ho.',
    'Data mein pattern dhoondhna analysis hai, pattern ka meaning samajhna intelligence hai.',
    'Har number ek question ka answer nahi hota; kabhi-kabhi woh ek naya question hota hai.',
    'Bad data se beautiful dashboard bhi bad decision de sakta hai.',
    'Data cleaning boring lag sakti hai, lekin accurate analysis wahi se start hota hai.',
    'Excel ho, SQL ho ya Python — tool important nahi, problem solve karna important hai.',
    'Jo data ko question karna seekh gaya, woh analysis karna seekh gaya.',
    'Numbers ko visualize karo, patterns ko identify karo, aur decisions ko improve karo.',
    'Analytics mein sabse powerful skill ek achha question poochna hai.',
    'Data tumhe batata hai kya hua, analysis tumhe samjhata hai kyun hua.',
    'A good dashboard answers questions before the user asks them.',
    'Data analyst ka kaam report banana nahi, clarity create karna hai.',
    'Jitna better data samjhoge, utne better decisions loge.',
    'Trend dekhna easy hai, trend ke peeche ki story samajhna real analytics hai.',
    'Numbers kabhi lie nahi bolte, lekin unki interpretation galat ho sakti hai.',
    'Data ko clean karo, context do, visualize karo — tab insight valuable banti hai.',
    'Analytics ka real value tab hai jab insight action mein convert ho.',
    'Learn the tools, understand the data, solve the problem.',
  ];
  const day = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  const q = QUOTES[day % QUOTES.length];
  return (
    <div className="sidebar-widget" style={{ textAlign: 'center' }}>
      <div className="widget-title"><i className="fas fa-quote-left" /> Quote of the Day</div>
      <p style={{ fontSize: '0.85rem', fontStyle: 'italic', lineHeight: 1.6, marginBottom: 6 }}>“{q}”</p>
    </div>
  );
}

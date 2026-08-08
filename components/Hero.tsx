'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

// PREMIUM HERO v2 - dark gradient mesh, floating orbs, rotating words, live stats
const WORDS = ['SQL', 'Python', 'Power BI', 'Excel', 'Data Stories'];

const STATS_DEFAULT = { posts: 94, tools: 12, topics: 7, readers: 500 };

export default function Hero({
  stats = STATS_DEFAULT,
}: {
  stats?: { posts: number; tools: number; topics: number; readers?: number };
}) {
  const [open, setOpen] = useState(false);
  const [wordIdx, setWordIdx] = useState(0);
  const [fade, setFade] = useState(true);
  const [counts, setCounts] = useState({ posts: 0, tools: 0, topics: 0 });

  // rotating word effect
  useEffect(() => {
    const t = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setWordIdx((i) => (i + 1) % WORDS.length);
        setFade(true);
      }, 320);
    }, 2600);
    return () => clearInterval(t);
  }, []);

  // animated counters (count-up on mount)
  useEffect(() => {
    const targets = [
      { key: 'posts' as const, val: stats.posts },
      { key: 'tools' as const, val: stats.tools },
      { key: 'topics' as const, val: stats.topics },
    ];
    const dur = 1200;
    const start = performance.now();
    const step = (now: number) => {
      const p = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      const next = { ...counts };
      targets.forEach((t) => {
        next[t.key] = Math.round(t.val * eased);
      });
      setCounts(next);
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="featured-banner">
      <div className="hero-orb one" />
      <div className="hero-orb two" />
      <div className="hero-orb three" />
      <div className="hero-grid-overlay" />

      <div className="featured-banner-inner">
        <span className="featured-tag">
          <i className="fas fa-chart-line" style={{ marginRight: 6 }} />
          DATA ANALYTICS BLOG
        </span>
        <h1>
          Learn Data Analytics,<br />
          <span className="hero-gradient-text">Master </span>
          <span className="hero-rotate-word" style={{ opacity: fade ? 1 : 0, transform: fade ? 'none' : 'translateY(8px)' }}>
            {WORDS[wordIdx]}
          </span>
        </h1>
        <p>
          Practical guides, real-world examples, and career tips for aspiring Data Analysts —
          sab kuch ek jagah, free mein.
        </p>

        <div style={{ position: 'relative', display: 'inline-block', margin: '5px' }}>
          <button
            onClick={() => setOpen(!open)}
            className="featured-btn outline"
            style={{ border: '1.5px solid rgba(255,255,255,0.45)', background: 'rgba(255,255,255,0.08)', color: '#fff', cursor: 'pointer', fontFamily: 'inherit', backdropFilter: 'blur(10px)' }}
          >
            📚 Start Learning <i className="fas fa-chevron-down" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', marginLeft: 4 }} />
          </button>
          {open && (
            <div
              style={{
                position: 'absolute', top: 'calc(100% + 12px)', left: '50%', transform: 'translateX(-50%)',
                background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 16,
                boxShadow: '0 24px 60px -12px rgba(2,6,23,0.45)', minWidth: 250, padding: 10, zIndex: 999,
                textAlign: 'left', overflow: 'hidden',
              }}
              onMouseLeave={() => setOpen(false)}
            >
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'var(--gradient)' }} />
              {[
                { href: '/category/excel', icon: '📗', label: 'Excel', desc: 'Formulas, pivots, dashboards' },
                { href: '/category/python', icon: '🐍', label: 'Python', desc: 'Pandas, NumPy, automation' },
                { href: '/category/sql', icon: '🗄️', label: 'SQL / MySQL', desc: 'Queries, joins, optimization' },
                { href: '/category/power-bi', icon: '📈', label: 'Power BI', desc: 'DAX, visuals, reporting' },
                { href: '/category/interview-questions', icon: '🎯', label: 'Interview Questions', desc: 'Q&A for analyst roles' },
                { href: '/category/case-study', icon: '📁', label: 'Case Studies', desc: 'Real-world projects' },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 12,
                    color: 'var(--text-dark)', textDecoration: 'none', fontSize: '0.88rem', fontWeight: 700,
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--gradient-soft)'; (e.currentTarget as HTMLElement).style.paddingLeft = '16px'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.paddingLeft = '12px'; }}
                >
                  <span style={{ fontSize: '1.15rem' }}>{item.icon}</span>
                  <span style={{ flex: 1 }}>
                    {item.label}
                    <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-light)', fontWeight: 500 }}>{item.desc}</span>
                  </span>
                  <i className="fas fa-chevron-right" style={{ fontSize: '0.7rem', color: 'var(--text-light)' }} />
                </Link>
              ))}
            </div>
          )}
        </div>

        <Link className="featured-btn" href="/tools" style={{ textDecoration: 'none' }}>
          🛠️ Free Tools <i className="fas fa-arrow-right" style={{ marginLeft: 2 }} />
        </Link>

        {/* LIVE STATS */}
        <div className="hero-stats">
          <div className="hero-stat">
            <div className="hero-stat-value">{counts.posts}+</div>
            <div className="hero-stat-label">Articles</div>
          </div>
          <div className="hero-stat">
            <div className="hero-stat-value">{counts.tools}</div>
            <div className="hero-stat-label">Free Tools</div>
          </div>
          <div className="hero-stat">
            <div className="hero-stat-value">{counts.topics}</div>
            <div className="hero-stat-label">Topics</div>
          </div>
        </div>

        <div className="hero-scroll-hint">
          Scroll to explore <i className="fas fa-chevron-down" />
        </div>
      </div>
    </div>
  );
}

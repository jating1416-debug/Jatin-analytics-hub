'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

// INSTANT SMOOTH FILTER - saari posts EK BAAR fetch, tab click pe LOCAL filter
// + PREMIUM cards + URL ?cat= support (nav tabs: /?cat=sql etc.)

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'sql', label: 'SQL' },
  { key: 'python', label: 'Python' },
  { key: 'power-bi', label: 'Power BI' },
  { key: 'excel', label: 'Excel' },
  { key: 'career', label: 'Career' },
  { key: 'interview-questions', label: 'Interview Q&A' },
  { key: 'case-study', label: 'Case Study' },
  { key: 'error', label: 'error' },
];

const VALID_KEYS = new Set(FILTERS.map((f) => f.key));

// category → icon (thumb strip ke liye)
const CAT_ICONS: Record<string, string> = {
  sql: '🗄️',
  mysql: '🗄️',
  python: '🐍',
  'power-bi': '📈',
  excel: '📗',
  career: '💼',
  'interview-questions': '🎯',
  'case-study': '📁',
  uncategorized: '📝',
};
const CAT_ICON = (slug: string | null | undefined) => CAT_ICONS[slug || ''] || '📝';

type Post = {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  publishedAt: string | null;
  createdAt: string;
  readingTime: number | null;
  category: { name: string; slug: string } | null;
  author: { name: string } | null;
};

const PAGE_SIZE = 10;

function formatDate(d: string | null): string {
  if (!d) return '';
  try { return new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }); }
  catch { return ''; }
}

// 7 din se kam purani post -> NEW badge
function isNewPost(d: string | null): boolean {
  if (!d) return false;
  try {
    const diff = Date.now() - new Date(d).getTime();
    return diff >= 0 && diff < 7 * 24 * 60 * 60 * 1000;
  } catch { return false; }
}

export default function PostList() {
  const [allPosts, setAllPosts] = useState<Post[]>([]);
  const [cat, setCat] = useState('all');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // URL ?cat= param read karo (nav tabs: /?cat=sql, /?cat=python ...)
  // taaki navbar ke tabs pe click karne pe filter turant lag jaye
  useEffect(() => {
    const readParam = () => {
      try {
        const p = new URLSearchParams(window.location.search).get('cat');
        if (p && VALID_KEYS.has(p)) {
          setCat(p);
          setPage(1);
        }
      } catch {}
    };
    readParam();
    // back/forward button se bhi URL change ho to filter update
    window.addEventListener('popstate', readParam);
    return () => window.removeEventListener('popstate', readParam);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // EK BAAR fetch - saari posts summaries
  useEffect(() => {
    let cancelled = false;
    fetch('/api/posts?all=1')
      .then((r) => r.json())
      .then((d) => { if (!cancelled) { setAllPosts(d.posts || []); } })
      .catch(() => { if (!cancelled) setError('Load fail'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  // ---------- LOCAL FILTER (instant!) ----------
  const filtered = useMemo(() => {
    if (cat === 'all') return allPosts;
    if (cat === 'error') {
      // sirf title/excerpt mein 'error' - mixed content nahi
      return allPosts.filter((p) =>
        (p.title || '').toLowerCase().includes('error') ||
        (p.excerpt || '').toLowerCase().includes('error')
      );
    }
    return allPosts.filter((p) => p.category?.slug === cat);
  }, [allPosts, cat]);

  // counts - local
  const counts = useMemo(() => {
    const c: Record<string, number> = { all: allPosts.length };
    FILTERS.slice(1).forEach((f) => {
      if (f.key === 'error') {
        c[f.key] = allPosts.filter((p) =>
          (p.title || '').toLowerCase().includes('error') ||
          (p.excerpt || '').toLowerCase().includes('error')
        ).length;
      } else {
        c[f.key] = allPosts.filter((p) => p.category?.slug === f.key).length;
      }
    });
    return c;
  }, [allPosts]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pagePosts = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const onFilter = (key: string) => {
    setCat(key);
    setPage(1);
    // URL update (bina reload) - taaki back/forward bhi kaam kare
    try {
      const url = key === 'all' ? window.location.pathname : `/?cat=${key}`;
      window.history.replaceState(null, '', url);
    } catch {}
    const el = document.getElementById('post-list-anchor');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // PAGINATION - Older/Newer (scroll up + state set)
  const goToPage = (p: number) => {
    setPage(p);
    const el = document.getElementById('post-list-anchor');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div id="post-list-anchor">
      <div className="filter-tags-wrapper">
        {FILTERS.map((f) => {
          const count = counts[f.key] ?? 0;
          const isActive = cat === f.key;
          return (
            <button
              key={f.key}
              type="button"
              className={`filter-tag-btn${isActive ? ' active' : ''}`}
              onClick={() => onFilter(f.key)}
              style={{ transition: 'all 0.15s ease' }}
            >
              {f.key === 'all' ? <span data-i18n="f.all">{f.label}</span> : f.label}
              <span
                style={{
                  display: 'inline-block', marginLeft: 6,
                  background: isActive ? 'rgba(255,255,255,0.25)' : 'rgba(102,126,234,0.15)',
                  color: isActive ? '#fff' : 'var(--primary)',
                  borderRadius: 10, padding: '1px 7px', fontSize: '0.68rem', fontWeight: 700,
                }}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* SHIMMER SKELETONS */}
      {loading && (
        <div>
          {[1, 2, 3].map((i) => (
            <div key={i} className="post-card" style={{ marginBottom: 24 }}>
              <div className="skel" style={{ height: 100, borderRadius: '18px 18px 0 0' }} />
              <div className="post-body">
                <div className="skel" style={{ height: 14, width: '40%', marginBottom: 12 }} />
                <div className="skel" style={{ height: 22, width: '80%', marginBottom: 12 }} />
                <div className="skel" style={{ height: 12, width: '100%', marginBottom: 8 }} />
                <div className="skel" style={{ height: 12, width: '65%' }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && error && (
        <div className="category-empty" style={{ display: 'block' }}>
          <p>⚠️ Posts load nahi ho payi — refresh karo.</p>
        </div>
      )}

      {!loading && !error && pagePosts.length === 0 && (
        <div className="category-empty" style={{ display: 'block' }}>
          <p>😕 Is category mein abhi koi post nahi hai.</p>
        </div>
      )}

      {!loading && !error && pagePosts.length > 0 && (
        <div>
          {pagePosts.map((p, i) => (
            <div
              key={p.id}
              className="post-card reveal"
              style={{ animation: `fadeSlide 0.3s ease ${Math.min(i * 0.05, 0.3)}s backwards` }}
            >
              <style>{`@keyframes fadeSlide { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }`}</style>
              {/* PREMIUM THUMB STRIP - gradient + category icon */}
              <Link href={`/${p.category?.slug || 'post'}/${p.slug}`} className="post-thumb-strip" aria-label={p.title}>
                <span className="post-category-badge">
                  {p.category?.name || 'Article'}
                </span>
                {isNewPost(p.publishedAt || p.createdAt) && (
                  <span className="post-new-badge">✨ NEW</span>
                )}
                <span className="post-thumb-icon">{CAT_ICON(p.category?.slug)}</span>
                <span className="thumb-arrow"><i className="fas fa-arrow-right" /></span>
              </Link>

              <div className="post-body">
                <div className="post-meta">
                  <span><i className="fas fa-calendar-alt" /> {formatDate(p.publishedAt || p.createdAt)}</span>
                  <span><i className="fas fa-user" /> {p.author?.name || 'Jatin Kumar'}</span>
                </div>
                <div className="reading-time" title="Reading time">
                  <i className="fas fa-clock" /><span>{p.readingTime || 3} <span data-i18n="f.minread">min read</span></span>
                </div>
                <div className="post-title">
                  <Link href={`/${p.category?.slug || 'post'}/${p.slug}`}>{p.title}</Link>
                </div>
                {p.excerpt && <div className="post-snippet">{p.excerpt}</div>}
                <div className="post-footer">
                  <div className="post-tags">
                    {p.category && <Link className="post-tag" href={`/category/${p.category.slug}`}>{p.category.name}</Link>}
                  </div>
                  <Link className="read-more-btn" href={`/${p.category?.slug || 'post'}/${p.slug}`}>
                    <span data-i18n="f.readmore">Read More</span>
                    <span className="sr-only">: {p.title}</span>
                    <i className="fas fa-arrow-right" />
                  </Link>
                </div>
              </div>
            </div>
          ))}

          {totalPages > 1 && (
            <div className="pg-nav" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10, margin: '30px 0', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="pg-nav-btn"
                onClick={() => goToPage(safePage - 1)}
                disabled={safePage <= 1}
              >
                <i className="fas fa-arrow-left" /> Newer
              </button>
              <span className="pg-nav-info">
                Page {safePage} / {totalPages} · {filtered.length} posts
              </span>
              <button
                type="button"
                className="pg-nav-btn"
                onClick={() => goToPage(safePage + 1)}
                disabled={safePage >= totalPages}
              >
                Older <i className="fas fa-arrow-right" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

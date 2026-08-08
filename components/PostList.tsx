'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

// SMOOTH POST LIST - filter tabs + posts, sab client-side (bina page reload)
// Blogger wale theme jaisa smooth - instant tab switching

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

type ApiData = {
  posts: Post[];
  total: number;
  totalPages: number;
  page: number;
  counts: Record<string, number>;
};

function formatDate(d: string | null): string {
  if (!d) return '';
  try {
    return new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  } catch {
    return '';
  }
}

export default function PostList() {
  const [cat, setCat] = useState('all');
  const [page, setPage] = useState(1);
  const [data, setData] = useState<ApiData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    fetch(`/api/posts?cat=${encodeURIComponent(cat)}&page=${page}`)
      .then((r) => r.json())
      .then((d) => { if (!cancelled) setData(d); })
      .catch(() => { if (!cancelled) { setError('Load fail'); setData(null); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [cat, page]);

  const onFilter = (key: string) => {
    setCat(key);
    setPage(1);
    // smooth scroll to top of list
    const el = document.getElementById('post-list-anchor');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const posts = data?.posts || [];
  const total = data?.total || 0;
  const totalPages = data?.totalPages || 1;
  const counts = data?.counts || {};

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
              style={{ transition: 'all 0.2s ease' }}
            >
              {f.label}
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

      {/* Loading skeleton */}
      {loading && (
        <div>
          {[1, 2, 3].map((i) => (
            <div key={i} className="post-card" style={{ opacity: 0.6 }}>
              <div className="post-body">
                <div style={{ height: 14, width: '40%', background: 'var(--border)', borderRadius: 6, marginBottom: 10 }} />
                <div style={{ height: 20, width: '80%', background: 'var(--border)', borderRadius: 6, marginBottom: 10 }} />
                <div style={{ height: 12, width: '100%', background: 'var(--border)', borderRadius: 6, marginBottom: 6 }} />
                <div style={{ height: 12, width: '70%', background: 'var(--border)', borderRadius: 6 }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="category-empty" style={{ display: 'block' }}>
          <p>⚠️ Posts load nahi ho payi — thodi der baad refresh karo.</p>
        </div>
      )}

      {/* Empty */}
      {!loading && !error && posts.length === 0 && (
        <div className="category-empty" style={{ display: 'block' }}>
          <p>😕 Is category mein abhi koi post nahi hai.</p>
          <p>Jald hi naye posts aa rahi hain!</p>
        </div>
      )}

      {/* Posts with fade-in */}
      {!loading && !error && posts.length > 0 && (
        <div>
          {posts.map((p, i) => (
            <div
              key={p.id}
              className="post-card"
              style={{ animation: `fadeSlide 0.3s ease ${Math.min(i * 0.05, 0.3)}s backwards` }}
            >
              <style>{`@keyframes fadeSlide { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }`}</style>
              <div className="post-body">
                <div className="post-meta">
                  <span><i className="fas fa-calendar-alt" /> {formatDate(p.publishedAt || p.createdAt)}</span>
                  <span><i className="fas fa-user" /> {p.author?.name || 'Jatin Kumar'}</span>
                </div>
                <div className="reading-time" title="Reading time">
                  <i className="fas fa-clock" />
                  <span>{p.readingTime || 3} min read</span>
                </div>
                <div className="post-title">
                  <Link href={`/${p.category?.slug || 'post'}/${p.slug}`}>{p.title}</Link>
                </div>
                {p.excerpt && <div className="post-snippet">{p.excerpt}</div>}
                <div className="post-footer">
                  <div className="post-tags">
                    {p.category && (
                      <Link className="post-tag" href={`/category/${p.category.slug}`}>{p.category.name}</Link>
                    )}
                  </div>
                  <Link className="read-more-btn" href={`/${p.category?.slug || 'post'}/${p.slug}`}>
                    Read More <i className="fas fa-arrow-right" />
                  </Link>
                </div>
              </div>
            </div>
          ))}

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 10, margin: '30px 0', flexWrap: 'wrap' }}>
              {page > 1 && (
                <button onClick={() => setPage(page - 1)} className="cta-btn-outline" style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-dark)', padding: '10px 20px', borderRadius: 20, cursor: 'pointer', fontWeight: 600 }}>
                  <i className="fas fa-arrow-left" /> Newer
                </button>
              )}
              <span style={{ alignSelf: 'center', fontSize: '0.85rem', color: 'var(--text-light)', fontWeight: 600 }}>
                Page {page} / {totalPages} ({total} posts)
              </span>
              {page < totalPages && (
                <button onClick={() => setPage(page + 1)} className="cta-btn-outline" style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-dark)', padding: '10px 20px', borderRadius: 20, cursor: 'pointer', fontWeight: 600 }}>
                  Older <i className="fas fa-arrow-right" />
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

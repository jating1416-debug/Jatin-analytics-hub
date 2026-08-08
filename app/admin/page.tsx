import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import StatCard from '@/components/admin/StatCard';

export const dynamic = 'force-dynamic';

// ADMIN DASHBOARD v2 - animated stats + comments + views-per-category chart
export default async function AdminDashboard() {
  let stats = { total: 0, published: 0, drafts: 0, views: 0, categories: 0, comments: 0 };
  let recent: any[] = [];
  let recentComments: any[] = [];
  let catViews: { name: string; slug: string; views: number; count: number }[] = [];
  let dbError = false;

  try {
    stats.total = await prisma.article.count();
    stats.published = await prisma.article.count({ where: { status: 'PUBLISHED' } });
    stats.drafts = await prisma.article.count({ where: { status: 'DRAFT' } });
    const agg = await prisma.article.aggregate({ _sum: { viewCount: true } });
    stats.views = agg._sum.viewCount || 0;
    stats.categories = await prisma.category.count();
    recent = await prisma.article.findMany({ include: { category: true }, orderBy: { updatedAt: 'desc' }, take: 6 });

    // comments (Comment table — agar abhi tak push nahi hui to gracefully skip)
    try {
      stats.comments = await prisma.comment.count();
      recentComments = await prisma.comment.findMany({
        include: { article: { select: { title: true, slug: true, category: { select: { slug: true } } } } },
        orderBy: { createdAt: 'desc' },
        take: 5,
      });
    } catch (e) {
      console.error('comments not available (prisma db push pending):', e);
    }

    // views per category
    const cats = await prisma.category.findMany({ include: { articles: { select: { viewCount: true } } } });
    catViews = cats
      .map((c) => ({
        name: c.name,
        slug: c.slug,
        views: c.articles.reduce((s, a) => s + a.viewCount, 0),
        count: c.articles.length,
      }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 6);
  } catch (e) {
    dbError = true;
    console.error('Admin dashboard DB error:', e);
  }

  if (dbError) {
    return (
      <div className="category-empty" style={{ display: 'block' }}>
        <p>⚠️ Database se connect nahi ho paya.</p>
        <p style={{ fontSize: '0.8rem' }}>DATABASE_URL check karo — Supabase paused? Pooler URL?</p>
      </div>
    );
  }

  const maxCatViews = Math.max(1, ...catViews.map((c) => c.views));
  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <>
      {/* WELCOME HEADER */}
      <div className="admin-page-head">
        <div>
          <h1>📊 Dashboard</h1>
          <p className="admin-page-sub">Welcome back, Jatin — aaj ka overview {today}</p>
        </div>
        <Link href="/admin/articles/new" className="admin-cta-btn">
          <i className="fas fa-plus" /> New Article
        </Link>
      </div>

      {/* STAT CARDS */}
      <div className="admin-stats-grid">
        <StatCard label="Total Articles" value={stats.total} icon="fa-file-lines" grad="linear-gradient(135deg,#4f46e5,#7c3aed)" />
        <StatCard label="Published" value={stats.published} icon="fa-circle-check" grad="linear-gradient(135deg,#10b981,#059669)" />
        <StatCard label="Drafts" value={stats.drafts} icon="fa-pen" grad="linear-gradient(135deg,#f59e0b,#d97706)" />
        <StatCard label="Total Views" value={stats.views} icon="fa-eye" grad="linear-gradient(135deg,#06b6d4,#0891b2)" />
        <StatCard label="Categories" value={stats.categories} icon="fa-folder-tree" grad="linear-gradient(135deg,#f43f5e,#e11d48)" />
        <StatCard label="Comments" value={stats.comments} icon="fa-comments" grad="linear-gradient(135deg,#8b5cf6,#6d28d9)" hint={stats.comments === 0 ? 'npx prisma db push ke baad live' : undefined} />
      </div>

      {/* QUICK ACTIONS */}
      <div className="admin-quick-actions">
        <Link href="/admin/articles" className="admin-quick-btn"><i className="fas fa-file-lines" /> Manage Articles</Link>
        <Link href="/admin/categories" className="admin-quick-btn"><i className="fas fa-folder-tree" /> Categories</Link>
        <Link href="/admin/analytics" className="admin-quick-btn"><i className="fas fa-chart-line" /> Analytics</Link>
        <Link href="/admin/articles/new" className="admin-quick-btn primary"><i className="fas fa-pen-to-square" /> Write New Post</Link>
      </div>

      <div className="admin-dash-grid">
        {/* RECENTLY UPDATED */}
        <div className="admin-panel">
          <div className="admin-panel-head">
            <h2><i className="fas fa-clock-rotate-left" /> Recently Updated</h2>
            <Link href="/admin/articles" className="admin-panel-link">View all <i className="fas fa-arrow-right" /></Link>
          </div>
          {recent.length === 0 ? (
            <p style={{ fontSize: '0.85rem', color: 'var(--text-light)', padding: 10 }}>
              Abhi koi article nahi — <Link href="/admin/articles/new">nayi post banao</Link>!
            </p>
          ) : (
            <div className="admin-list">
              {recent.map((a, i) => (
                <Link key={a.id} href={`/admin/articles/${a.id}/edit`} className="admin-list-row">
                  <span className="admin-list-rank">{i + 1}</span>
                  <span className="admin-list-title">{a.title.slice(0, 60)}</span>
                  {a.category && <span className="admin-chip">{a.category.name}</span>}
                  <span className={`admin-status-pill ${a.status === 'PUBLISHED' ? 'pub' : 'draft'}`}>
                    {a.status === 'PUBLISHED' ? 'PUBLISHED' : 'DRAFT'}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* VIEWS PER CATEGORY */}
        <div className="admin-panel">
          <div className="admin-panel-head">
            <h2><i className="fas fa-chart-simple" /> Views by Category</h2>
          </div>
          {catViews.length === 0 ? (
            <p style={{ fontSize: '0.85rem', color: 'var(--text-light)', padding: 10 }}>Abhi data nahi.</p>
          ) : (
            <div className="admin-bars">
              {catViews.map((c) => (
                <div key={c.slug} className="admin-bar-row">
                  <span className="admin-bar-label">{c.name}</span>
                  <div className="admin-bar-track">
                    <div className="admin-bar-fill" style={{ width: `${Math.max(4, (c.views / maxCatViews) * 100)}%` }} />
                  </div>
                  <span className="admin-bar-value">{c.views.toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RECENT COMMENTS */}
        <div className="admin-panel">
          <div className="admin-panel-head">
            <h2><i className="fas fa-comments" /> Recent Comments</h2>
            {stats.comments === 0 && <span className="admin-chip">table pending</span>}
          </div>
          {stats.comments === 0 ? (
            <p style={{ fontSize: '0.85rem', color: 'var(--text-light)', padding: 10, lineHeight: 1.7 }}>
              Comment table abhi nahi bani hai. Project folder mein ek baar chalao:<br />
              <code style={{ background: 'var(--bg)', padding: '3px 8px', borderRadius: 6, fontSize: '0.78rem' }}>npx prisma db push</code>
            </p>
          ) : recentComments.length === 0 ? (
            <p style={{ fontSize: '0.85rem', color: 'var(--text-light)', padding: 10 }}>Abhi koi comment nahi aaya.</p>
          ) : (
            <div className="admin-list">
              {recentComments.map((c) => (
                <div key={c.id} className="admin-comment-row">
                  <span className="admin-comment-avatar">💬</span>
                  <div className="admin-comment-body">
                    <div className="admin-comment-top">
                      <b>{c.name}</b>
                      <span className="admin-comment-date">
                        {new Date(c.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </span>
                    </div>
                    <div className="admin-comment-text">{c.content.slice(0, 90)}{c.content.length > 90 ? '…' : ''}</div>
                    {c.article && (
                      <a
                        className="admin-comment-link"
                        href={`/${c.article.category?.slug || 'post'}/${c.article.slug}`}
                        target="_blank"
                        rel="noopener"
                      >
                        on: {c.article.title.slice(0, 40)}
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

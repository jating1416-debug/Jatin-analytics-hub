import { prisma } from '@/lib/prisma';
import StatCard from '@/components/admin/StatCard';

export const dynamic = 'force-dynamic';

// ADMIN ANALYTICS v2 - donut chart, top posts, category views, reading hours
export default async function AdminAnalytics() {
  let stats: any = null;
  let dbError = false;
  try {
    const totalViews = await prisma.article.aggregate({ _sum: { viewCount: true } });
    const totalPosts = await prisma.article.count();
    const published = await prisma.article.count({ where: { status: 'PUBLISHED' } });
    const drafts = await prisma.article.count({ where: { status: 'DRAFT' } });
    const topPosts = await prisma.article.findMany({ orderBy: { viewCount: 'desc' }, take: 10, include: { category: true } });
    const cats = await prisma.category.findMany({ include: { articles: { select: { viewCount: true, readingTime: true } } } });

    // reading minutes: readingTime * views (approx)
    let readingMinutes = 0;
    try {
      const allArts = await prisma.article.findMany({ select: { viewCount: true, readingTime: true } });
      readingMinutes = allArts.reduce((s, a) => s + (a.readingTime || 3) * a.viewCount, 0);
    } catch {}

    stats = {
      totalViews: totalViews._sum.viewCount || 0,
      totalPosts,
      published,
      drafts,
      topPosts,
      catViews: cats
        .map((c: any) => ({
          name: c.name,
          slug: c.slug,
          posts: c.articles.length,
          views: c.articles.reduce((s: number, a: any) => s + a.viewCount, 0),
        }))
        .sort((a: any, b: any) => b.views - a.views),
      readingHours: Math.round(readingMinutes / 60),
    };
  } catch (e) {
    dbError = true;
    console.error('Analytics error:', e);
  }

  if (dbError) {
    return (
      <div className="category-empty" style={{ display: 'block' }}>
        <p>⚠️ Database se connect nahi ho paya.</p>
      </div>
    );
  }

  const maxView = Math.max(1, ...stats.topPosts.map((p: any) => p.viewCount));
  const maxCatPosts = Math.max(1, ...stats.catViews.map((c: any) => c.posts));
  const maxCatViews = Math.max(1, ...stats.catViews.map((c: any) => c.views));

  // donut chart (CSS conic-gradient)
  const totalForDonut = Math.max(1, stats.published + stats.drafts);
  const pubPct = Math.round((stats.published / totalForDonut) * 100);
  const donutStyle = {
    background: `conic-gradient(#10b981 0% ${pubPct}%, #f59e0b ${pubPct}% 100%)`,
  };

  return (
    <>
      <div className="admin-page-head">
        <div>
          <h1>📈 Analytics</h1>
          <p className="admin-page-sub">Sirf aapko dikhta hai — public pages pe views kabhi nahi dikhenge</p>
        </div>
      </div>

      {/* STATS */}
      <div className="admin-stats-grid">
        <StatCard label="Total Views" value={stats.totalViews} icon="fa-eye" grad="linear-gradient(135deg,#4f46e5,#7c3aed)" />
        <StatCard label="Total Posts" value={stats.totalPosts} icon="fa-file-lines" grad="linear-gradient(135deg,#06b6d4,#0891b2)" />
        <StatCard label="Published" value={stats.published} icon="fa-circle-check" grad="linear-gradient(135deg,#10b981,#059669)" />
        <StatCard label="Drafts" value={stats.drafts} icon="fa-pen" grad="linear-gradient(135deg,#f59e0b,#d97706)" />
        <StatCard label="Reading Hours" value={stats.readingHours} icon="fa-book-open" grad="linear-gradient(135deg,#f43f5e,#e11d48)" />
      </div>

      <div className="admin-dash-grid">
        {/* DONUT: PUBLISHED VS DRAFT */}
        <div className="admin-panel">
          <div className="admin-panel-head">
            <h2><i className="fas fa-chart-pie" /> Published vs Drafts</h2>
          </div>
          <div className="admin-donut-wrap">
            <div className="admin-donut" style={donutStyle}>
              <div className="admin-donut-hole">
                <b>{stats.published}</b>
                <span>published</span>
              </div>
            </div>
            <div className="admin-donut-legend">
              <div className="admin-legend-item">
                <span className="admin-legend-dot" style={{ background: '#10b981' }} /> Published — {stats.published} ({pubPct}%)
              </div>
              <div className="admin-legend-item">
                <span className="admin-legend-dot" style={{ background: '#f59e0b' }} /> Drafts — {stats.drafts} ({100 - pubPct}%)
              </div>
            </div>
          </div>
        </div>

        {/* CATEGORY-WISE */}
        <div className="admin-panel">
          <div className="admin-panel-head">
            <h2><i className="fas fa-folder-tree" /> Category-wise Posts</h2>
          </div>
          <div className="admin-bars">
            {stats.catViews.map((c: any) => (
              <div key={c.slug} className="admin-bar-row">
                <span className="admin-bar-label">{c.name}</span>
                <div className="admin-bar-track">
                  <div className="admin-bar-fill violet" style={{ width: `${Math.max(4, (c.posts / maxCatPosts) * 100)}%` }} />
                </div>
                <span className="admin-bar-value">{c.posts}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CATEGORY VIEWS */}
        <div className="admin-panel">
          <div className="admin-panel-head">
            <h2><i className="fas fa-eye" /> Views by Category</h2>
          </div>
          <div className="admin-bars">
            {stats.catViews.map((c: any) => (
              <div key={c.slug} className="admin-bar-row">
                <span className="admin-bar-label">{c.name}</span>
                <div className="admin-bar-track">
                  <div className="admin-bar-fill cyan" style={{ width: `${Math.max(4, (c.views / maxCatViews) * 100)}%` }} />
                </div>
                <span className="admin-bar-value">{c.views.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        {/* TOP 10 ARTICLES */}
        <div className="admin-panel">
          <div className="admin-panel-head">
            <h2><i className="fas fa-trophy" /> Top 10 Articles by Views</h2>
          </div>
          <div className="admin-top-list">
            {stats.topPosts.map((p: any, i: number) => (
              <div key={p.id} className="admin-top-row">
                <span className={`admin-rank-medal${i < 3 ? ' top' : ''}`}>{i < 3 ? ['🥇', '🥈', '🥉'][i] : `#${i + 1}`}</span>
                <div className="admin-top-info">
                  <div className="admin-top-title">{p.title.slice(0, 60)}</div>
                  <div className="admin-bar-track">
                    <div className="admin-bar-fill" style={{ width: `${Math.max(4, (p.viewCount / maxView) * 100)}%` }} />
                  </div>
                </div>
                <span className="admin-top-views">{p.viewCount.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

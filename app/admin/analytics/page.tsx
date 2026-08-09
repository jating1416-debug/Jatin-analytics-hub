import { prisma } from '@/lib/prisma';
import StatCard from '@/components/admin/StatCard';

export const dynamic = 'force-dynamic';

// ADMIN ANALYTICS v3 - FAST
// FIX: Pehle 9 sequential queries -> ab 4-5:
//   1) saari articles (ek select) -> total/published/drafts/views/reading/top10 sab isi se
//   2) categories + views per category
//   3) pageview trend (30 din)
//   4) top searches (optional)
export default async function AdminAnalytics() {
  let stats: any = null;
  let dbError = false;
  try {
    // ---- QUERY 1: saari articles (viewCount desc - top10 ke liye bhi ready) ----
    const articles = await prisma.article.findMany({
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
        viewCount: true,
        readingTime: true,
        category: { select: { name: true, slug: true } },
      },
      orderBy: { viewCount: 'desc' },
      take: 200,
    });

    const totalViews = articles.reduce((s, a) => s + a.viewCount, 0);
    const totalPosts = articles.length;
    const published = articles.filter((a) => a.status === 'PUBLISHED').length;
    const drafts = articles.filter((a) => a.status === 'DRAFT').length;
    const topPosts = articles.filter((a) => a.status === 'PUBLISHED').slice(0, 10);
    const readingMinutes = articles.reduce((s, a) => s + (a.readingTime || 3) * a.viewCount, 0);

    // ---- QUERY 2: categories + views ----
    const cats = await prisma.category.findMany({
      include: {
        _count: { select: { articles: true } },
        articles: { select: { viewCount: true } },
      },
    });
    const catViews = cats
      .map((c: any) => ({
        name: c.name,
        slug: c.slug,
        posts: c._count.articles,
        views: c.articles.reduce((s: number, a: any) => s + a.viewCount, 0),
      }))
      .sort((a: any, b: any) => b.views - a.views);

    // ---- QUERY 3: views trend (30 din, PageView table) ----
    let trend: { day: string; count: number }[] = [];
    try {
      const since = new Date();
      since.setDate(since.getDate() - 29);
      since.setHours(0, 0, 0, 0);
      const rows = await prisma.pageView.findMany({
        where: { createdAt: { gte: since } },
        select: { createdAt: true },
      });
      const byDay = new Map<string, number>();
      rows.forEach((r) => {
        const key = r.createdAt.toISOString().slice(0, 10);
        byDay.set(key, (byDay.get(key) || 0) + 1);
      });
      trend = [];
      for (let i = 29; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const key = d.toISOString().slice(0, 10);
        trend.push({ day: key, count: byDay.get(key) || 0 });
      }
    } catch (e) { console.error('trend error:', e); }

    // ---- QUERY 4: top searches (optional) ----
    let topSearches: { term: string; count: number }[] = [];
    try {
      const logs = await prisma.searchLog.findMany({
        where: { createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
        select: { term: true },
      });
      const byTerm = new Map<string, number>();
      logs.forEach((l) => byTerm.set(l.term, (byTerm.get(l.term) || 0) + 1));
      topSearches = Array.from(byTerm.entries())
        .map(([term, count]) => ({ term, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);
    } catch (e) { console.error('top searches error:', e); }

    stats = {
      totalViews,
      totalPosts,
      published,
      drafts,
      topPosts,
      catViews,
      readingHours: Math.round(readingMinutes / 60),
      trend,
      topSearches,
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

      {/* VIEWS TREND - last 30 days */}
      <div className="admin-panel" style={{ marginBottom: 18 }}>
        <div className="admin-panel-head">
          <h2><i className="fas fa-chart-line" /> Views — Last 30 Days</h2>
          <span className="admin-chip">
            {stats.trend.reduce((s: number, d: any) => s + d.count, 0)} views recorded
          </span>
        </div>
        {stats.trend.length === 0 ? (
          <p style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>
            Abhi data nahi — views record hone lageinge (PageView table).
          </p>
        ) : (
          <div className="admin-trend">
            {(() => {
              const max = Math.max(1, ...stats.trend.map((d: any) => d.count));
              const total = stats.trend.reduce((s: number, d: any) => s + d.count, 0);
              return stats.trend.map((d: any) => (
                <div key={d.day} className="admin-trend-col" title={`${d.day}: ${d.count} views`}>
                  <div
                    className="admin-trend-bar"
                    style={{ height: `${Math.max(3, (d.count / max) * 100)}%` }}
                  />
                  <span className="admin-trend-day">{d.day.slice(8)}</span>
                </div>
              ));
            })()}
          </div>
        )}
      </div>

      <div className="admin-dash-grid">
        {/* TOP SEARCHES */}
        <div className="admin-panel">
          <div className="admin-panel-head">
            <h2><i className="fas fa-magnifying-glass" /> Top Searches (30 days)</h2>
            {stats.topSearches.length === 0 && <span className="admin-chip">db push pending</span>}
          </div>
          {stats.topSearches.length === 0 ? (
            <p style={{ fontSize: '0.85rem', color: 'var(--text-light)', lineHeight: 1.7 }}>
              Logo ne kya search kiya ye yahan dikhega. Search hone shuru hone ke baad data bhar
              jayega. (SearchLog table)
            </p>
          ) : (
            <div className="admin-bars">
              {stats.topSearches.map((s: any) => (
                <div key={s.term} className="admin-bar-row">
                  <span className="admin-bar-label">🔍 {s.term}</span>
                  <div className="admin-bar-track">
                    <div className="admin-bar-fill" style={{ width: `${Math.max(5, (s.count / stats.topSearches[0].count) * 100)}%` }} />
                  </div>
                  <span className="admin-bar-value">{s.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>

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

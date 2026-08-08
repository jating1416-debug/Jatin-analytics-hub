import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function AdminAnalytics() {
  let stats: any = null;
  let dbError = false;
  try {
    const [totalViews, totalPosts, published, drafts, topPosts, catViews] = await Promise.all([
      prisma.article.aggregate({ _sum: { viewCount: true } }),
      prisma.article.count(),
      prisma.article.count({ where: { status: 'PUBLISHED' } }),
      prisma.article.count({ where: { status: 'DRAFT' } }),
      prisma.article.findMany({ orderBy: { viewCount: 'desc' }, take: 10, include: { category: true } }),
      prisma.category.findMany({ include: { _count: { select: { articles: true } } } }),
    ]);
    stats = {
      totalViews: totalViews._sum.viewCount || 0,
      totalPosts,
      published,
      drafts,
      topPosts,
      catViews,
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
  const maxCat = Math.max(1, ...stats.catViews.map((c: any) => c._count.articles));

  return (
    <>
      <h2 className="section-title">📈 Analytics (Sirf Admin Ko Dikhta Hai)</h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Total Views', value: stats.totalViews.toLocaleString(), icon: '👁️' },
          { label: 'Total Posts', value: stats.totalPosts, icon: '📄' },
          { label: 'Published', value: stats.published, icon: '✅' },
          { label: 'Drafts', value: stats.drafts, icon: '📝' },
        ].map((c) => (
          <div key={c.label} className="sidebar-widget" style={{ marginBottom: 0, padding: '16px 18px' }}>
            <div style={{ fontSize: '1.4rem', marginBottom: 6 }}>{c.icon}</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-dark)' }}>{c.value}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-light)', fontWeight: 600 }}>{c.label}</div>
          </div>
        ))}
      </div>

      <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 12 }}>🏆 Top 10 Articles by Views</h3>
      <div className="sidebar-widget" style={{ padding: '14px 18px' }}>
        {stats.topPosts.map((p: any, i: number) => (
          <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <span style={{ fontWeight: 800, width: 24, color: i < 3 ? 'var(--primary)' : 'var(--text-light)' }}>#{i + 1}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dark)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.title.slice(0, 60)}</div>
              <div style={{ height: 6, background: 'var(--bg)', borderRadius: 3, marginTop: 4 }}>
                <div style={{ height: 6, width: `${(p.viewCount / maxView) * 100}%`, background: 'var(--gradient)', borderRadius: 3 }} />
              </div>
            </div>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-dark)', whiteSpace: 'nowrap' }}>{p.viewCount}</span>
          </div>
        ))}
      </div>

      <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 20, }}>🗂️ Category-wise Posts</h3>
      <div className="sidebar-widget" style={{ padding: '14px 18px' }}>
        {stats.catViews.map((c: any) => (
          <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, width: 140 }}>{c.name}</span>
            <div style={{ flex: 1, height: 8, background: 'var(--bg)', borderRadius: 4 }}>
              <div style={{ height: 8, width: `${(c._count.articles / maxCat) * 100}%`, background: 'var(--secondary)', borderRadius: 4 }} />
            </div>
            <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>{c._count.articles}</span>
          </div>
        ))}
      </div>
    </>
  );
}

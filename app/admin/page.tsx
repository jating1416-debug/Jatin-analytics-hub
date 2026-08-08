import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  let stats = { total: 0, published: 0, drafts: 0, views: 0, categories: 0 };
  let recent: any[] = [];
  let dbError = false;

  try {
    const [total, published, drafts, views, categories, recentArts] = await Promise.all([
      prisma.article.count(),
      prisma.article.count({ where: { status: 'PUBLISHED' } }),
      prisma.article.count({ where: { status: 'DRAFT' } }),
      prisma.article.aggregate({ _sum: { viewCount: true } }),
      prisma.category.count(),
      prisma.article.findMany({
        include: { category: true },
        orderBy: { updatedAt: 'desc' },
        take: 5,
      }),
    ]);
    stats = { total, published, drafts, views: views._sum.viewCount || 0, categories };
    recent = recentArts;
  } catch (e) {
    dbError = true;
    console.error('Admin dashboard DB error:', e);
  }

  if (dbError) {
    return (
      <div className="category-empty" style={{ display: 'block' }}>
        <p>⚠️ Database se connect nahi ho paya.</p>
        <p style={{ fontSize: '0.8rem' }}>DATABASE_URL env var check karo — Vercel Settings → Environment Variables.</p>
      </div>
    );
  }

  const cards = [
    { label: 'Total Articles', value: stats.total, icon: '📄' },
    { label: 'Published', value: stats.published, icon: '✅' },
    { label: 'Drafts', value: stats.drafts, icon: '📝' },
    { label: 'Total Views', value: stats.views.toLocaleString(), icon: '👁️' },
    { label: 'Categories', value: stats.categories, icon: '🗂️' },
  ];

  return (
    <>
      <h2 className="section-title">📊 Dashboard</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 24 }}>
        {cards.map((c) => (
          <div key={c.label} className="sidebar-widget" style={{ marginBottom: 0, padding: '16px 18px' }}>
            <div style={{ fontSize: '1.4rem', marginBottom: 6 }}>{c.icon}</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-dark)' }}>{c.value}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-light)', fontWeight: 600 }}>{c.label}</div>
          </div>
        ))}
      </div>

      <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 12 }}>🕐 Recently Updated</h3>
      <div className="sidebar-widget" style={{ padding: '14px 18px' }}>
        {recent.length === 0 ? (
          <p style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>Abhi koi article nahi — <Link href="/admin/articles/new">nayi post banao</Link>!</p>
        ) : (
          <ul className="hub-list">
            {recent.map((a) => (
              <li key={a.id}>
                <Link href={`/admin/articles/${a.id}/edit`}>
                  {a.title.slice(0, 60)}
                  <span
                    style={{
                      float: 'right', fontSize: '0.68rem', fontWeight: 700,
                      color: a.status === 'PUBLISHED' ? '#16a34a' : '#f59e0b',
                    }}
                  >
                    {a.status === 'PUBLISHED' ? 'PUBLISHED' : 'DRAFT'}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}

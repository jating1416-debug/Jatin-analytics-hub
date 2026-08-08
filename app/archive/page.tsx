import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { formatDate } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function ArchivePage() {
  let articles: any[] = [];
  let dbError = false;
  try {
    articles = await prisma.article.findMany({
      where: { status: 'PUBLISHED' },
      include: { category: true },
      orderBy: { publishedAt: 'desc' },
      take: 500,
    });
  } catch (e) {
    dbError = true;
    console.error('Archive error:', e);
  }

  if (dbError) {
    return (
      <div className="layout-wrapper">
        <main className="posts-section">
          <div className="category-empty" style={{ display: 'block' }}>
            <p>⚠️ Database se connect nahi ho paya.</p>
          </div>
        </main>
      </div>
    );
  }

  // group by year-month
  const months: Record<string, typeof articles> = {};
  articles.forEach((a) => {
    const d = new Date(a.publishedAt || a.createdAt);
    const key = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    (months[key] = months[key] || []).push(a);
  });

  return (
    <div className="layout-wrapper">
      <main className="posts-section">
        <h2 className="section-title">🗓️ Archive ({articles.length} Posts)</h2>

        {Object.entries(months).map(([month, posts]) => (
          <div key={month} className="sidebar-widget" style={{ marginBottom: 16 }}>
            <div className="widget-title" style={{ fontSize: '0.95rem' }}>{month} <span style={{ color: 'var(--text-light)', fontWeight: 600 }}>({posts.length})</span></div>
            <ul className="hub-list">
              {posts.map((p) => (
                <li key={p.id}>
                  <Link href={`/${p.category?.slug || 'post'}/${p.slug}`} style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
                    <span style={{ fontWeight: 600, fontSize: '0.88rem' }}>{p.title.slice(0, 70)}</span>
                    <span style={{ color: 'var(--text-light)', fontSize: '0.75rem', whiteSpace: 'nowrap' }}>{formatDate(p.publishedAt || p.createdAt)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </main>
    </div>
  );
}

import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { formatDate } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function AdminArticlesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const sp = await searchParams;
  const status = sp.status || 'ALL';
  const q = sp.q || '';

  const where: any = {};
  if (status !== 'ALL') where.status = status;
  if (q) where.OR = [{ title: { contains: q, mode: 'insensitive' } }, { slug: { contains: q, mode: 'insensitive' } }];

  const articles = await prisma.article.findMany({
    where,
    include: { category: true },
    orderBy: { updatedAt: 'desc' },
    take: 200,
  });

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginBottom: 16 }}>
        <h2 className="section-title" style={{ marginBottom: 0 }}>📄 All Articles ({articles.length})</h2>
        <Link className="read-more-btn" href="/admin/articles/new"><i className="fas fa-plus" /> New Article</Link>
      </div>

      <form method="get" style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <input
          name="q" defaultValue={q} placeholder="Search title..."
          style={{
            flex: 1, padding: '9px 14px', border: '1px solid var(--border)', borderRadius: 10,
            background: 'var(--bg)', color: 'var(--text-dark)', outline: 'none', fontSize: '0.85rem',
          }}
        />
        <select
          name="status" defaultValue={status}
          style={{ padding: '9px 12px', border: '1px solid var(--border)', borderRadius: 10, background: 'var(--bg)', color: 'var(--text-dark)' }}
        >
          <option value="ALL">All</option>
          <option value="PUBLISHED">Published</option>
          <option value="DRAFT">Draft</option>
          <option value="ARCHIVED">Archived</option>
        </select>
        <button type="submit" className="read-more-btn">Filter</button>
      </form>

      <div className="sidebar-widget" style={{ padding: 0, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
          <thead>
            <tr style={{ background: 'var(--bg)' }}>
              <th style={{ padding: '10px 12px', textAlign: 'left' }}>Title</th>
              <th style={{ padding: '10px 12px', textAlign: 'left' }}>Category</th>
              <th style={{ padding: '10px 12px', textAlign: 'left' }}>Status</th>
              <th style={{ padding: '10px 12px', textAlign: 'left' }}>Views</th>
              <th style={{ padding: '10px 12px', textAlign: 'left' }}>Updated</th>
              <th style={{ padding: '10px 12px', textAlign: 'left' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {articles.map((a) => (
              <tr key={a.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '9px 12px', maxWidth: 260 }}>
                  <Link href={`/admin/articles/${a.id}/edit`} style={{ fontWeight: 600 }}>
                    {a.title.slice(0, 55)}
                  </Link>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-light)' }}>/{a.category?.slug || 'post'}/{a.slug}</div>
                </td>
                <td style={{ padding: '9px 12px' }}>{a.category?.name || '-'}</td>
                <td style={{ padding: '9px 12px' }}>
                  <span style={{
                    fontSize: '0.68rem', fontWeight: 700, padding: '3px 9px', borderRadius: 12,
                    background: a.status === 'PUBLISHED' ? 'rgba(22,163,74,0.14)' : a.status === 'DRAFT' ? 'rgba(245,158,11,0.14)' : 'rgba(100,116,139,0.15)',
                    color: a.status === 'PUBLISHED' ? '#16a34a' : a.status === 'DRAFT' ? '#f59e0b' : '#64748b',
                  }}>
                    {a.status}
                  </span>
                </td>
                <td style={{ padding: '9px 12px' }}>{a.viewCount}</td>
                <td style={{ padding: '9px 12px', fontSize: '0.72rem' }}>{formatDate(a.updatedAt)}</td>
                <td style={{ padding: '9px 12px', whiteSpace: 'nowrap' }}>
                  <Link href={`/admin/articles/${a.id}/edit`} style={{ color: 'var(--primary)', marginRight: 8 }}><i className="fas fa-edit" /> Edit</Link>
                  <a
                    href={`/${a.category?.slug || 'post'}/${a.slug}`}
                    target="_blank" rel="noopener"
                    style={{ color: 'var(--text-light)', marginRight: 8 }}
                  >
                    <i className="fas fa-eye" /> View
                  </a>
                </td>
              </tr>
            ))}
            {articles.length === 0 && (
              <tr><td colSpan={6} style={{ padding: 20, textAlign: 'center', color: 'var(--text-light)' }}>Koi article nahi mila.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}

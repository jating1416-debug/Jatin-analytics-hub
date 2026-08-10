import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import ArticleCard from '@/components/ArticleCard';

// PUBLIC SERIES PAGE - /series/slug - saare parts
export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  try {
    const s = await prisma.articleSeries.findUnique({ where: { slug } });
    if (s) return { title: `${s.title} — Series`, description: s.description || `Learn ${s.title} — complete series` };
  } catch {}
  return { title: 'Series' };
}

export default async function SeriesPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let series: any = null;
  try {
    series = await prisma.articleSeries.findUnique({
      where: { slug },
      include: {
        articles: {
          where: { status: 'PUBLISHED' },
          include: { category: true, author: { select: { name: true } } },
          orderBy: [{ seriesOrder: 'asc' }, { publishedAt: 'desc' }],
        },
      },
    });
  } catch (e) { console.error('series page error:', e); }
  if (!series) notFound();

  return (
    <div className="layout-wrapper">
      <main className="posts-section">
        <div className="breadcrumb" style={{ marginBottom: 18 }}>
          <a href="/" style={{ color: 'var(--primary)' }}><i className="fas fa-home" style={{ marginRight: 5 }} />Home</a>
          <span className="breadcrumb-sep">/</span>
          <span className="breadcrumb-current">Series: {series.title}</span>
        </div>

        <div className="post-content-wrapper" style={{ padding: 26, marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
            <div style={{ width: 52, height: 52, borderRadius: 15, background: 'var(--gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>🔗</div>
            <div style={{ flex: 1 }}>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{series.title}</h1>
              {series.description && <p style={{ color: 'var(--text-light)', fontSize: '0.88rem' }}>{series.description}</p>}
            </div>
            <span className="admin-count-badge">{series.articles.length} parts</span>
          </div>
        </div>

        {series.articles.length === 0 ? (
          <div className="category-empty" style={{ display: 'block' }}>
            <p>Is series mein abhi koi published article nahi.</p>
          </div>
        ) : (
          <div>
            {series.articles.map((a: any, i: number) => (
              <div key={a.id} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 16 }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--gradient)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, flexShrink: 0 }}>
                  {a.seriesOrder || i + 1}
                </div>
                <div style={{ flex: 1 }}>
                  <a href={`/${a.category?.slug || 'post'}/${a.slug}`} style={{ fontWeight: 700, color: 'var(--text-dark)', fontSize: '1rem' }}>
                    {a.title}
                  </a>
                  {i === 0 && <span className="admin-chip" style={{ marginLeft: 8 }}>START HERE</span>}
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginTop: 2 }}>
                    {a.category?.name} · {a.readingTime || 3} min read
                  </div>
                </div>
                <a href={`/${a.category?.slug || 'post'}/${a.slug}`} className="read-more-btn" style={{ textDecoration: 'none' }}>
                  Part {a.seriesOrder || i + 1} →
                </a>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import ArticleCard from '@/components/ArticleCard';
import { formatDate } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Jatin Kumar — Author',
  description: 'All articles by Jatin Kumar, Data Analyst educator.',
};

export default async function AuthorPage() {
  const articles = await prisma.article.findMany({
    where: { status: 'PUBLISHED' },
    include: { category: true, author: { select: { name: true } } },
    orderBy: { publishedAt: 'desc' },
    take: 100,
  });

  return (
    <div className="layout-wrapper">
      <main className="posts-section">
        <div className="post-content-wrapper" style={{ padding: 24, marginBottom: 24 }}>
          <div style={{ display: 'flex', gap: 18, alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>👤</div>
            <div style={{ flex: 1 }}>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Jatin Kumar</h1>
              <p style={{ color: 'var(--text-light)', fontSize: '0.88rem' }}>
                Data Analyst • SQL • Python • Power BI • Excel — {articles.length} articles published
              </p>
              <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                <a className="post-tag" href="https://jatinanalytics.co.in" target="_blank" rel="noopener">🌐 Portfolio</a>
                <a className="post-tag" href="https://github.com/jating1416-debug" target="_blank" rel="noopener">🐙 GitHub</a>
                <a className="post-tag" href="https://kaggle.com/jatinkhandelwal112" target="_blank" rel="noopener">🏆 Kaggle</a>
              </div>
            </div>
          </div>
        </div>

        <h2 className="section-title">📚 All Articles ({articles.length})</h2>
        {articles.map((a) => (
          <ArticleCard key={a.id} article={a} />
        ))}
      </main>
    </div>
  );
}

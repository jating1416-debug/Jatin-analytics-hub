import { prisma } from '@/lib/prisma';
import { buildSearchWhere, sortByRelevance } from '@/lib/search';
import ArticleCard from '@/components/ArticleCard';
import type { ArticleWithCategory } from '@/lib/types';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = { title: 'Search', description: 'Search Data Analytics tutorials.' };

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const sp = await searchParams;
  const q = (sp.q || '').trim();

  let articles: ArticleWithCategory[] = [];
  let dbError = false;
  if (q) {
    try {
    // BLOGGER-STYLE SEARCH: HAR word match hona chahiye (AND) +
    // relevance sort (title pehle) + policy pages excluded
    const words = q.toLowerCase().split(/\s+/).filter(Boolean).slice(0, 3);
    const found = await prisma.article.findMany({
      where: buildSearchWhere(words),
      include: { category: true, author: { select: { name: true } } },
      orderBy: { publishedAt: 'desc' },
      take: 50,
    });
    articles = sortByRelevance(found, words);
    } catch (e) { dbError = true; console.error('DB error search:', e); }
  }

  return (
    <div className="layout-wrapper">
      <main className="posts-section">
        <h2 className="section-title">
          🔍 {q ? `Search Results: "${q}"` : 'Search Posts'}
        </h2>
        <form action="/search" method="get" style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              name="q"
              defaultValue={q}
              placeholder="Search posts... (e.g. window function)"
              style={{
                flex: 1, padding: '10px 16px', border: '1px solid var(--border)',
                borderRadius: 24, background: 'var(--card-bg)', color: 'var(--text-dark)', outline: 'none',
              }}
            />
            <button type="submit" className="read-more-btn">Search</button>
          </div>
        </form>

        {dbError && (
          <div className="category-empty" style={{ display: 'block' }}>
            <p>⚠️ Database se connect nahi ho paya — thodi der baad try karo.</p>
          </div>
        )}
        {q && !dbError && articles.length === 0 && (
          <div className="category-empty" style={{ display: 'block' }}>
            <p>😕 "{q}" ke liye kuch nahi mila.</p>
            <p>Kisi aur keyword se try karo — SQL, Python, Power BI, Excel...</p>
          </div>
        )}
        {articles.map((a) => (
          <ArticleCard key={a.id} article={a} />
        ))}
      </main>
    </div>
  );
}

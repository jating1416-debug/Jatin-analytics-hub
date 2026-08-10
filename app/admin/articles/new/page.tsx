import { prisma } from '@/lib/prisma';
import ArticleEditor from '@/components/admin/ArticleEditor';

export const dynamic = 'force-dynamic';

export default async function NewArticlePage() {
  const categories = await prisma.category.findMany({ orderBy: { name: 'asc' } });

  // SERIES - gracefully handle (table exist na ho to bhi page khule)
  let seriesList: { id: number; title: string }[] = [];
  try {
    seriesList = await prisma.articleSeries.findMany({ orderBy: { title: 'asc' } });
  } catch (e) {
    console.error('series list error (db push pending?):', e);
  }

  return (
    <>
      <h2 className="section-title">✍️ New Article</h2>
      <ArticleEditor categories={categories} series={seriesList} />
    </>
  );
}

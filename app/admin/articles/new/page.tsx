import { prisma } from '@/lib/prisma';
import ArticleEditor from '@/components/admin/ArticleEditor';

export const dynamic = 'force-dynamic';

export default async function NewArticlePage() {
  const categories = await prisma.category.findMany({ orderBy: { name: 'asc' } });
  const seriesList = await prisma.articleSeries.findMany({ orderBy: { title: 'asc' } });
  return (
    <>
      <h2 className="section-title">✍️ New Article</h2>
      <ArticleEditor categories={categories} />
    </>
  );
}

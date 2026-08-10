import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import ArticleEditor from '@/components/admin/ArticleEditor';
import RevisionList from '@/components/admin/RevisionList';

export const dynamic = 'force-dynamic';

export default async function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // article + categories - graceful error handling (page kabhi crash na ho)
  let article: Awaited<ReturnType<typeof prisma.article.findUnique>> = null;
  try {
    article = await prisma.article.findUnique({
      where: { id: Number(id) },
      include: { tags: { include: { tag: true } } },
    });
  } catch (e) {
    console.error('edit article error:', e);
  }
  if (!article) notFound();

  let categories: { id: number; name: string; slug: string }[] = [];
  let seriesList: { id: number; title: string }[] = [];
  try {
    categories = await prisma.category.findMany({ orderBy: { name: 'asc' } });
  } catch (e) { console.error('categories error:', e); }
  try {
    seriesList = await prisma.articleSeries.findMany({ orderBy: { title: 'asc' } });
  } catch (e) {
    console.error('series list error (db push pending?):', e);
  }

  return (
    <>
      <h2 className="section-title">✏️ Edit: {article.title.slice(0, 40)}...</h2>
      <ArticleEditor
        categories={categories}
        series={seriesList.map((x) => ({ id: x.id, title: x.title }))}
        articleId={article.id}
        initial={{
          title: article.title,
          slug: article.slug,
          content: article.content,
          excerpt: article.excerpt || '',
          categoryId: article.categoryId,
          status: article.status,
          coverImage: article.coverImage || '',
          metaDescription: article.metaDescription || '',
          tags: article.tags.map((t) => t.tag.name),
          featured: article.featured,
          scheduledAt: article.scheduledAt ? new Date(article.scheduledAt.getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16) : null,
          noindex: article.noindex,
          seriesId: article.seriesId,
          seriesOrder: article.seriesOrder,
        }}
      />
      <RevisionList articleId={article.id} />
    </>
  );
}

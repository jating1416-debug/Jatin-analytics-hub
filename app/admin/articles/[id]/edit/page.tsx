import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import ArticleEditor from '@/components/admin/ArticleEditor';
import RevisionList from '@/components/admin/RevisionList';

export const dynamic = 'force-dynamic';

export default async function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const article = await prisma.article.findUnique({
    where: { id: Number(id) },
    include: { tags: { include: { tag: true } } },
  });
  if (!article) notFound();

  const categories = await prisma.category.findMany({ orderBy: { name: 'asc' } });
  const seriesList = await prisma.articleSeries.findMany({ orderBy: { title: 'asc' } });

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

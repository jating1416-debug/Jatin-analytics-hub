import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import ArticleEditor from '@/components/admin/ArticleEditor';

export const dynamic = 'force-dynamic';

export default async function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const article = await prisma.article.findUnique({
    where: { id: Number(id) },
    include: { tags: { include: { tag: true } } },
  });
  if (!article) notFound();

  const categories = await prisma.category.findMany({ orderBy: { name: 'asc' } });

  return (
    <>
      <h2 className="section-title">✏️ Edit: {article.title.slice(0, 40)}...</h2>
      <ArticleEditor
        categories={categories}
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
        }}
      />
    </>
  );
}

import type { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';
import { SITE_URL } from '@/lib/utils';

// 1000+ posts ke liye sitemap split (Google max 50,000 URLs per sitemap)
// NOTE: Agar build ke waqt DB unreachable ho to bhi build fail NAHI hoga -
// static URLs return ho jati hain (sitemap dobara publish hone pe refresh hota hai)
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticUrls: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: 'daily', priority: 1 },
    { url: `${SITE_URL}/search`, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${SITE_URL}/tools`, changeFrequency: 'monthly', priority: 0.6 },
  ];

  try {
    const categories = await prisma.category.findMany();
    const categoryUrls = categories.map((c) => ({
      url: `${SITE_URL}/category/${c.slug}`,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));

    const articles = await prisma.article.findMany({
      where: { status: 'PUBLISHED' },
      select: { slug: true, category: { select: { slug: true } }, updatedAt: true },
      orderBy: { publishedAt: 'desc' },
    });

    const articleUrls: MetadataRoute.Sitemap = articles.map((a) => ({
      url: `${SITE_URL}/${a.category?.slug || 'post'}/${a.slug}`,
      lastModified: a.updatedAt,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }));

    return [...staticUrls, ...categoryUrls, ...articleUrls];
  } catch (e) {
    // DB unavailable at build time - sirf static URLs return karo (build fail nahi hoga)
    return staticUrls;
  }
}

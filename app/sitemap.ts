import type { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';
import { SITE_URL } from '@/lib/utils';

// DYNAMIC SITEMAP - saari posts + categories + tags (1000+ posts ke liye ready)
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticUrls: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: 'daily', priority: 1 },
    { url: `${SITE_URL}/search`, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${SITE_URL}/tools`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/downloads`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/author/jatin`, changeFrequency: 'weekly', priority: 0.6 },
    { url: `${SITE_URL}/feed.xml`, changeFrequency: 'daily', priority: 0.3 },
    { url: `${SITE_URL}/p/about`, changeFrequency: 'yearly', priority: 0.4 },
    { url: `${SITE_URL}/p/privacy-policy`, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${SITE_URL}/p/disclaimer`, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${SITE_URL}/p/terms`, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${SITE_URL}/p/dmca`, changeFrequency: 'yearly', priority: 0.2 },
  ];

  try {
    // SEQUENTIAL (pooler connection_limit=1 ke saath safe)
    const categories = await prisma.category.findMany({ select: { slug: true } });
    const seriesList = await prisma.articleSeries.findMany({ select: { slug: true } }).catch(() => []);
    const tags = await prisma.tag.findMany({ select: { slug: true } });
    const articles = await prisma.article.findMany({
      where: { status: 'PUBLISHED' },
      select: { slug: true, category: { select: { slug: true } }, updatedAt: true },
      orderBy: { publishedAt: 'desc' },
    });

    const seriesUrls: MetadataRoute.Sitemap = (seriesList as any[]).map((s) => ({
      url: `${SITE_URL}/series/${s.slug}`,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));

    const categoryUrls: MetadataRoute.Sitemap = categories.map((c) => ({
      url: `${SITE_URL}/category/${c.slug}`,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));

    const tagUrls: MetadataRoute.Sitemap = tags.map((t) => ({
      url: `${SITE_URL}/tag/${t.slug}`,
      changeFrequency: 'weekly' as const,
      priority: 0.5,
    }));

    const articleUrls: MetadataRoute.Sitemap = articles.map((a) => ({
      url: `${SITE_URL}/${a.category?.slug || 'post'}/${a.slug}`,
      lastModified: a.updatedAt,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }));

    return [...staticUrls, ...seriesUrls, ...categoryUrls, ...tagUrls, ...articleUrls];
  } catch {
    return staticUrls;
  }
}

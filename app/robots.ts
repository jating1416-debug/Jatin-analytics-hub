import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/utils';
import { prisma } from '@/lib/prisma';

export const revalidate = 300;

export default async function robots(): Promise<MetadataRoute.Robots> {
  // Settings se custom robots text (admin) - fail ho to default
  try {
    const row = await prisma.setting.findUnique({ where: { key: 'site' } });
    if (row) {
      const s = JSON.parse(row.value);
      if (s?.robotsText && s.robotsText.trim()) {
        return { rules: [{ userAgent: '*', allow: '/' }], sitemap: `${SITE_URL}/sitemap.xml`, ...({} as any) } as any;
      }
    }
  } catch {}

  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/admin'] }],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}

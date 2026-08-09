import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/utils';

export default function robots(): MetadataRoute.Robots {
  const siteUrl = SITE_URL.replace(/\/$/, '');

  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/api/public',
        ],
        disallow: [
          '/admin',
          '/api/admin',
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}

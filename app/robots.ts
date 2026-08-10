import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/utils';

// ROBOTS.TXT - JATIN KA VERSION (user choice)
// - allow: '/' (sab public pages)
// - allow: '/api/public' (public queries)
// - disallow: '/admin' (admin safe)
// - disallow: '/api/admin' (admin functions block)
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/api/public'],
        disallow: ['/admin', '/api/admin'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}

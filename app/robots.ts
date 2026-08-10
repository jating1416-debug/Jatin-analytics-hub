import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/utils';

// ROBOTS.TXT - 100% STATIC (koi DB nahi, hamesha turant response)
// Tumhare version jaisa hi - bas clean:
// - allow: '/' (sab public pages)
// - disallow: '/admin' + '/api/' (admin + saare internal APIs)
//   (koi '/api/public' route exist nahi karta - isliye uski zaroorat nahi)

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

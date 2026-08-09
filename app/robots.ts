import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/utils';

// ROBOTS.TXT - 100% STATIC (koi DB nahi!)
// FIX: pehle DB lookup tha -> cold start pe timeout -> Lighthouse SEO 82
// "Fetch of robots.txt failed: Timed out" -> ab hamesha turant, kabhi fail nahi
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/api/'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}

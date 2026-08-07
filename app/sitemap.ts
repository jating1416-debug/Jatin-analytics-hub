import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/utils';

// 100% STATIC sitemap - build ke waqt DB ki zaroorat NAHI (build kabhi fail nahi hoga)
// Naye posts ka sitemap refresh hone ke liye: deploy ke baad Vercel rebuild trigger hota hai
// (ya phir aage admin panel se dynamic sitemap laga denge)
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: SITE_URL, changeFrequency: 'daily', priority: 1 },
    { url: `${SITE_URL}/search`, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${SITE_URL}/tools`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/category/sql`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE_URL}/category/python`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE_URL}/category/power-bi`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE_URL}/category/excel`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE_URL}/category/career`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE_URL}/category/interview-questions`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE_URL}/category/case-study`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE_URL}/category/misc`, changeFrequency: 'weekly', priority: 0.8 },
  ];
}

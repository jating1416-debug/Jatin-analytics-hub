// ============================================================
// SEARCH - SHARED LOGIC (Blogger-style + policy pages hatana)
// ============================================================

// Policy/info pages - ye kabhi bhi search/post list mein NAHI dikhenge
// (about, contact, dmca, privacy, terms, policies, image posts)
export const EXCLUDED_SLUGS: string[] = [
  'about', 'contact', 'dmca-policy', 'privacy-policy', 'terms',
  'disclaimer', 'copyright-policy', 'corrections-policy',
  'editorial-policy', 'cookie-policy', 'images', 'image',
];

// AND-logic where: HAR word title/excerpt/content mein match hona chahiye
// (Blogger jaisa - "window function" likha to dono words wali posts hi aayengi)
export function buildSearchWhere(words: string[]) {
  return {
    status: 'PUBLISHED' as const,
    slug: { notIn: EXCLUDED_SLUGS },
    AND: words.map((w) => ({
      OR: [
        { title: { contains: w, mode: 'insensitive' } },
        { excerpt: { contains: w, mode: 'insensitive' } },
        { content: { contains: w, mode: 'insensitive' } },
      ],
    })),
  };
}

// RELEVANCE SCORE: title match = 3, excerpt match = 2, content match = 1
export function scoreArticle(
  a: { title: string; excerpt?: string | null; content: string },
  words: string[]
): number {
  const title = a.title.toLowerCase();
  const excerpt = (a.excerpt || '').toLowerCase();
  const content = a.content.toLowerCase();
  let score = 0;
  for (const w of words) {
    if (title.includes(w)) score += 3;
    else if (excerpt.includes(w)) score += 2;
    else if (content.includes(w)) score += 1;
  }
  return score;
}

// SORT: relevance (score) desc, phir date desc
export function sortByRelevance<T extends {
  title: string;
  excerpt?: string | null;
  content: string;
  publishedAt?: Date | null;
}>(items: T[], words: string[]): T[] {
  return [...items].sort((a, b) => {
    const d = scoreArticle(b, words) - scoreArticle(a, words);
    if (d !== 0) return d;
    return (b.publishedAt?.getTime() || 0) - (a.publishedAt?.getTime() || 0);
  });
}

import { prisma } from '@/lib/prisma';
import { SITE_URL, SITE_NAME } from '@/lib/utils';

// RSS FEED - /feed.xml (subscribers ke liye)
export const revalidate = 60; // RSS 60s cache

export async function GET() {
  try {
    const articles = await prisma.article.findMany({
      where: { status: 'PUBLISHED' },
      include: { category: true },
      orderBy: { publishedAt: 'desc' },
      take: 50,
    });

    const items = articles
      .map((a) => {
        const url = `${SITE_URL}/${a.category?.slug || 'post'}/${a.slug}`;
        const desc = (a.excerpt || '').replace(/[<>&]/g, (m: string) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[m] as string));
        return `    <item>
      <title><![CDATA[${a.title}]]></title>
      <link>${url}</link>
      <guid>${url}</guid>
      <pubDate>${(a.publishedAt || a.createdAt).toUTCString()}</pubDate>
      <description><![CDATA[${desc}]]></description>
      <category>${a.category?.name || 'Data Analytics'}</category>
    </item>`;
      })
      .join('\n');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${SITE_NAME} — Data Analytics Blog</title>
    <link>${SITE_URL}</link>
    <description>SQL, Python, Power BI, Excel tutorials and career guidance for data analysts.</description>
    <language>en</language>
${items}
  </channel>
</rss>`;

    return new Response(xml, {
      headers: {
        'Content-Type': 'application/rss+xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch {
    return new Response('<?xml version="1.0"?><rss version="2.0"><channel><title>RSS</title></channel></rss>', {
      headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
    });
  }
}

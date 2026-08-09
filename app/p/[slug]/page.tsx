import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';

// /p/[slug] - DB se static pages render (admin Pages manager se bane)
// Note: /p/about, /p/contact waghera STATIC folders pehle milte hain - ye sirf DB pages ke liye
export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  try {
    const page = await prisma.page.findUnique({ where: { slug } });
    if (page && page.published) return { title: `${page.title} — Data Insights` };
  } catch {}
  return { title: 'Page' };
}

export default async function DbPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let page: { title: string; content: string } | null = null;
  try {
    const found = await prisma.page.findUnique({ where: { slug } });
    if (found && found.published) page = found;
  } catch (e) {
    console.error('db page error:', e);
  }
  if (!page) notFound();

  return (
    <div className="layout-wrapper">
      <main className="posts-section">
        <div className="post-content-wrapper" style={{ padding: 34 }}>
          <h1 className="article-title" style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: 18 }}>
            {page.title}
          </h1>
          <div
            className="post-body entry-content"
            style={{ fontSize: '1rem', lineHeight: 1.85, color: 'var(--text-light)' }}
            dangerouslySetInnerHTML={{ __html: page.content }}
          />
        </div>
      </main>
    </div>
  );
}

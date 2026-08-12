import { cache } from 'react';
import { prisma } from '@/lib/prisma';

// ============================================================
// ARTICLE EXTRAS (Prev/Next + Series + Related) - STREAMED
// ============================================================
// LCP FIX: pehle ye queries ARTICLE PAGE ke ANDAR hoti thin ->
// h1 (title) tab tak render nahi hota tha jab tak 4-5 DB queries
// complete na ho jaayein -> LCP 5.7s!
// Ab ye component Suspense ke andar STREAM hota hai:
//   1) getPost (1 query) -> h1 + content TURANT render
//   2) extras baad mein background mein aate hain (fallback = null)
// React cache() se dono components EK hi DB query share karte hain.

function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error('db-timeout')), ms);
    p.then((v) => { clearTimeout(t); resolve(v); })
     .catch((e) => { clearTimeout(t); reject(e); });
  });
}

export type ExtrasInput = {
  postId: number;
  categoryId?: number | null;
  publishedAt?: Date | null;
  seriesId?: number | null;
};

// EK hi query set - dono components (Nav + Related) share karte hain
// FIX: primitive args (postId, categoryId...) -> React cache() by VALUE
// dedupe karta hai (pehle object tha -> har call cache MISS -> queries
// 2x chalti thin -> Supabase slow pe db-timeout error spam)
export const getExtras = cache(async (
  postId: number,
  categoryId: number | null | undefined,
  publishedAt: Date | null | undefined,
  seriesId: number | null | undefined,
) => {
  let related: any[] = [];
  let prevPost: any = null;
  let nextPost: any = null;

  try {
    const older = await withTimeout(prisma.article.findMany({
      where: {
        status: 'PUBLISHED',
        categoryId: categoryId ?? undefined,
        publishedAt: { lt: publishedAt || new Date() },
      },
      include: { category: true },
      orderBy: { publishedAt: 'desc' },
      take: 4,
    }), 4000);
    prevPost = older[0] || null;
    related = older.slice(1, 4);

    nextPost = await withTimeout(prisma.article.findFirst({
      where: {
        status: 'PUBLISHED',
        categoryId: categoryId ?? undefined,
        publishedAt: { gt: publishedAt || new Date() },
      },
      include: { category: true },
      orderBy: { publishedAt: 'asc' },
    }), 4000);
  } catch (e) { console.error('related error (safely skipped):', e); }

  let seriesParts: any[] = [];
  let seriesPrev: any = null;
  let seriesNext: any = null;
  let seriesTitle: string | null = null;

  if (seriesId) {
    try {
      try {
        const s = await withTimeout((prisma as any).articleSeries.findUnique({ where: { id: seriesId } }), 4000);
        seriesTitle = s?.title || null;
      } catch (e) { console.error('series title error (safely skipped):', e); }
      seriesParts = await withTimeout(prisma.article.findMany({
        where: { status: 'PUBLISHED', seriesId },
        include: { category: true },
        orderBy: [{ seriesOrder: 'asc' }, { publishedAt: 'desc' }],
      }), 4000);
      const idx = seriesParts.findIndex((x: any) => x.id === postId);
      if (idx > 0) seriesPrev = seriesParts[idx - 1];
      if (idx >= 0 && idx < seriesParts.length - 1) seriesNext = seriesParts[idx + 1];
    } catch (e) { console.error('series parts error (safely skipped):', e); }
  }

  return { related, prevPost, nextPost, seriesParts, seriesPrev, seriesNext, seriesTitle };
});

// ---------- Prev/Next + Series nav (author box ke baad) ----------
export default async function ArticleExtrasNav(props: ExtrasInput) {
  const { prevPost, nextPost, seriesParts, seriesPrev, seriesNext, seriesTitle } = await getExtras(props.postId, props.categoryId, props.publishedAt, props.seriesId);

  return (
    <>
      {(prevPost || nextPost) && (
        <div className="post-nav" style={{ display: 'flex', justifyContent: 'space-between', gap: 14, margin: '30px 0 10px', flexWrap: 'wrap' }}>
          {prevPost && (
            <a className="post-nav-link" href={`/${prevPost.category?.slug || 'post'}/${prevPost.slug}`} style={{ flex: 1, background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 18px', textDecoration: 'none' }}>
              <span className="post-nav-label" style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', marginBottom: 6 }}><i className="fas fa-arrow-left" /> Previous Article</span>
              <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-dark)' }}>{prevPost.title.slice(0, 60)}</span>
            </a>
          )}
          {nextPost && (
            <a className="post-nav-link" href={`/${nextPost.category?.slug || 'post'}/${nextPost.slug}`} style={{ flex: 1, background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 18px', textDecoration: 'none', textAlign: 'right' }}>
              <span className="post-nav-label" style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', marginBottom: 6 }}>Next Article <i className="fas fa-arrow-right" /></span>
              <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-dark)' }}>{nextPost.title.slice(0, 60)}</span>
            </a>
          )}
        </div>
      )}

      {seriesParts.length > 1 && (
        <div className="series-nav" style={{ marginTop: 24 }}>
          <div className="series-nav-head">
            <i className="fas fa-list-ol" /> Series: {seriesTitle || 'Part Series'}
          </div>
          <div className="series-nav-parts">
            {seriesParts.map((sp, i) => (
              <a
                key={sp.id}
                href={`/${sp.category?.slug || 'post'}/${sp.slug}`}
                className={`series-nav-part${sp.id === props.postId ? ' current' : ''}`}
                title={sp.title}
              >
                {sp.seriesOrder || i + 1}
              </a>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, marginTop: 10, flexWrap: 'wrap' }}>
            {seriesPrev ? (
              <a href={`/${seriesPrev.category?.slug || 'post'}/${seriesPrev.slug}`} className="series-nav-link">
                <i className="fas fa-arrow-left" /> Part {seriesPrev.seriesOrder}: {seriesPrev.title.slice(0, 40)}
              </a>
            ) : <span />}
            {seriesNext ? (
              <a href={`/${seriesNext.category?.slug || 'post'}/${seriesNext.slug}`} className="series-nav-link">
                Part {seriesNext.seriesOrder}: {seriesNext.title.slice(0, 40)} <i className="fas fa-arrow-right" />
              </a>
            ) : <span />}
          </div>
        </div>
      )}
    </>
  );
}

// ---------- Related posts (comments ke baad) ----------
export async function RelatedPosts(props: ExtrasInput) {
  const { related } = await getExtras(props.postId, props.categoryId, props.publishedAt, props.seriesId);

  if (related.length === 0) return null;

  return (
    <div className="related-posts" style={{ marginTop: 30 }}>
      <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 20 }}>
        📚 More Articles Like This
      </h3>
      <div className="related-posts-grid">
        {related.map((r) => (
          <a key={r.id} className="related-post-card" href={`/${r.category?.slug || 'post'}/${r.slug}`} style={{ textDecoration: 'none' }}>
            <div className="related-post-card-body">
              <h4>{r.title}</h4>
              <div className="related-post-card-meta" style={{ color: 'var(--primary)', fontSize: '0.8rem', fontWeight: 700 }}><i className="fas fa-arrow-right" /> Read Article</div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

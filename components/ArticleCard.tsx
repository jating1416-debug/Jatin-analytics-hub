import Link from 'next/link';
import type { ArticleWithCategory } from '@/lib/types';
import { formatDate } from '@/lib/utils';

const CAT_ICONS: Record<string, string> = {
  sql: '🗄️',
  mysql: '🗄️',
  python: '🐍',
  'power-bi': '📈',
  excel: '📗',
  career: '💼',
  'interview-questions': '🎯',
  'case-study': '📁',
  uncategorized: '📝',
};
const CAT_ICON = (slug: string | null | undefined) => CAT_ICONS[slug || ''] || '📝';

// 7 din se kam purani post -> NEW badge
function isNewPost(d: Date | string | null | undefined): boolean {
  if (!d) return false;
  try {
    const diff = Date.now() - new Date(d).getTime();
    return diff >= 0 && diff < 7 * 24 * 60 * 60 * 1000;
  } catch { return false; }
}

export default function ArticleCard({ article }: { article: ArticleWithCategory }) {
  const catSlug = article.category?.slug || 'uncategorized';
  return (
    <div className="post-card" data-label={catSlug}>
      {/* PREMIUM THUMB STRIP - gradient + category icon */}
      <Link href={`/${catSlug}/${article.slug}`} className="post-thumb-strip" aria-label={article.title}>
        <span className="post-category-badge">{article.category?.name || 'Article'}</span>
        {isNewPost(article.publishedAt || article.createdAt) && (
          <span className="post-new-badge">✨ NEW</span>
        )}
        <span className="post-thumb-icon">{CAT_ICON(article.category?.slug)}</span>
        <span className="thumb-arrow"><i className="fas fa-arrow-right" /></span>
      </Link>
      <div className="post-body">
        <div className="post-meta">
          <span>
            <i className="fas fa-calendar-alt" /> {formatDate(article.publishedAt || article.createdAt)}
          </span>
          <span>
            <i className="fas fa-user" /> {article.author?.name || 'Jatin Kumar'}
          </span>
        </div>
        <div className="reading-time" title="Reading time">
          <i className="fas fa-clock" />
          <span>{article.readingTime || 3} min read</span>
        </div>
        <div className="post-title">
          <Link href={`/${catSlug}/${article.slug}`}>{article.title}</Link>
        </div>
        {article.excerpt && <div className="post-snippet">{article.excerpt}</div>}
        <div className="post-footer">
          <div className="post-tags">
            {article.category && (
              <Link className="post-tag" href={`/category/${catSlug}`}>
                {article.category.name}
              </Link>
            )}
          </div>
          <Link className="read-more-btn" href={`/${catSlug}/${article.slug}`}>
            Read More <i className="fas fa-arrow-right" />
          </Link>
        </div>
      </div>
    </div>
  );
}

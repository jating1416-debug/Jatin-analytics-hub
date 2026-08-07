import Link from 'next/link';
import type { ArticleWithCategory } from '@/lib/types';
import { formatDate } from '@/lib/utils';

export default function ArticleCard({ article }: { article: ArticleWithCategory }) {
  const catSlug = article.category?.slug || 'uncategorized';
  return (
    <div className="post-card" data-label={catSlug}>
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

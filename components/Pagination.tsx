import Link from 'next/link';

export default function Pagination({
  page,
  totalPages,
  basePath,
}: {
  page: number;
  totalPages: number;
  basePath: string;
}) {
  if (totalPages <= 1) return null;
  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: 10, margin: '30px 0', flexWrap: 'wrap' }}>
      {page > 1 && (
        <Link className="cta-btn-outline" href={page === 2 ? basePath : `${basePath}?page=${page - 1}`}>
          <i className="fas fa-arrow-left" /> Newer Posts
        </Link>
      )}
      <span className="cta-btn-outline" style={{ cursor: 'default', background: 'transparent' }}>
        Page {page} / {totalPages}
      </span>
      {page < totalPages && (
        <Link className="cta-btn-outline" href={`${basePath}?page=${page + 1}`}>
          Older Posts <i className="fas fa-arrow-right" />
        </Link>
      )}
    </div>
  );
}

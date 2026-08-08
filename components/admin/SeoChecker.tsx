'use client';

// SEO CHECKER - live warnings (Yoast jaisa, free)
export default function SeoChecker({
  title,
  metaDescription,
  slug,
  content,
  tags,
}: {
  title: string;
  metaDescription: string;
  slug: string;
  content: string;
  tags: string[];
}) {
  const words = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().split(' ').filter(Boolean).length;

  const checks = [
    {
      label: 'Title length',
      ok: title.length >= 30 && title.length <= 65,
      warn: title.length > 0 && (title.length < 30 || title.length > 65),
      detail: `${title.length}/65 chars (30-65 best)`,
    },
    {
      label: 'Meta description',
      ok: metaDescription.length >= 120 && metaDescription.length <= 165,
      warn: metaDescription.length > 0 && (metaDescription.length < 120 || metaDescription.length > 165),
      detail: metaDescription.length ? `${metaDescription.length}/165 chars (120-165 best)` : 'khali — Google snippet nahi bane',
    },
    {
      label: 'Slug',
      ok: slug.length >= 3 && slug.length <= 80,
      warn: slug.length > 0 && (slug.length < 3 || slug.length > 80),
      detail: slug ? `/${slug}` : 'khali — title se auto banega',
    },
    {
      label: 'Content length',
      ok: words >= 300,
      warn: words > 0 && words < 300,
      detail: `${words} words (300+ best for SEO)`,
    },
    {
      label: 'Tags',
      ok: tags.length >= 2,
      warn: tags.length === 1,
      detail: `${tags.length} tags (2+ recommend)`,
    },
  ];

  const score = Math.round(
    (checks.filter((c) => c.ok).length / checks.length) * 100
  );

  return (
    <div className={`seo-checker${score === 100 ? ' perfect' : ''}`}>
      <div className="seo-checker-head">
        <div className="seo-checker-title">
          <i className="fas fa-magnifying-glass-chart" /> SEO Health
        </div>
        <div className={`seo-score${score === 100 ? ' perfect' : ''}`}>
          {score === 100 ? '✅ Perfect' : `${score}%`}
        </div>
      </div>
      <div className="seo-meter">
        <div className="seo-meter-fill" style={{ width: `${score}%` }} />
      </div>
      <div className="seo-checks">
        {checks.map((c) => (
          <div key={c.label} className="seo-check-row">
            <span className={`seo-check-icon ${c.ok ? 'ok' : c.warn ? 'warn' : 'bad'}`}>
              <i className={`fas ${c.ok ? 'fa-check' : c.warn ? 'fa-exclamation' : 'fa-circle-minus'}`} />
            </span>
            <span className="seo-check-label">{c.label}</span>
            <span className="seo-check-detail">{c.detail}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

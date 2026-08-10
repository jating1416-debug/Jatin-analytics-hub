// SEO: JSON-LD schema (BlogPosting + BreadcrumbList + FAQPage + Author/Person)
export default function SchemaMarkup({
  title,
  url,
  description,
  image,
  publishedAt,
  updatedAt,
  categoryName,
  categoryUrl,
  authorName,
  faq,
}: {
  title: string;
  url: string;
  description?: string | null;
  image?: string | null;
  publishedAt: Date | null;
  updatedAt: Date;
  categoryName?: string;
  categoryUrl?: string;
  authorName: string;
  faq?: { q: string; a: string }[];
}) {
  const author = {
    '@type': 'Person',
    name: authorName,
    url: 'https://blog.jatinanalytics.co.in/author',
    sameAs: [
      'https://jatinanalytics.co.in',
      'https://linkedin.com/in/jatin-kumar-5a46a720a',
      'https://github.com/jating1416-debug',
      'https://kaggle.com/jatinkhandelwal112',
    ],
  };

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    headline: title,
    ...(description ? { description } : {}),
    ...(image ? { image } : {}),
    datePublished: (publishedAt || updatedAt).toISOString(),
    dateModified: updatedAt.toISOString(),
    author,
    publisher: { '@type': 'Organization', name: 'Data Insights', url: 'https://jatinanalytics.co.in' },
  };

  const breadcrumbSchema = categoryName && categoryUrl
    ? {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://blog.jatinanalytics.co.in' },
          { '@type': 'ListItem', position: 2, name: categoryName, item: categoryUrl },
        ],
      }
    : null;

  // FAQPage schema - Google rich results (post mein [faq] blocks ho to)
  const faqSchema = faq && faq.length > 0
    ? {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faq.map((f) => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a },
        })),
      }
    : null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      {breadcrumbSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        />
      )}
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
    </>
  );
}

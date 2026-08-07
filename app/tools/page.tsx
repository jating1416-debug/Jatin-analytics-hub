export default function ToolsPage() {
  const tools = [
    { name: 'KPI Calculator', slug: 'kpi-calculator', icon: '📊', desc: 'Key Performance Indicators calculate karo' },
    { name: 'CAGR Calculator', slug: 'cagr-calculator', icon: '📈', desc: 'Compound Annual Growth Rate' },
    { name: 'Growth %', slug: 'growth-percent', icon: '📉', desc: 'Percentage growth nikaalo' },
    { name: 'Profit Margin', slug: 'profit-margin', icon: '💰', desc: 'Margin percentage' },
    { name: 'JSON Formatter', slug: 'json-formatter', icon: '🔧', desc: 'JSON beautify/minify' },
    { name: 'CSV Viewer', slug: 'csv-viewer', icon: '📄', desc: 'CSV ko table mein dekho' },
    { name: 'CSV → JSON', slug: 'csv-to-json', icon: '🔄', desc: 'Convert karo' },
    { name: 'SQL Formatter', slug: 'sql-formatter', icon: '🗄️', desc: 'SQL queries format karo' },
    { name: 'ATS Resume Scanner', slug: 'ats-scanner', icon: '📄', desc: 'Resume scan + score' },
  ];
  return (
    <div className="layout-wrapper">
      <main className="posts-section">
        <h2 className="section-title">🛠️ All Tools</h2>
        <div className="related-posts-grid">
          {tools.map((t) => (
            <a key={t.slug} className="related-post-card" href={`/tools/${t.slug}`}>
              <div className="related-post-card-body">
                <h4>{t.icon} {t.name}</h4>
                <div className="related-post-card-meta" style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>{t.desc}</div>
              </div>
            </a>
          ))}
        </div>
      </main>
    </div>
  );
}

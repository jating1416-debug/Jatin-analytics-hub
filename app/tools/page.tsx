export default function ToolsPage() {
  const tools = [
    { name: 'KPI Calculator', slug: 'kpi-calculator', icon: '📊', desc: 'Key Performance Indicators calculate karo — revenue, growth, retention & more' },
    { name: 'CAGR Calculator', slug: 'cagr-calculator', icon: '📈', desc: 'Compound Annual Growth Rate — investment aur business growth measure karo' },
    { name: 'Growth %', slug: 'growth-percent', icon: '📉', desc: 'Percentage growth nikaalo — simple, fast, accurate' },
    { name: 'Profit Margin', slug: 'profit-margin', icon: '💰', desc: 'Gross aur net margin percentage instantly calculate karo' },
    { name: 'JSON Formatter', slug: 'json-formatter', icon: '🔧', desc: 'JSON beautify / minify — messy data ko clean karo' },
    { name: 'CSV Viewer', slug: 'csv-viewer', icon: '📄', desc: 'CSV ko table mein dekho — data inspect karna aasan' },
    { name: 'CSV → JSON', slug: 'csv-to-json', icon: '🔄', desc: 'CSV file ko JSON mein convert karo, koi upload nahi — sab browser mein' },
    { name: 'SQL Formatter', slug: 'sql-formatter', icon: '🗄️', desc: 'SQL queries format karo — readable aur maintainable' },
    { name: 'Regex Tester', slug: 'regex-tester', icon: '🔍', desc: 'Regular expressions live test karo — match highlight ke sath' },
    { name: 'ATS Resume Scanner', slug: 'ats-scanner', icon: '📋', desc: 'Resume scan karke ATS score dekho — job apply karne se pehle' },
    { name: 'SQL Playground', slug: 'sql-playground', icon: '🧠', desc: 'Browser mein hi SQL queries run karo — SELECT, JOIN, GROUP BY sab' },
    { name: 'DAX Explorer', slug: 'dax-explorer', icon: '📊', desc: 'Power BI DAX functions explore karo — syntax + examples' },
  ];
  return (
    <div className="layout-wrapper">
      <main className="posts-section">
        <h2 className="section-title">
          <span className="section-chip"><i className="fas fa-toolbox" /></span>
          Free Analyst Tools
        </h2>
        <p style={{ color: 'var(--text-light)', fontSize: '0.92rem', marginBottom: 24, lineHeight: 1.7 }}>
          🚀 12 free tools — koi signup nahi, koi data server pe nahi jaata, sab kuch aapke browser mein chalta hai.
        </p>
        <div className="related-posts-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 16 }}>
          {tools.map((t) => (
            <a key={t.slug} className="tool-card" href={`/tools/${t.slug}`}>
              <div className="tool-card-icon">{t.icon}</div>
              <h3>{t.name}</h3>
              <p>{t.desc}</p>
              <span className="tool-card-link">
                Open Tool <i className="fas fa-arrow-right" />
              </span>
            </a>
          ))}
        </div>
      </main>
    </div>
  );
}

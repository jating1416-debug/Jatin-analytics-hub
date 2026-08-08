import Link from 'next/link';

// HOME: TOOLS STRIP - 12 free tools ke chips (static - koi DB nahi)
const TOOLS = [
  { slug: 'kpi-calculator', icon: '📊', name: 'KPI' },
  { slug: 'cagr-calculator', icon: '📈', name: 'CAGR' },
  { slug: 'growth-percent', icon: '📉', name: 'Growth %' },
  { slug: 'profit-margin', icon: '💰', name: 'Margin' },
  { slug: 'json-formatter', icon: '🔧', name: 'JSON' },
  { slug: 'csv-viewer', icon: '📄', name: 'CSV' },
  { slug: 'csv-to-json', icon: '🔄', name: 'CSV→JSON' },
  { slug: 'sql-formatter', icon: '🗄️', name: 'SQL Format' },
  { slug: 'regex-tester', icon: '🔍', name: 'Regex' },
  { slug: 'ats-scanner', icon: '📋', name: 'ATS Scan' },
  { slug: 'sql-playground', icon: '🧠', name: 'SQL Play' },
  { slug: 'dax-explorer', icon: '📊', name: 'DAX' },
];

export default function ToolsStrip() {
  return (
    <div className="tools-strip">
      <div className="tools-strip-head">
        <span className="section-chip"><i className="fas fa-toolbox" /></span>
        <span className="tools-strip-title" data-i18n="sec.tools">Free Analyst Tools</span>
        <Link href="/tools" className="tools-strip-all">
          <span>View all</span> <i className="fas fa-arrow-right" />
        </Link>
      </div>
      <div className="tools-strip-grid">
        {TOOLS.map((t) => (
          <Link key={t.slug} href={`/tools/${t.slug}`} className="tool-strip-chip" title={t.name}>
            <span>{t.icon}</span>
            {t.name}
          </Link>
        ))}
      </div>
    </div>
  );
}

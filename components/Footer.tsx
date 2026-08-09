import Link from 'next/link';

const TOPICS = [
  { href: '/category/sql', label: 'SQL Tutorials' },
  { href: '/category/python', label: 'Python Guide' },
  { href: '/category/power-bi', label: 'Power BI' },
  { href: '/category/excel', label: 'Excel Tips' },
  { href: '/category/career', label: 'Career Guide' },
];

// LEGAL LINKS - JATIN KE APNE PAGES (misc/ articles) - koi /p/ page nahi
// Contact bhi yahin -> /misc/contact (tumhara wala form)
const LEGAL = [
  { href: '/misc/about', label: 'About' },
  { href: '/misc/contact', label: 'Contact' },
  { href: '/misc/privacy-policy', label: 'Privacy Policy' },
  { href: '/misc/disclaimer', label: 'Disclaimer' },
  { href: '/misc/terms', label: 'Terms & Conditions' },
  { href: '/misc/dmca-policy', label: 'DMCA' },
];

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div>
          <div className="footer-brand-name">
            <i className="fas fa-chart-line" style={{ marginRight: 8 }} />
            {'<DataInsights />'}
          </div>
          <p className="footer-desc">
            Practical Data Analytics tutorials covering SQL, Python, Power BI, Excel and career
            guidance for aspiring analysts — 100% free.
          </p>
          <div className="footer-social">
            <a href="https://linkedin.com/in/jatin-kumar-5a46a720a" target="_blank" rel="noopener" aria-label="LinkedIn" title="LinkedIn"><i className="fab fa-linkedin" /></a>
            <a href="https://github.com/jating1416-debug" target="_blank" rel="noopener" aria-label="GitHub" title="GitHub"><i className="fab fa-github" /></a>
            <a href="https://kaggle.com/jatinkhandelwal112" target="_blank" rel="noopener" aria-label="Kaggle" title="Kaggle"><i className="fab fa-kaggle" /></a>
            <a href="mailto:jating1416@gmail.com" aria-label="Email" title="Email"><i className="fas fa-envelope" /></a>
            <a href="https://jatinanalytics.co.in" target="_blank" rel="noopener" aria-label="Portfolio" title="Portfolio"><i className="fas fa-globe" /></a>
          </div>
        </div>

        <div className="footer-col">
          <h3 className="footer-h" data-i18n="footer.topics">Topics</h3>
          <ul className="footer-links">
            {TOPICS.map((t) => (
              <li key={t.href}><Link href={t.href}>{t.label}</Link></li>
            ))}
          </ul>
        </div>

        <div className="footer-col">
          <h3 className="footer-h" data-i18n="footer.quick">Quick Links</h3>
          <ul className="footer-links">
            <li><Link href="/tools">🛠️ All Tools</Link></li>
            <li><Link href="/archive">🗓️ Archive</Link></li>
            <li><Link href="/misc/contact">📬 Contact</Link></li>
            <li><Link href="/search">🔍 Search</Link></li>
            <li><a href="https://jatinanalytics.co.in" target="_blank" rel="noopener">Portfolio</a></li>
            <li><a href="https://kaggle.com/jatinkhandelwal112" target="_blank" rel="noopener">Kaggle</a></li>
            <li><a href="https://github.com/jating1416-debug" target="_blank" rel="noopener">GitHub</a></li>
          </ul>
        </div>

        <div className="footer-col">
          <h3 className="footer-h" data-i18n="footer.legal">Legal &amp; Info</h3>
          <ul className="footer-links">
            {LEGAL.map((l) => (
              <li key={l.href}><Link href={l.href}>{l.label}</Link></li>
            ))}
            <li><a href="/sitemap.xml">Sitemap</a></li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <span>Copyright © {new Date().getFullYear()} Data Insights by Jatin Kumar. <span data-i18n="footer.rights">All Rights Reserved.</span></span>
        <span>Built with ❤️ for Data Analysts</span>
      </div>
    </footer>
  );
}

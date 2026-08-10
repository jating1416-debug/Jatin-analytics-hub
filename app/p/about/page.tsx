import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About — Data Insights',
  description: 'Data Insights by Jatin Kumar — practical Data Analytics tutorials for aspiring analysts.',
};

export default function AboutPage() {
  return (
    <div className="layout-wrapper">
      <main className="posts-section">
        <div className="post-content-wrapper" style={{ padding: 34 }}>
          <h1 className="article-title" style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: 18 }}>
            👋 About Data Insights
          </h1>

          <div className="author-box" style={{ marginBottom: 24 }}>
            <div className="author-box-avatar">👤</div>
            <div className="author-box-info">
              <div className="author-box-name">Jatin Kumar</div>
              <div className="author-box-role">Data Analyst & Educator</div>
              <p className="author-box-bio">
                Data Analytics blog jo SQL, Python, Power BI, Excel aur career guidance pe
                practical tutorials deta hai — bilkul free.
              </p>
              <div className="author-box-links">
                <a href="https://jatinanalytics.co.in" target="_blank" rel="noopener"><i className="fas fa-globe" /> Portfolio</a>
                <a href="https://linkedin.com/in/jatin-kumar-5a46a720a" target="_blank" rel="noopener"><i className="fab fa-linkedin" /> LinkedIn</a>
                <a href="https://github.com/jating1416-debug" target="_blank" rel="noopener"><i className="fab fa-github" /> GitHub</a>
                <a href="https://kaggle.com/jatinkhandelwal112" target="_blank" rel="noopener"><i className="fab fa-kaggle" /> Kaggle</a>
              </div>
            </div>
          </div>

          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '22px 0 12px' }}>📖 Ye blog kya hai?</h2>
          <p style={{ color: 'var(--text-light)', lineHeight: 1.8, marginBottom: 12 }}>
            Data Insights pe aapko milega — SQL queries, Python (Pandas/NumPy), Power BI
            dashboards, Excel formulas, interview questions aur real-world case studies.
            Har tutorial example ke saath, taaki seekhna aasan ho.
          </p>

          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '22px 0 12px' }}>🎁 Free Tools</h2>
          <p style={{ color: 'var(--text-light)', lineHeight: 1.8, marginBottom: 12 }}>
            12+ free tools bhi available hain — <Link href="/tools" style={{ color: 'var(--primary)', fontWeight: 700 }}>SQL Playground</Link>,
            ATS Resume Scanner, calculators aur formatters. Sab browser mein chalta hai — kuch bhi server pe nahi jaata.
          </p>

          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '22px 0 12px' }}>📬 Contact</h2>
          <p style={{ color: 'var(--text-light)', lineHeight: 1.8, marginBottom: 12 }}>
            Koi sawaal, suggestion ya collaboration?{' '}
            <Link href="/contact" style={{ color: 'var(--primary)', fontWeight: 700 }}>Contact page</Link> se message bhejo —
            jald hi reply milta hai.
          </p>
        </div>
      </main>
    </div>
  );
}

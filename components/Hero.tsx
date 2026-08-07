import Link from 'next/link';

export default function Hero() {
  return (
    <div className="featured-banner">
      <div className="featured-banner-inner">
        <span className="featured-tag">📊 Data Analytics Blog</span>
        <h1>
          Learn Data Analytics,
          <br />
          SQL, Python &amp; Power BI
        </h1>
        <p>
          Practical guides, real-world examples, and career tips for aspiring Data Analysts.
        </p>
        <div className="featured-dropdown">
          <a className="featured-btn outline featured-dropdown-toggle" href="/#start-learning" id="start-learning-link">
            📚 Start Learning <i className="fas fa-chevron-down" />
          </a>
          <div className="featured-dropdown-menu" id="start-learning-menu">
            <Link href="/category/excel">📗 Excel</Link>
            <Link href="/category/python">🐍 Python</Link>
            <Link href="/category/sql">🗄️ SQL / MySQL</Link>
            <Link href="/category/power-bi">📈 Power BI</Link>
            <Link href="/category/interview-questions">🎯 Interview Questions</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

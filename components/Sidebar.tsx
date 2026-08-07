import Link from 'next/link';

export default function Sidebar({
  categories,
  recent,
  popular,
}: {
  categories: { name: string; slug: string; _count: { articles: number } }[];
  recent: { title: string; slug: string; categorySlug: string; date: string }[];
  popular: { title: string; slug: string; categorySlug: string; views: number }[];
}) {
  return (
    <aside className="sidebar">
      <div className="sidebar-widget about-widget">
        <div className="about-avatar">👤</div>
        <div className="about-name">Jatin Kumar</div>
        <div className="about-role">Data Analyst</div>
        <p className="about-desc">
          Passionate about Python, SQL, Power BI and turning raw data into meaningful insights.
        </p>
        <a className="about-portfolio-btn" href="https://jatinanalytics.co.in" target="_blank" rel="noopener">
          🚀 View Live Portfolio
        </a>
        <div className="social-links">
          <a className="social-link social-linkedin" href="https://linkedin.com/in/jatin-kumar-5a46a720a" target="_blank" rel="noopener"><i className="fab fa-linkedin" /> LinkedIn</a>
          <a className="social-link social-github" href="https://github.com/jating1416-debug" target="_blank" rel="noopener"><i className="fab fa-github" /> GitHub</a>
          <a className="social-link social-kaggle" href="https://kaggle.com/jatinkhandelwal112" target="_blank" rel="noopener"><i className="fab fa-kaggle" /> Kaggle</a>
          <a className="social-link social-email" href="mailto:jating1416@gmail.com"><i className="fas fa-envelope" /> Email</a>
        </div>
      </div>

      <div className="sidebar-widget">
        <div className="widget-title"><i className="fas fa-layer-group" /> Categories</div>
        <ul className="category-list">
          {categories.map((c) => (
            <li className="category-item" key={c.slug}>
              <div className="category-item-left">
                <div className="category-dot" />
                <Link href={`/category/${c.slug}`}>{c.name}</Link>
              </div>
              <span className="category-count">{c._count.articles}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="sidebar-widget">
        <div className="widget-title"><i className="fas fa-clock" /> Recent Posts</div>
        <ul className="recent-posts-list">
          {recent.map((p) => (
            <li className="recent-post-item" key={p.slug}>
              <div className="recent-post-info">
                <Link href={`/${p.categorySlug}/${p.slug}`}>{p.title}</Link>
                <div className="recent-post-date"><i className="fas fa-calendar-alt" /> {p.date}</div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="sidebar-widget">
        <div className="widget-title"><i className="fas fa-fire" /> Popular Posts</div>
        <ul className="recent-posts-list">
          {popular.map((p) => (
            <li className="recent-post-item" key={p.slug}>
              <div className="recent-post-info">
                <Link href={`/${p.categorySlug}/${p.slug}`}>{p.title}</Link>
                <div className="recent-post-date"><i className="fas fa-eye" /> {p.views} views</div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="sidebar-widget cta-widget">
        <div className="widget-title"><i className="fas fa-rocket" /> My Portfolio</div>
        <p>Explore my live Data Analytics projects, Power BI dashboards, and datasets!</p>
        <a className="cta-btn-white" href="https://jatinanalytics.co.in" target="_blank" rel="noopener">🚀 Visit jatinanalytics.co.in</a>
        <a className="cta-btn-outline" href="https://www.kaggle.com/jatinkhandelwal112" target="_blank" rel="noopener">🏆 View Kaggle Datasets</a>
      </div>
    </aside>
  );
}

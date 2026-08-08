import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="fancy-page">
      <span className="fancy-page-icon">🔍</span>
      <div className="fancy-page-big">404</div>
      <h1>Page nahi mili 😕</h1>
      <p>
        Jo page aap dhundh rahe ho wo move ho gaya, delete ho gaya, ya URL galat hai.
        Koi baat nahi — neeche se sahi jagah pe pahuncho!
      </p>
      <div className="fancy-actions">
        <Link href="/" className="read-more-btn" style={{ textDecoration: 'none' }}>🏠 Home Page</Link>
        <Link href="/tools" className="read-more-btn" style={{ textDecoration: 'none', background: 'var(--secondary)' }}>🛠️ All Tools</Link>
      </div>
      <p className="fancy-note">
        Ya <Link href="/search" style={{ color: 'var(--primary)', fontWeight: 700 }}>🔍 Search</Link> karke dhundho
      </p>
    </div>
  );
}

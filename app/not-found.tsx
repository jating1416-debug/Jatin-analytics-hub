import Link from 'next/link';

export default function NotFound() {
  return (
    <div style={{ maxWidth: 640, margin: '80px auto', padding: '0 20px', textAlign: 'center' }}>
      <div style={{ fontSize: '4rem', fontWeight: 800, background: 'var(--gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
        404
      </div>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: '10px 0 12px', color: 'var(--text-dark)' }}>
        😕 Page nahi mili
      </h1>
      <p style={{ color: 'var(--text-light)', fontSize: '0.95rem', marginBottom: 24, lineHeight: 1.7 }}>
        Jo page aap dhundh rahe ho wo move ho gaya, delete ho gaya, ya URL galat hai.
        Koi baat nahi — neeche se sahi jagah pe pahuncho!
      </p>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
        <Link href="/" className="read-more-btn" style={{ textDecoration: 'none' }}>🏠 Home Page</Link>
        <Link href="/tools" className="read-more-btn" style={{ textDecoration: 'none', background: 'var(--secondary)' }}>🛠️ All Tools</Link>
      </div>
      <p style={{ marginTop: 24, fontSize: '0.82rem', color: 'var(--text-light)' }}>
        Ya <Link href="/search" style={{ color: 'var(--primary)', fontWeight: 600 }}>🔍 Search</Link> karke dhundho
      </p>
    </div>
  );
}

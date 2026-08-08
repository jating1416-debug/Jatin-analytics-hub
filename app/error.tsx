'use client';

import Link from 'next/link';

// GLOBAL ERROR BOUNDARY - runtime error hone pe bhi aacha page dikhega
export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div style={{ maxWidth: 640, margin: '80px auto', padding: '0 20px', textAlign: 'center' }}>
      <div style={{ fontSize: '3rem', fontWeight: 800, background: 'var(--gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
        Oops!
      </div>
      <h1 style={{ fontSize: '1.4rem', fontWeight: 700, margin: '10px 0 12px', color: 'var(--text-dark)' }}>
        Kuch galat ho gaya 😕
      </h1>
      <p style={{ color: 'var(--text-light)', fontSize: '0.9rem', marginBottom: 16, lineHeight: 1.7 }}>
        Ye aam taur pe database connection ki wajah se hota hai. Thodi der baad try karo.
      </p>
      {error?.digest && (
        <p style={{ fontSize: '0.72rem', color: 'var(--text-light)', marginBottom: 20 }}>
          Error code: {error.digest}
        </p>
      )}
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
        <button onClick={reset} className="read-more-btn" style={{ border: 'none', cursor: 'pointer' }}>
          🔄 Try Again
        </button>
        <Link href="/" className="read-more-btn" style={{ textDecoration: 'none', background: 'var(--secondary)' }}>
          🏠 Home
        </Link>
      </div>
    </div>
  );
}

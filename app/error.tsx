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
    <div className="fancy-page">
      <span className="fancy-page-icon">⚠️</span>
      <div className="fancy-page-big">Oops!</div>
      <h1>Kuch galat ho gaya 😕</h1>
      <p>
        Ye aam taur pe database connection ki wajah se hota hai. Thodi der baad try karo.
      </p>
      {error?.digest && (
        <p style={{ fontSize: '0.72rem', color: 'var(--text-light)', marginBottom: 20 }}>
          Error code: {error.digest}
        </p>
      )}
      <div className="fancy-actions">
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

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        router.push('/admin');
        router.refresh();
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error || 'Login failed');
      }
    } catch {
      setError('Network error — try again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="layout-wrapper" style={{ maxWidth: 480 }}>
      <main className="posts-section">
        <div className="post-content-wrapper" style={{ padding: 30 }}>
          <h2 className="section-title" style={{ marginBottom: 20 }}>🔐 Admin Login</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-light)', marginBottom: 18 }}>
            Data Insights admin panel — sirf authorized access.
          </p>
          <form onSubmit={onSubmit}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Admin password"
              style={{
                width: '100%', padding: '11px 14px', border: '1px solid var(--border)',
                borderRadius: 10, background: 'var(--bg)', color: 'var(--text-dark)',
                fontSize: '0.9rem', outline: 'none', marginBottom: 12, boxSizing: 'border-box',
              }}
            />
            {error && <p style={{ color: '#ef4444', fontSize: '0.82rem', marginBottom: 10 }}>{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="read-more-btn"
              style={{ width: '100%', justifyContent: 'center' }}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}

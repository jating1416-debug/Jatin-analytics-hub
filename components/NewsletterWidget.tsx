'use client';

import { useState } from 'react';

export default function NewsletterWidget() {
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const subscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    setLoading(true);
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      setMsg({ type: res.ok ? 'ok' : 'err', text: data.message || data.error || 'Error' });
      if (res.ok) setEmail('');
    } catch {
      setMsg({ type: 'err', text: 'Network error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sidebar-widget">
      <div className="widget-title"><i className="fas fa-envelope-open-text" /> Newsletter</div>
      <p style={{ fontSize: '0.82rem', color: 'var(--text-light)', marginBottom: 12, lineHeight: 1.5 }}>
        📩 Naye posts ka update seedha email mein pao — free subscribe karo!
      </p>
      <form onSubmit={subscribe} style={{ display: 'flex', gap: 8, flexDirection: 'column' }}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Your email address"
          required
          style={{
            padding: '10px 14px', border: '1px solid var(--border)', borderRadius: 10,
            fontSize: '0.85rem', background: 'var(--bg)', color: 'var(--text-dark)', outline: 'none', boxSizing: 'border-box', width: '100%',
          }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{
            background: 'var(--gradient)', color: '#fff', border: 'none', padding: '11px',
            borderRadius: 10, fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer',
          }}
        >
          <i className="fas fa-paper-plane" /> {loading ? 'Subscribing...' : 'Subscribe'}
        </button>
      </form>
      {msg && (
        <p style={{ color: msg.type === 'ok' ? '#16a34a' : '#ef4444', fontSize: '0.8rem', fontWeight: 600, marginTop: 8 }}>
          {msg.text}
        </p>
      )}
    </div>
  );
}

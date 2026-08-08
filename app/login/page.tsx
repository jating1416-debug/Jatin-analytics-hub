'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'login' | 'forgot' | 'reset'>('login');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
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

  const sendOtp = async () => {
    setMsg(null); setLoading(true);
    try {
      const res = await fetch('/api/auth/forgot', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setMsg({ type: 'ok', text: data.message || 'OTP email pe bheja' });
        setMode('reset');
      } else {
        setMsg({ type: 'err', text: data.error || 'Fail' });
      }
    } catch {
      setMsg({ type: 'err', text: 'Network error' });
    } finally { setLoading(false); }
  };

  const resetPassword = async () => {
    setMsg(null); setLoading(true);
    try {
      const res = await fetch('/api/auth/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ otp, newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setMsg({ type: 'ok', text: data.message || '✅ Password update!' });
        setTimeout(() => { setMode('login'); setOtp(''); setNewPassword(''); }, 1500);
      } else {
        setMsg({ type: 'err', text: data.error || 'Fail' });
      }
    } catch {
      setMsg({ type: 'err', text: 'Network error' });
    } finally { setLoading(false); }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '12px 16px', border: '1px solid var(--border)', borderRadius: 10,
    background: 'var(--bg)', color: 'var(--text-dark)', fontSize: '1rem', outline: 'none',
    marginBottom: 14, boxSizing: 'border-box',
  };
  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-light)', marginBottom: 5,
  };

  return (
    <div style={{ maxWidth: 480, margin: '60px auto', padding: '0 20px' }}>
      <div style={{ padding: 30, background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 12 }}>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: 20 }}>
          {mode === 'login' ? '🔐 Admin Login' : mode === 'forgot' ? '🔑 Forgot Password' : '🔄 Reset Password'}
        </h2>

        {mode === 'login' && (
          <>
            <form onSubmit={onSubmit}>
              <label style={labelStyle}>ADMIN PASSWORD</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Admin password" autoFocus style={inputStyle} />
              {error && <p style={{ color: '#ef4444', fontSize: '0.82rem', marginBottom: 10 }}>{error}</p>}
              <button type="submit" disabled={loading} className="read-more-btn" style={{ width: '100%', justifyContent: 'center', border: 'none', padding: '13px 0', fontSize: '0.95rem' }}>
                {loading ? 'Logging in...' : '🔓 Login'}
              </button>
            </form>
            <button
              onClick={() => { setMode('forgot'); setMsg(null); }}
              style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', marginTop: 14, fontSize: '0.85rem', width: '100%', textAlign: 'center' }}
            >
              Password bhool gaye? <b>Forgot Password</b>
            </button>
          </>
        )}

        {mode === 'forgot' && (
          <>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-light)', marginBottom: 16 }}>
              OTP aapki registered email (<b>{process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'ADMIN_EMAIL'}</b>) pe bheja jayega.
            </p>
            <button onClick={sendOtp} disabled={loading} className="read-more-btn" style={{ width: '100%', justifyContent: 'center', border: 'none', padding: '13px 0' }}>
              {loading ? 'Sending...' : '📧 Send OTP'}
            </button>
            <button
              onClick={() => setMode('login')}
              style={{ background: 'none', border: 'none', color: 'var(--text-light)', cursor: 'pointer', marginTop: 12, fontSize: '0.82rem', width: '100%', textAlign: 'center' }}
            >
              ← Back to Login
            </button>
          </>
        )}

        {mode === 'reset' && (
          <>
            <label style={labelStyle}>OTP (email se)</label>
            <input value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="6-digit OTP" style={inputStyle} />
            <label style={labelStyle}>Naya Password</label>
            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Minimum 8 characters" style={inputStyle} />
            <button onClick={resetPassword} disabled={loading} className="read-more-btn" style={{ width: '100%', justifyContent: 'center', border: 'none', padding: '13px 0' }}>
              {loading ? 'Resetting...' : '✅ Set New Password'}
            </button>
            <button
              onClick={() => setMode('login')}
              style={{ background: 'none', border: 'none', color: 'var(--text-light)', cursor: 'pointer', marginTop: 12, fontSize: '0.82rem', width: '100%', textAlign: 'center' }}
            >
              ← Back to Login
            </button>
          </>
        )}

        {msg && (
          <p style={{ color: msg.type === 'ok' ? '#16a34a' : '#ef4444', fontSize: '0.85rem', marginTop: 12, textAlign: 'center' }}>{msg.text}</p>
        )}
      </div>
    </div>
  );
}

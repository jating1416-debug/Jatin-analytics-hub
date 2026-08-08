'use client';

import { useState } from 'react';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [sending, setSending] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    setSending(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message }),
      });
      const data = await res.json();
      if (res.ok) {
        setMsg({ type: 'ok', text: data.message || '✅ Message bhej diya! Jald reply karenge.' });
        setName(''); setEmail(''); setMessage('');
      } else {
        setMsg({ type: 'err', text: data.error || 'Send fail' });
      }
    } catch {
      setMsg({ type: 'err', text: 'Network error' });
    } finally { setSending(false); }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '11px 14px', border: '1px solid var(--border)', borderRadius: 10,
    background: 'var(--bg)', color: 'var(--text-dark)', fontSize: '0.9rem', outline: 'none',
    boxSizing: 'border-box', marginBottom: 12,
  };
  const labelStyle: React.CSSProperties = { display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-light)', marginBottom: 5 };

  return (
    <div style={{ maxWidth: 640, margin: '50px auto', padding: '0 20px' }}>
      <div style={{ padding: 30, background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 12 }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 8 }}>📬 Contact Me</h1>
        <p style={{ color: 'var(--text-light)', fontSize: '0.9rem', marginBottom: 20, lineHeight: 1.6 }}>
          Sawaal hai? Collaboration chahiye? Ya bas hello bolna hai? Neeche message bhejo — main 24-48 ghante mein reply karta hoon.
        </p>

        <form onSubmit={submit}>
          <label style={labelStyle}>Name *</label>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Aapka naam" required style={inputStyle} />

          <label style={labelStyle}>Email *</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="aapka@email.com" required style={inputStyle} />

          <label style={labelStyle}>Message *</label>
          <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Aapka message..." required style={{ ...inputStyle, minHeight: 120 }} />

          {msg && <p style={{ color: msg.type === 'ok' ? '#16a34a' : '#ef4444', fontSize: '0.85rem', marginBottom: 10 }}>{msg.text}</p>}

          <button type="submit" disabled={sending} className="read-more-btn" style={{ border: 'none', width: '100%', justifyContent: 'center', padding: '13px 0' }}>
            {sending ? 'Sending...' : '📨 Send Message'}
          </button>
        </form>

        <div style={{ marginTop: 24, paddingTop: 18, borderTop: '1px solid var(--border)', fontSize: '0.85rem', color: 'var(--text-light)', lineHeight: 2 }}>
          <div>📧 <b>Email:</b> jating1416@gmail.com</div>
          <div>💼 <b>LinkedIn:</b> <a href="https://linkedin.com/in/jatin-kumar-5a46a720a" target="_blank" rel="noopener" style={{ color: 'var(--primary)' }}>jatin-kumar-5a46a720a</a></div>
          <div>🐙 <b>GitHub:</b> <a href="https://github.com/jating1416-debug" target="_blank" rel="noopener" style={{ color: 'var(--primary)' }}>jating1416-debug</a></div>
          <div>🏆 <b>Kaggle:</b> <a href="https://kaggle.com/jatinkhandelwal112" target="_blank" rel="noopener" style={{ color: 'var(--primary)' }}>jatinkhandelwal112</a></div>
        </div>
      </div>
    </div>
  );
}

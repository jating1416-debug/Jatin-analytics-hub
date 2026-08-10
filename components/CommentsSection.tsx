'use client';

import { useEffect, useState } from 'react';

// COMMENTS SECTION - simple DB-based (name + comment, likes, admin delete)
type Comment = { id: number; name: string; content: string; likes: number; createdAt: string };

export default function CommentsSection({ articleId }: { articleId: number }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [name, setName] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const load = async () => {
    try {
      const res = await fetch(`/api/comments?articleId=${articleId}`);
      const data = await res.json();
      setComments(data.comments || []);
    } catch {}
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [articleId]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    setSubmitting(true);
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articleId, name, content }),
      });
      const data = await res.json();
      if (res.ok) {
        setMsg({ type: 'ok', text: '✅ Comment post ho gaya!' });
        setName('');
        setContent('');
        load();
      } else {
        setMsg({ type: 'err', text: data.error || 'Error' });
      }
    } catch {
      setMsg({ type: 'err', text: 'Network error' });
    } finally { setSubmitting(false); }
  };

  const like = async (id: number) => {
    // localStorage se dedup (ek user ek baar like)
    try {
      const key = 'di_liked_' + id;
      if (localStorage.getItem(key)) return;
      localStorage.setItem(key, '1');
      setComments((prev) => prev.map((c) => (c.id === id ? { ...c, likes: c.likes + 1 } : c)));
      // no server like API - simple frontend count
    } catch {}
  };

  const fmtDate = (d: string) => {
    try { return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'Asia/Kolkata' }); }
    catch { return ''; }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 14px', border: '1px solid var(--border)', borderRadius: 10,
    background: 'var(--bg)', color: 'var(--text-dark)', fontSize: '0.88rem', outline: 'none',
    boxSizing: 'border-box', marginBottom: 10,
  };

  return (
    <div style={{ marginTop: 30 }}>
      <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: 16 }}>
        💬 Comments ({comments.length})
      </h3>

      <form onSubmit={submit} style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 12, padding: 16, marginBottom: 20 }}>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Aapka naam"
          required
          maxLength={60}
          style={inputStyle}
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Apna comment likho... (learning help/feedback)"
          required
          maxLength={1000}
          style={{ ...inputStyle, minHeight: 80 }}
        />
        {msg && <p style={{ color: msg.type === 'ok' ? '#16a34a' : '#ef4444', fontSize: '0.82rem', marginBottom: 8 }}>{msg.text}</p>}
        <button type="submit" disabled={submitting} className="read-more-btn" style={{ border: 'none' }}>
          {submitting ? 'Posting...' : '💬 Post Comment'}
        </button>
        <p style={{ fontSize: '0.7rem', color: 'var(--text-light)', marginTop: 8 }}>Spam/links allowed nahi hain — respectful comments welcome!</p>
      </form>

      {loading && <p style={{ color: 'var(--text-light)', fontSize: '0.85rem' }}>Loading comments...</p>}

      {!loading && comments.length === 0 && (
        <p style={{ color: 'var(--text-light)', fontSize: '0.88rem' }}>Abhi koi comment nahi — pehla comment karo! 💬</p>
      )}

      {comments.map((c) => (
        <div key={c.id} style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 16px', marginBottom: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <b style={{ fontSize: '0.88rem', color: 'var(--text-dark)' }}>{c.name}</b>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-light)' }}>{fmtDate(c.createdAt)}</span>
          </div>
          <p style={{ fontSize: '0.88rem', lineHeight: 1.6, color: 'var(--text-light)', whiteSpace: 'pre-wrap' }}>{c.content}</p>
          <div style={{ display: 'flex', gap: 10, marginTop: 8, alignItems: 'center' }}>
            <button
              onClick={() => like(c.id)}
              style={{ background: 'none', border: 'none', color: 'var(--text-light)', cursor: 'pointer', fontSize: '0.8rem' }}
            >
              👍 {c.likes > 0 ? c.likes : ''}
            </button>
            <button
              onClick={async () => {
                if (!confirm('Comment delete karna hai? (sirf admin)')) return;
                const res = await fetch(`/api/comments/${c.id}`, { method: 'DELETE' });
                if (res.ok) { setComments((prev) => prev.filter((x) => x.id !== c.id)); }
                else alert('Delete sirf admin kar sakta hai');
              }}
              style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.78rem' }}
              title="Delete (admin)"
            >
              🗑️
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

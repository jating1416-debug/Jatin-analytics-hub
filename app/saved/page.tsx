'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

// READING LIST - Save for Later wale posts (localStorage)
type SavedItem = { title: string; url: string };

export default function SavedPage() {
  const [items, setItems] = useState<SavedItem[]>([]);

  useEffect(() => {
    try {
      const list = JSON.parse(localStorage.getItem('di_saved') || '[]');
      setItems(list);
    } catch {
      setItems([]);
    }
  }, []);

  const remove = (url: string) => {
    const next = items.filter((i) => i.url !== url);
    setItems(next);
    try { localStorage.setItem('di_saved', JSON.stringify(next)); } catch {}
  };

  const clearAll = () => {
    if (!confirm('Saari saved posts hatani hain?')) return;
    setItems([]);
    try { localStorage.setItem('di_saved', '[]'); } catch {}
  };

  return (
    <div className="layout-wrapper">
      <main className="posts-section">
        <h2 className="section-title">🔖 Reading List</h2>
        <p style={{ color: 'var(--text-light)', fontSize: '0.88rem', marginBottom: 16 }}>
          Posts jo aapne "Save for Later" kiye — kisi bhi post pe left side ke 🔖 button se save karo.
        </p>

        {items.length === 0 ? (
          <div className="category-empty" style={{ display: 'block' }}>
            <p>Abhi kuch saved nahi hai.</p>
            <p>Kisi post pe <b>🔖 Save</b> button dabao — yahan dikhega!</p>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
              <button
                onClick={clearAll}
                style={{ background: 'none', border: '1px solid #ef4444', color: '#ef4444', padding: '6px 14px', borderRadius: 16, fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
              >
                🗑️ Clear All
              </button>
            </div>
            <div className="sidebar-widget" style={{ padding: '14px 18px' }}>
              {items.map((item) => (
                <div key={item.url} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                  <Link href={item.url} style={{ fontWeight: 600, color: 'var(--text-dark)', flex: 1, fontSize: '0.88rem' }}>
                    {item.title}
                  </Link>
                  <button
                    onClick={() => remove(item.url)}
                    style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', marginLeft: 10 }}
                    title="Remove"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

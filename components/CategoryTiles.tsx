'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getSidebar } from '@/lib/client-sidebar';

// HOME: CATEGORY TILES - gradient icon cards with post counts
const CAT_ICONS: Record<string, string> = {
  sql: '🗄️', mysql: '🗄️', python: '🐍', 'power-bi': '📈', excel: '📗',
  career: '💼', 'interview-questions': '🎯', 'case-study': '📁', uncategorized: '📝',
};
const CAT_GRADS: Record<string, string> = {
  sql: 'linear-gradient(135deg,#4f46e5,#7c3aed)',
  python: 'linear-gradient(135deg,#0ea5e9,#2563eb)',
  'power-bi': 'linear-gradient(135deg,#f59e0b,#d97706)',
  excel: 'linear-gradient(135deg,#10b981,#059669)',
  career: 'linear-gradient(135deg,#f43f5e,#e11d48)',
  'interview-questions': 'linear-gradient(135deg,#8b5cf6,#6d28d9)',
  'case-study': 'linear-gradient(135deg,#06b6d4,#0891b2)',
};

export default function CategoryTiles() {
  const [cats, setCats] = useState<{ name: string; slug: string; count: number }[]>([]);

  useEffect(() => {
    let cancelled = false;
    getSidebar().then((d) => {
      if (!cancelled && d && d.categories) setCats(d.categories.filter((c: any) => c.count > 0));
    });
    return () => { cancelled = true; };
  }, []);

  if (cats.length === 0) return null;

  return (
    <div className="category-tiles-wrap">
      <div className="category-tiles">
        {cats.slice(0, 8).map((c) => (
          <Link
            key={c.slug}
            href={`/category/${c.slug}`}
            className="category-tile"
            style={{ background: CAT_GRADS[c.slug] || 'var(--gradient)' }}
          >
            <span className="category-tile-icon">{CAT_ICONS[c.slug] || '📚'}</span>
            <span className="category-tile-name">{c.name}</span>
            <span className="category-tile-count">{c.count} posts</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

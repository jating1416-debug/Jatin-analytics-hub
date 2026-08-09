'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

// CATEGORY TILES v3 - PAGESPEED FIX (LCP 11.67s -> ~1s)
// Problem thi: tiles client-side fetch ke baad aati thin (1-2s+ delay)
//   -> LCP element (category-tile-icon) bahut late render hota tha
//   -> CLS shift (khali jagah -> achanak tiles)
// Fix: tiles ab STATIC server HTML mein turant render (turant dikhti hain)
//   + counts client-side update (bina layout shift ke)

const STATIC_CATS = [
  { name: 'SQL', slug: 'sql', icon: '🗄️', grad: 'linear-gradient(135deg,#4f46e5,#7c3aed)' },
  { name: 'Python', slug: 'python', icon: '🐍', grad: 'linear-gradient(135deg,#0ea5e9,#2563eb)' },
  { name: 'Power BI', slug: 'power-bi', icon: '📈', grad: 'linear-gradient(135deg,#f59e0b,#d97706)' },
  { name: 'Excel', slug: 'excel', icon: '📗', grad: 'linear-gradient(135deg,#10b981,#059669)' },
  { name: 'Career', slug: 'career', icon: '💼', grad: 'linear-gradient(135deg,#f43f5e,#e11d48)' },
  { name: 'Interview Q&A', slug: 'interview-questions', icon: '🎯', grad: 'linear-gradient(135deg,#8b5cf6,#6d28d9)' },
  { name: 'Case Study', slug: 'case-study', icon: '📁', grad: 'linear-gradient(135deg,#06b6d4,#0891b2)' },
];

export default function CategoryTiles() {
  const [counts, setCounts] = useState<Record<string, number>>({});

  // counts SIRF update (text) - tiles pehle se rendered hain, koi shift nahi
  useEffect(() => {
    let cancelled = false;
    fetch('/api/sidebar')
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled && d && d.categories) {
          const c: Record<string, number> = {};
          d.categories.forEach((x: any) => { c[x.slug] = x.count; });
          setCounts(c);
        }
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="category-tiles-wrap">
      <div className="category-tiles">
        {STATIC_CATS.map((c) => (
          <Link
            key={c.slug}
            href={`/category/${c.slug}`}
            className="category-tile"
            style={{ background: c.grad }}
          >
            <span className="category-tile-icon">{c.icon}</span>
            <span className="category-tile-name">{c.name}</span>
            <span className="category-tile-count">
              {counts[c.slug] !== undefined ? `${counts[c.slug]} posts` : ''}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { getSidebar } from '@/lib/client-sidebar';

// HOME: HOT PICKS CAROUSEL - featured posts (horizontal scroll + arrows)
type Pick = {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  categorySlug: string;
  categoryName: string;
};

const CAT_ICONS: Record<string, string> = {
  sql: '🗄️', mysql: '🗄️', python: '🐍', 'power-bi': '📈', excel: '📗',
  career: '💼', 'interview-questions': '🎯', 'case-study': '📁', uncategorized: '📝',
};

export default function HotPicksCarousel() {
  const [picks, setPicks] = useState<Pick[]>([]);
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    getSidebar().then((d) => {
      if (!cancelled && d && d.featured && d.featured.length > 0) setPicks(d.featured);
    });
    return () => { cancelled = true; };
  }, []);

  if (picks.length === 0) return null;

  const scrollBy = (dir: number) => {
    scroller.current?.scrollBy({ left: dir * 320, behavior: 'smooth' });
  };

  return (
    <div className="hot-picks">
      <div className="hot-picks-head">
        <span className="section-chip"><i className="fas fa-fire" /></span>
        <span className="hot-picks-title">Hot Picks</span>
        <span className="hot-picks-sub">Sabse zabardast articles</span>
        <div className="hot-picks-arrows">
          <button onClick={() => scrollBy(-1)} aria-label="Previous"><i className="fas fa-arrow-left" /></button>
          <button onClick={() => scrollBy(1)} aria-label="Next"><i className="fas fa-arrow-right" /></button>
        </div>
      </div>
      <div className="hot-picks-scroller" ref={scroller}>
        {picks.map((p) => (
          <Link key={p.id} href={`/${p.categorySlug}/${p.slug}`} className="hot-pick-card">
            <div className="hot-pick-top">
              <span className="hot-pick-cat">{CAT_ICONS[p.categorySlug] || '📚'} {p.categoryName}</span>
            </div>
            <div className="hot-pick-title">{p.title.slice(0, 90)}</div>
            {p.excerpt && <div className="hot-pick-excerpt">{p.excerpt.slice(0, 110)}…</div>}
            <span className="hot-pick-read">Read Now <i className="fas fa-arrow-right" /></span>
          </Link>
        ))}
      </div>
    </div>
  );
}

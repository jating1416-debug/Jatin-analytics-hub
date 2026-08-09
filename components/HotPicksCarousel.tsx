'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { getSidebar } from '@/lib/client-sidebar';

// HOT PICKS CAROUSEL v2 - PAGESPEED FIX (CLS)
// Skeleton cards (fixed height) jab data load ho raha ho
// -> content kabhi nahi khisakta (0 layout shift)

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
  const [loading, setLoading] = useState(true);
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    getSidebar()
      .then((d) => {
        if (!cancelled && d && d.featured && d.featured.length > 0) setPicks(d.featured);
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const scrollBy = (dir: number) => {
    scroller.current?.scrollBy({ left: dir * 320, behavior: 'smooth' });
  };

  return (
    <div className="hot-picks">
      <div className="hot-picks-head">
        <span className="section-chip"><i className="fas fa-fire" /></span>
        <span className="hot-picks-title" data-i18n="sec.hotpicks">Hot Picks</span>
        <span className="hot-picks-sub" data-i18n="sec.hotpicks-sub">Sabse zabardast articles</span>
        <div className="hot-picks-arrows">
          <button onClick={() => scrollBy(-1)} aria-label="Previous"><i className="fas fa-arrow-left" /></button>
          <button onClick={() => scrollBy(1)} aria-label="Next"><i className="fas fa-arrow-right" /></button>
        </div>
      </div>

      {/* LOADING: skeleton cards (same size - zero shift) */}
      {loading && (
        <div className="hot-picks-scroller" aria-hidden="true">
          {[1, 2, 3].map((i) => (
            <div key={i} className="hot-pick-card">
              <div className="skel" style={{ height: 14, width: '45%' }} />
              <div className="skel" style={{ height: 18, width: '88%' }} />
              <div className="skel" style={{ height: 12, width: '95%' }} />
              <div className="skel" style={{ height: 12, width: '75%' }} />
              <div className="skel" style={{ height: 10, width: '40%' }} />
            </div>
          ))}
        </div>
      )}

      {!loading && picks.length > 0 && (
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
      )}
    </div>
  );
}

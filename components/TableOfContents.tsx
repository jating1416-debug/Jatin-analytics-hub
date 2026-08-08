'use client';

import { useEffect, useState } from 'react';

// TABLE OF CONTENTS v2 - scroll-spy ke sath!
// - Article ke LEFT column mein sticky
// - Scroll karte waqt ACTIVE heading highlight hota hai (bade sites jaisa)

export default function TableOfContents({ html }: { html: string }) {
  const [headings, setHeadings] = useState<{ id: string; text: string; level: number }[]>([]);
  const [active, setActive] = useState('');

  useEffect(() => {
    const temp = document.createElement('div');
    temp.innerHTML = html;
    const items = Array.from(temp.querySelectorAll('h2, h3')).map((h, i) => ({
      id: 'heading-' + i,
      text: h.textContent || '',
      level: h.tagName === 'H3' ? 3 : 2,
    }));
    setHeadings(items);
    // assign ids to real DOM after mount
    const real = document.querySelectorAll('.post-body h2, .post-body h3');
    real.forEach((h, i) => h.setAttribute('id', 'heading-' + i));

    if (items.length < 2) return;

    // SCROLL-SPY - IntersectionObserver se active heading track karo
    const visible = new Map<string, number>();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) visible.set(entry.target.id, entry.boundingClientRect.top);
          else visible.delete(entry.target.id);
        });
        if (visible.size > 0) {
          let bestId = '';
          let bestTop = Infinity;
          visible.forEach((top, id) => { if (top < bestTop) { bestTop = top; bestId = id; } });
          setActive(bestId);
        }
      },
      { rootMargin: '-80px 0px -70% 0px', threshold: 0 }
    );
    real.forEach((h) => observer.observe(h));
    return () => observer.disconnect();
  }, [html]);

  if (headings.length < 2) return null;

  const jump = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 85;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  return (
    <div className="toc-sidebar" id="floating-toc">
      <div className="toc-title">📑 On This Page</div>
      <ul>
        {headings.map((h, i) => (
          <li key={i} style={h.level === 3 ? { marginLeft: '14px' } : undefined}>
            <a
              href={`#heading-${i}`}
              onClick={(e) => jump(e, `heading-${i}`)}
              className={active === `heading-${i}` ? 'active' : ''}
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

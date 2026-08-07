'use client';

import { useEffect, useState } from 'react';

export default function TableOfContents({ html }: { html: string }) {
  const [headings, setHeadings] = useState<{ id: string; text: string; level: number }[]>([]);

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
  }, [html]);

  if (headings.length < 2) return null;

  return (
    <div className="floating-toc" id="floating-toc" style={{ display: 'block' }}>
      <div className="toc-title">📑 On This Page</div>
      <ul>
        {headings.map((h, i) => (
          <li key={i} style={h.level === 3 ? { marginLeft: '14px' } : undefined}>
            <a href={`#heading-${i}`}>{h.text}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}

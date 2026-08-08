'use client';

import { useEffect, useState } from 'react';

// TL;DR BOX - article top pe auto "Key Takeaways"
// Pehle 3 paragraphs se smart summary (koi API nahi - client-side)
export default function TldrBox() {
  const [points, setPoints] = useState<string[]>([]);

  useEffect(() => {
    const body = document.querySelector('.post-body.entry-content');
    if (!body) return;

    const paras = Array.from(body.querySelectorAll('p'))
      .map((p) => (p.textContent || '').replace(/\s+/g, ' ').trim())
      .filter((t) => t.length > 60 && t.length < 400)
      .slice(0, 3);

    if (paras.length === 0) return;
    setPoints(paras.map((p) => (p.length > 160 ? p.slice(0, 157) + '…' : p)));
  }, []);

  if (points.length === 0) return null;

  return (
    <div className="tldr-box">
      <div className="tldr-title"><i className="fas fa-bolt" /> Key Takeaways</div>
      <ul>
        {points.map((p, i) => (
          <li key={i}>{p}</li>
        ))}
      </ul>
    </div>
  );
}

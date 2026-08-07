'use client';

import { useEffect, useState } from 'react';

export default function ReadingProgress() {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      const total = h.scrollHeight - h.clientHeight;
      setWidth(total > 0 ? (h.scrollTop / total) * 100 : 0);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div
      id="scroll-progress"
      style={{ width: width + '%' }}
      aria-hidden="true"
    />
  );
}

'use client';

import { useEffect, useState } from 'react';

// IMAGE LIGHTBOX - post images pe click -> zoom (fullscreen)
export default function ImageLightbox() {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    const body = document.querySelector('.post-body.entry-content');
    if (!body) return;

    const open = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (t.tagName === 'IMG' && t.closest('.post-body')) {
        const img = t as HTMLImageElement;
        if (img.src && img.closest('pre') === null) {
          setSrc(img.src);
        }
      }
    };
    body.addEventListener('click', open);
    return () => body.removeEventListener('click', open);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setSrc(null); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  if (!src) return null;

  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(2,6,23,0.88)', zIndex: 10002,
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, cursor: 'zoom-out',
      }}
      onClick={() => setSrc(null)}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt="Enlarged view"
        style={{ maxWidth: '92vw', maxHeight: '90vh', borderRadius: 8, boxShadow: '0 20px 80px rgba(0,0,0,0.5)' }}
      />
      <button
        onClick={() => setSrc(null)}
        style={{ position: 'absolute', top: 20, right: 24, background: 'none', border: 'none', color: '#fff', fontSize: '2rem', cursor: 'pointer' }}
      >
        ✕
      </button>
    </div>
  );
}

'use client';

// A+ / A- FONT SIZE ADJUSTER - reader apna text size badal sake
export default function FontSizeAdjuster() {
  const adjust = (delta: number) => {
    const body = document.querySelector('.post-body.entry-content') as HTMLElement | null;
    if (!body) return;
    const current = parseFloat(body.style.fontSize) || 16;
    const next = Math.min(22, Math.max(13, current + delta));
    body.style.fontSize = next + 'px';
  };

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 20, padding: '3px 8px' }}>
      <button onClick={() => adjust(-1)} title="Chhota text" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--text-dark)', padding: '4px 7px' }}>
        <i className="fas fa-minus" />
      </button>
      <span style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-dark)' }}>A</span>
      <button onClick={() => adjust(1)} title="Bada text" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--text-dark)', padding: '4px 7px' }}>
        <i className="fas fa-plus" />
      </button>
    </span>
  );
}

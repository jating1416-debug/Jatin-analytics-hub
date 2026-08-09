'use client';

import { useEffect, useState } from 'react';

// MOBILE STICKY BAR - SIRF mobile pe (<=768px) neeche fixed (share + back to top)
// FIX: pehle desktop pe bhi dikh raha tha -> footer cover ho jata tha
export default function MobileStickyBar() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const isMobile = () => window.innerWidth <= 768;
    const onScroll = () => {
      const show = isMobile() && window.scrollY > 300;
      setVisible(show);
      // body class -> footer ko neeche padding milti hai taki bar se cover na ho
      document.body.classList.toggle('mobile-bar-visible', show);
    };
    onScroll(); // initial state
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      document.body.classList.remove('mobile-bar-visible');
    };
  }, []);

  const share = (kind: string) => {
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(document.title);
    let link = '';
    if (kind === 'wa') link = `https://wa.me/?text=${title} ${url}`;
    else if (kind === 'fb') link = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
    else if (kind === 'tg') link = `https://t.me/share/url?url=${url}&text=${title}`;
    else if (kind === 'copy') {
      navigator.clipboard.writeText(window.location.href);
      return;
    }
    window.open(link, '_blank', 'noopener');
  };

  const btnStyle: React.CSSProperties = {
    width: 42, height: 42, borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    background: 'var(--gradient)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '1rem',
  };

  return (
    <div
      style={{
        display: visible ? 'flex' : 'none',
        position: 'fixed', left: 0, right: 0, bottom: 0,
        background: 'var(--card-bg)', borderTop: '1px solid var(--border)',
        padding: '8px 12px calc(8px + env(safe-area-inset-bottom))',
        zIndex: 950, justifyContent: 'space-around', alignItems: 'center',
        boxShadow: '0 -4px 18px rgba(0,0,0,0.10)',
      }}
    >
      <button aria-label="Share on WhatsApp" style={btnStyle} onClick={() => share('wa')} title="Share on WhatsApp"><i className="fab fa-whatsapp" /></button>
      <button aria-label="Share on Facebook" style={btnStyle} onClick={() => share('fb')} title="Share on Facebook"><i className="fab fa-facebook-f" /></button>
      <button aria-label="Share on Telegram" style={btnStyle} onClick={() => share('tg')} title="Share on Telegram"><i className="fab fa-telegram-plane" /></button>
      <button aria-label="Copy link" style={btnStyle} onClick={() => share('copy')} title="Copy link"><i className="fas fa-link" /></button>
      <button aria-label="Back to top" style={{ ...btnStyle, background: 'var(--secondary)' }} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} title="Back to top">
        <i className="fas fa-arrow-up" />
      </button>
    </div>
  );
}

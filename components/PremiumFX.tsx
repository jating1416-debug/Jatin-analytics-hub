'use client';

import { useEffect } from 'react';

// PREMIUM FX - scroll-reveal + count-up (100% free, koi library nahi)
// MOBILE PERFORMANCE: mobile pe sab band (CSS .reveal visible force
// karta hai) - animations sirf CPU khaati hain phone pe, fayda nahi.
// Desktop pe waisa hi chalta hai.
export default function PremiumFX() {
  useEffect(() => {
    // MOBILE: animations band - content CSS se visible hai
    if (window.matchMedia('(max-width: 768px)').matches) return;

    // 1) SCROLL REVEAL — saare .reveal elements pe
    const revealEls = () => {
      document.querySelectorAll('.reveal:not(.revealed)').forEach((el) => {
        const rect = (el as HTMLElement).getBoundingClientRect();
        const vh = window.innerHeight || document.documentElement.clientHeight;
        if (rect.top < vh - 60) {
          el.classList.add('revealed');
        }
      });
    };

    // pehle se viewport mein jo hai unhe turant reveal karo
    revealEls();

    const onScroll = () => requestAnimationFrame(revealEls);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });

    // naye DOM aaye (filter tab switch) to bhi detect karo
    const mo = typeof MutationObserver !== 'undefined'
      ? new MutationObserver(() => requestAnimationFrame(revealEls))
      : null;
    if (mo) mo.observe(document.body, { childList: true, subtree: true });

    // 2) COUNT-UP — .count-up elements (data-count attribute)
    const counters = Array.from(document.querySelectorAll('.count-up[data-count]'));
    const runCounter = (el: Element) => {
      const target = Number((el as HTMLElement).getAttribute('data-count')) || 0;
      const dur = 1200;
      const start = performance.now();
      const step = (now: number) => {
        const p = Math.min(1, (now - start) / dur);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = String(Math.round(target * eased));
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    counters.forEach(runCounter);

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (mo) mo.disconnect();
    };
  }, []);

  return null;
}

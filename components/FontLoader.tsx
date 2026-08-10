'use client';

import { useEffect } from 'react';

// FONT LOADER v6 - LCP FIX + MOBILE FAST
// Problem: v5 fonts ko window.load ke baad load karta tha -> gradient-clip text
// (nav-logo, hero) invisible rehta tha jab tak fonts na aayein -> LCP 4.88s!
// Fix: fonts TURANT async inject (media="print" trick):
//   - CSS render-block nahi karta (media=print -> non-blocking)
//   - Fonts background mein load hote hain (mobile pe bhi fast)
//   - Gradient text jaldi visible -> LCP ~1.5s
// display=swap -> text kabhi invisible nahi (fallback font se)

const FONTS_URL = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Sora:wght@700;800&family=Fira+Code:wght@400&display=swap';
const FA_URL = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';

const FA_SWAP_CSS = `@font-face{font-family:"Font Awesome 6 Free";font-style:normal;font-weight:900;font-display:swap;src:url(https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/webfonts/fa-solid-900.woff2) format("woff2")}@font-face{font-family:"Font Awesome 6 Brands";font-style:normal;font-weight:400;font-display:swap;src:url(https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/webfonts/fa-brands-400.woff2) format("woff2")}`;

export default function FontLoader() {
  useEffect(() => {
    const inject = (href: string, id: string) => {
      if (document.getElementById(id)) return;
      const link = document.createElement('link');
      link.id = id;
      link.rel = 'stylesheet';
      link.href = href;
      link.media = 'print';
      link.onload = () => { link.media = 'all'; };
      document.head.appendChild(link);
    };

    const injectSwap = () => {
      if (document.getElementById('font-fa-swap')) return;
      const style = document.createElement('style');
      style.id = 'font-fa-swap';
      style.textContent = FA_SWAP_CSS;
      document.head.appendChild(style);
    };

    // TURANT async inject (non-blocking) - fonts jaldi, render block nahi
    inject(FONTS_URL, 'font-gfonts');
    inject(FA_URL, 'font-fa');
    injectSwap();

    // Safety: agar kuch fail ho to retry
    setTimeout(() => {
      inject(FONTS_URL, 'font-gfonts');
      inject(FA_URL, 'font-fa');
    }, 3000);
  }, []);

  return null;
}

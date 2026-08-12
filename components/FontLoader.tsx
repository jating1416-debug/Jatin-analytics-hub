'use client';

import { useEffect } from 'react';

// FONT LOADER v7 - LCP FIX + MOBILE FAST + PERFORMANCE
// - Google Fonts: TURANT non-blocking (media=print trick) -> text kabhi invisible nahi
// - Font Awesome (273KB): ab IDLE pe load hota hai (page load ke baad)
//   -> mobile pe LCP/TBT pe koi bhaar nahi, icons 1-2 sec baad aate hain
// display=optional -> font swap kabhi nahi -> font-CLS ZERO

const FONTS_URL = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Sora:wght@700;800&family=Fira+Code:wght@400&display=optional';
const FA_URL = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';

const FA_SWAP_CSS = `@font-face{font-family:"Font Awesome 6 Free";font-style:normal;font-weight:900;font-display:swap;src:url(https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/webfonts/fa-solid-900.woff2) format("woff2")}@font-face{font-family:"Font Awesome 6 Brands";font-style:normal;font-weight:400;font-display:swap;src:url(https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/webfonts/fa-brands-400.woff2) format("woff2")}`;

export default function FontLoader() {
  useEffect(() => {
    const inject = (href: string, id: string, mediaPrint = true) => {
      if (document.getElementById(id)) return;
      const link = document.createElement('link');
      link.id = id;
      link.rel = 'stylesheet';
      link.href = href;
      if (mediaPrint) {
        link.media = 'print';
        link.onload = () => { link.media = 'all'; };
      }
      document.head.appendChild(link);
    };

    const injectSwap = () => {
      if (document.getElementById('font-fa-swap')) return;
      const style = document.createElement('style');
      style.id = 'font-fa-swap';
      style.textContent = FA_SWAP_CSS;
      document.head.appendChild(style);
    };

    // Google Fonts: TURANT (LCP ke liye - text hamesha visible)
    inject(FONTS_URL, 'font-gfonts');

    // FONT AWESOME: IDLE PE (page load ke baad - mobile speed ke liye)
    const idle = (cb: () => void) => {
      if (typeof (window as any).requestIdleCallback === 'function') (window as any).requestIdleCallback(cb);
      else setTimeout(cb, 2500);
    };
    idle(() => {
      inject(FA_URL, 'font-fa');
      injectSwap();
      // safety retry agar fail ho
      setTimeout(() => inject(FA_URL, 'font-fa'), 3000);
    });
  }, []);

  return null;
}

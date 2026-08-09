'use client';

import { useEffect } from 'react';

// FONT LOADER v5 - MOBILE PERFORMANCE FINAL
// Fonts sirf window 'load' ke BAAD inject hote hain -> FCP/LCP/SI ke dauran
// network pe koi third-party font nahi -> text system font se turant render.
// Mobile slow 4G pe: load ~5-6s hota hai -> fonts uske baad (icons thodi der baad)
// Desktop fast pe: load ~1.5s -> fonts bhi turant (koi visible farak nahi).
// display=swap -> text kabhi invisible nahi hota.

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

    const loadFonts = () => {
      // Google Fonts turant (load ho chuka hai -> koi competition nahi)
      inject(FONTS_URL, 'font-gfonts');
      // Font Awesome thoda aur der (sabse bada 254KB - icons non-critical)
      setTimeout(() => { inject(FA_URL, 'font-fa'); injectSwap(); }, 400);
    };

    if (document.readyState === 'complete') {
      loadFonts();
    } else {
      window.addEventListener('load', loadFonts, { once: true });
      // safety: 5s baad bhi load na ho to fonts laao (page kabhi font-less nahi)
      const safety = setTimeout(loadFonts, 5000);
      const onLoad = () => clearTimeout(safety);
      window.addEventListener('load', onLoad, { once: true });
    }
  }, []);

  return null;
}

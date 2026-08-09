'use client';

import { useEffect } from 'react';

// FONT LOADER v3 - MOBILE LCP FIX
// Problem: Slow 4G pe FA (254KB) + Google Fonts (195KB) = 470KB network busy
//   -> hero text 3.8s tak paint nahi hota (LCP 5.6s, FCP 5.4s)
// Fix: Fonts DELAYED inject:
//   - Google Fonts: 1.2s baad (text pehle system font se render -> LCP turant)
//   - Font Awesome: 2.5s baad (icons thodi der baad aate hain - content text hai)
//   - window 'load' fallback: agar page pehle load ho jaye to bhi fonts aayenge
// Display=swap -> text kabhi invisible nahi hota.

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

    // Google Fonts - 1.2s delay (text pehle fallback se)
    const t1 = setTimeout(() => { inject(FONTS_URL, 'font-gfonts'); }, 1200);
    // Font Awesome - 2.5s delay (icons non-critical)
    const t2 = setTimeout(() => { inject(FA_URL, 'font-fa'); injectSwap(); }, 2500);

    // fallback: page load complete ho jaye to bhi inject karo
    const onLoad = () => {
      inject(FONTS_URL, 'font-gfonts');
      inject(FA_URL, 'font-fa');
      injectSwap();
    };
    if (document.readyState === 'complete') onLoad();
    else window.addEventListener('load', onLoad);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      window.removeEventListener('load', onLoad);
    };
  }, []);

  return null;
}

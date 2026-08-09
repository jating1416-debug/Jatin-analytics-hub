'use client';

import { useEffect } from 'react';

// FONT LOADER v4 - MOBILE LCP FINAL FIX
// Problem: Slow 4G pe FA (254KB) + Google Fonts (195KB) = 470KB third-party
//   -> network busy, hero text 3.8s tak paint nahi (LCP 5.6s, FCP 5.4s)
// Fix (aggressive delay):
//   - Google Fonts: 1.5s baad (text pehle system font se turant render)
//   - Font Awesome: 3.0s baad (sabse badi 254KB - icons decorative, baad mein)
//   - display=swap -> text kabhi invisible nahi
//   - 'load' fallback: page pehle load ho jaye to bhi fonts aayenge
// NOTE: ye version hamesha SABSE LAST deploy karna - koi purana zip isko
// overwrite na kare (warna mobile LCP wapas 5.6s ho jayega)

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

    // Google Fonts - 1.5s delay (text pehle fallback se render -> LCP fast)
    const t1 = setTimeout(() => { inject(FONTS_URL, 'font-gfonts'); }, 1500);
    // Font Awesome - 3s delay (sabse bada 254KB - icons non-critical)
    const t2 = setTimeout(() => { inject(FA_URL, 'font-fa'); injectSwap(); }, 3000);

    // fallback: page load complete ho jaye to bhi inject
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

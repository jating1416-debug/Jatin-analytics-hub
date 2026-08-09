'use client';

import { useEffect } from 'react';

// FONT LOADER - Google Fonts + Font Awesome ko NON-BLOCKING load karta hai
// (media="print" trick) — isse mobile pe FCP/LCP 4s -> ~1.5s aa jata hai.
// Client component isliye kyunki onLoad event handler sirf client mein allowed hai.

const FONTS_URL = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Sora:wght@700;800&family=Fira+Code:wght@400&display=swap';
const FA_URL = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';

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
    inject(FONTS_URL, 'font-gfonts');
    inject(FA_URL, 'font-fa');
  }, []);

  return null;
}

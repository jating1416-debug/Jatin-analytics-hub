'use client';

import { useEffect, useState } from 'react';

// MULTI-LANGUAGE v2 - English/Hindi UI toggle
// data-i18n="key" wale saare elements translate hote hain (nav, titles, tabs, footer...)
// localStorage mein save + MutationObserver se naye elements pe bhi apply

const TEXTS: Record<string, Record<string, string>> = {
  en: {
    'nav.home': '🏠 Home',
    'nav.downloads': '📥 Downloads',
    'nav.portfolio': '🚀 My Portfolio',
    'nav.cheatsheet': 'Cheat Sheet',
    'nav.hub': 'Hub',
    'nav.search': 'Search posts...',
    'hero.tag': 'DATA ANALYTICS BLOG',
    'hero.start': '📚 Start Learning',
    'hero.tools': '🛠️ Free Tools',
    'hero.scroll': 'Scroll to explore',
    'sec.latest': 'Latest Articles',
    'sec.tools': 'Free Analyst Tools',
    'sec.hotpicks': 'Hot Picks',
    'sec.hotpicks-sub': 'Sabse zabardast articles',
    'f.all': 'All',
    'f.readmore': 'Read More',
    'f.minread': 'min read',
    'sidebar.categories': 'Categories',
    'sidebar.recent': 'Recent Posts',
    'sidebar.popular': 'Popular Posts',
    'sidebar.trending': 'Trending',
    'sidebar.toolkit': 'Analyst Toolkit',
    'sidebar.toolbox': 'Developer Toolbox',
    'sidebar.alltools': 'All Tools',
    'sidebar.reading': 'Reading List',
    'footer.topics': 'Topics',
    'footer.quick': 'Quick Links',
    'footer.legal': 'Legal & Info',
    'footer.rights': 'All Rights Reserved.',
    'author.role': 'Data Analyst & Educator',
  },
  hi: {
    'nav.home': '🏠 होम',
    'nav.downloads': '📥 डाउनलोड',
    'nav.portfolio': '🚀 मेरा पोर्टफोलियो',
    'nav.cheatsheet': 'चीट शीट',
    'nav.hub': 'हब',
    'nav.search': 'पोस्ट खोजें...',
    'hero.tag': 'डेटा एनालिटिक्स ब्लॉग',
    'hero.start': '📚 सीखना शुरू करें',
    'hero.tools': '🛠️ फ्री टूल्स',
    'hero.scroll': 'नीचे स्क्रॉल करें',
    'sec.latest': 'नवीनतम लेख',
    'sec.tools': 'फ्री एनालिस्ट टूल्स',
    'sec.hotpicks': 'टॉप पिक्स',
    'sec.hotpicks-sub': 'सबसे शानदार आर्टिकल',
    'f.all': 'सभी',
    'f.readmore': 'और पढ़ें',
    'f.minread': 'मिनट पढ़ाई',
    'sidebar.categories': 'श्रेणियाँ',
    'sidebar.recent': 'हाल के पोस्ट',
    'sidebar.popular': 'लोकप्रिय पोस्ट',
    'sidebar.trending': 'ट्रेंडिंग',
    'sidebar.toolkit': 'एनालिस्ट टूलकिट',
    'sidebar.toolbox': 'डेवलपर टूलबॉक्स',
    'sidebar.alltools': 'सभी टूल्स',
    'sidebar.reading': 'रीडिंग लिस्ट',
    'footer.topics': 'विषय',
    'footer.quick': 'त्वरित लिंक',
    'footer.legal': 'कानूनी जानकारी',
    'footer.rights': 'सर्वाधिकार सुरक्षित।',
    'author.role': 'डेटा एनालिस्ट और एजुकेटर',
  },
};

export default function LanguageToggle() {
  const [lang, setLang] = useState<'en' | 'hi'>('en');

  // FIX (page-freeze bug): applyLang ke andar textContent SIRF tab set karo
  // jab value actually badal rahi ho (el.textContent !== t[key]).
  // Pehle har baar set hota tha -> MutationObserver dobara fire -> INFINITE LOOP
  // -> browser freeze. Ab guard + applying flag se loop impossible hai.
  let applying = false;
  const applyLang = (l: 'en' | 'hi') => {
    applying = true;
    try {
      document.documentElement.setAttribute('data-lang', l);
      const t = TEXTS[l];
      document.querySelectorAll('[data-i18n]').forEach((el) => {
        const key = el.getAttribute('data-i18n');
        if (key && t[key] && el.textContent !== t[key]) {
          el.textContent = t[key];
        }
      });
    } finally {
      applying = false;
    }
  };

  useEffect(() => {
    // saved lang apply karo + naye elements (posts load) pe bhi auto-apply
    let saved: 'en' | 'hi' = 'en';
    try { saved = localStorage.getItem('di_lang') === 'hi' ? 'hi' : 'en'; } catch {}
    setLang(saved);
    applyLang(saved);

    // MutationObserver sirf tab react kare jab hum khud apply NAHI kar rahe ho
    const mo = typeof MutationObserver !== 'undefined'
      ? new MutationObserver(() => { if (!applying) applyLang(saved); })
      : null;
    if (mo) mo.observe(document.body, { childList: true, subtree: true });
    return () => { if (mo) mo.disconnect(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggle = () => {
    const next = lang === 'en' ? 'hi' : 'en';
    setLang(next);
    try { localStorage.setItem('di_lang', next); } catch {}
    applyLang(next);
  };

  return (
    <button
      onClick={toggle}
      style={{
        background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text-dark)',
        padding: '8px 12px', borderRadius: 20, fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer',
        flexShrink: 0,
      }}
      title="Toggle Language / भाषा बदलें"
    >
      {lang === 'en' ? 'हिंदी' : 'EN'}
    </button>
  );
}

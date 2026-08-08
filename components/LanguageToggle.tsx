'use client';

import { useState } from 'react';

// MULTI-LANGUAGE (basic) - UI labels English/Hindi toggle
// Content as-is, sirf UI text switch hota hai (localStorage mein save)
const TEXTS = {
  en: {
    latest: '📝 Latest Articles',
    readMore: 'Read More',
    minRead: 'min read',
    search: 'Search posts...',
    home: '🏠 Home',
  },
  hi: {
    latest: '📝 नवीनतम लेख',
    readMore: 'और पढ़ें',
    minRead: 'मिनट पढ़ाई',
    search: 'पोस्ट खोजें...',
    home: '🏠 होम',
  },
};

export default function LanguageToggle() {
  const [lang, setLang] = useState<'en' | 'hi'>('en');

  const toggle = () => {
    const next = lang === 'en' ? 'hi' : 'en';
    setLang(next);
    try { localStorage.setItem('di_lang', next); } catch {}
    // Update visible UI texts
    document.documentElement.setAttribute('data-lang', next);
    const t = TEXTS[next];
    const latest = document.querySelector('.section-title');
    if (latest && (latest.textContent || '').includes('Latest')) latest.textContent = t.latest;
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

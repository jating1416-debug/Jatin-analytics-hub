'use client';

import { useEffect, useState } from 'react';

// Light client widgets: back-to-top, quote of day, random article, listen, save later
// JATIN KE QUOTES - 25 apne quotes, har din ek naya (daily rotate)
const QUOTES = [
  'Data sirf numbers nahi, sahi decision ki kahani hoti hai.',
  'Jab data bolta hai, assumptions ko chup rehna padta hai.',
  'Good analysts data ko read nahi karte, data ko understand karte hain.',
  'Har dataset ke andar ek story hoti hai, bas analyst ko use find karna aana chahiye.',
  'Clean data se better analysis aur better analysis se better decisions aate hain.',
  'Data Analytics ka goal numbers dikhana nahi, insights dikhana hai.',
  'SQL data nikal sakta hai, lekin insight analyst nikalta hai.',
  'Dashboard tab useful hai jab woh sirf beautiful nahi, actionable bhi ho.',
  'Data mein pattern dhoondhna analysis hai, pattern ka meaning samajhna intelligence hai.',
  'Har number ek question ka answer nahi hota; kabhi-kabhi woh ek naya question hota hai.',
  'Bad data se beautiful dashboard bhi bad decision de sakta hai.',
  'Data cleaning boring lag sakti hai, lekin accurate analysis wahi se start hota hai.',
  'Excel ho, SQL ho ya Python — tool important nahi, problem solve karna important hai.',
  'Jo data ko question karna seekh gaya, woh analysis karna seekh gaya.',
  'Numbers ko visualize karo, patterns ko identify karo, aur decisions ko improve karo.',
  'Analytics mein sabse powerful skill ek achha question poochna hai.',
  'Data tumhe batata hai kya hua, analysis tumhe samjhata hai kyun hua.',
  'A good dashboard answers questions before the user asks them.',
  'Data analyst ka kaam report banana nahi, clarity create karna hai.',
  'Jitna better data samjhoge, utne better decisions loge.',
  'Trend dekhna easy hai, trend ke peeche ki story samajhna real analytics hai.',
  'Numbers kabhi lie nahi bolte, lekin unki interpretation galat ho sakti hai.',
  'Data ko clean karo, context do, visualize karo — tab insight valuable banti hai.',
  'Analytics ka real value tab hai jab insight action mein convert ho.',
  'Learn the tools, understand the data, solve the problem.',
];

export default function ClientWidgets() {
  const [showTop, setShowTop] = useState(false);
  const [quote, setQuote] = useState('');

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 400);
    window.addEventListener('scroll', onScroll, { passive: true });
    const day = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    setQuote(QUOTES[day % QUOTES.length]);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const randomArticle = async () => {
    try {
      const res = await fetch('/api/random-article');
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch {}
  };

  const listen = () => {
    const body = document.querySelector('.post-body.entry-content');
    if (!body) return;
    if (!('speechSynthesis' in window)) { alert('Browser TTS support nahi karta'); return; }
    if (window.speechSynthesis.speaking) { window.speechSynthesis.cancel(); return; }
    const text = (body.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 6000);
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.95;
    window.speechSynthesis.speak(u);
  };

  const saveLater = () => {
    try {
      const title = document.querySelector('h1')?.textContent || document.title;
      const url = window.location.href.split('?')[0];
      const list = JSON.parse(localStorage.getItem('di_saved') || '[]');
      if (!list.some((x: any) => x.url === url)) {
        list.unshift({ title, url });
        localStorage.setItem('di_saved', JSON.stringify(list));
        alert('🔖 Save ho gaya! (Reading List localStorage mein)');
      } else {
        alert('Ye post pehle se saved hai');
      }
    } catch {}
  };

  return (
    <>
      {/* Back to top */}
      {showTop && (
        <button
          aria-label="Back to top"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          style={{
            position: 'fixed', right: 20, bottom: 86, width: 44, height: 44, borderRadius: '50%',
            background: 'var(--secondary)', color: '#fff', border: 'none', cursor: 'pointer', zIndex: 9997,
            boxShadow: '0 6px 18px rgba(0,0,0,0.2)',
          }}
          title="Back to top"
        >
          <i className="fas fa-arrow-up" />
        </button>
      )}

      {/* Post toolbar (article pages pe) */}
      {typeof window !== 'undefined' && window.location.pathname.split('/').length >= 3 && document.querySelector('.post-body.entry-content') && (
        <div className="post-toolbar" style={{ display: 'none' }} />
      )}

      {/* Quote of day (sidebar ke liye - navbar ke paas render hota hai, CSS se hide) */}
      <div id="qotd-data" style={{ display: 'none' }} data-q={quote} data-a="" />

      {/* Floating mini actions on article pages */}
      {typeof window !== 'undefined' && /^\/(sql|python|power-bi|excel|career|interview-questions|case-study|misc)\//.test(window.location.pathname) && (
        <div style={{ position: 'fixed', left: 14, top: '50%', transform: 'translateY(-50%)', display: 'flex', flexDirection: 'column', gap: 8, zIndex: 9990 }}>
          <button onClick={listen} style={{ width: 42, height: 42, borderRadius: '50%', background: 'var(--card-bg)', border: '1px solid var(--border)', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.12)' }} title="Listen (TTS)"><i className="fas fa-headphones" /></button>
          <button onClick={saveLater} style={{ width: 42, height: 42, borderRadius: '50%', background: 'var(--card-bg)', border: '1px solid var(--border)', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.12)' }} title="Save for later"><i className="far fa-bookmark" /></button>
        </div>
      )}

      {/* Quote + random article buttons (sidebar bottom) - CSS se position karenge */}
      <div id="client-extras" style={{ display: 'none' }}>
        <button id="random-article-btn" onClick={randomArticle}>🎲 Random Article</button>
        <div id="qotd-box">{quote}</div>
      </div>
    </>
  );
}

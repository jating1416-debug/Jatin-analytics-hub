'use client';

import { useState } from 'react';

// WAS THIS HELPFUL? - post ke end mein feedback buttons (localStorage)
export default function FeedbackWidget() {
  const [state, setState] = useState<'none' | 'yes' | 'no'>('none');

  const send = (v: 'yes' | 'no') => {
    try {
      const key = 'di_fb_' + window.location.pathname;
      if (localStorage.getItem(key)) return;
      localStorage.setItem(key, v);
    } catch {}
    setState(v);
    if (v === 'yes') {
      // confetti
      for (let i = 0; i < 20; i++) {
        setTimeout(() => {
          const el = document.createElement('div');
          el.style.cssText = `position:fixed;top:-10px;left:${Math.random()*100}vw;width:8px;height:12px;background:hsl(${Math.random()*360},70%,60%);border-radius:2px;z-index:99999;pointer-events:none;animation:confFall ${0.9+Math.random()}s linear forwards;`;
          document.body.appendChild(el);
          setTimeout(() => el.remove(), 2000);
        }, i * 60);
      }
      const style = document.createElement('style');
      style.textContent = '@keyframes confFall{to{transform:translateY(105vh) rotate(720deg);opacity:0.5}}';
      document.head.appendChild(style);
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', margin: '10px 0 25px', padding: '14px 18px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 12, fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-dark)' }}>
      <span>Was this article helpful?</span>
      {state === 'none' ? (
        <>
          <button onClick={() => send('yes')} style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 20, padding: '6px 14px', cursor: 'pointer', fontWeight: 600 }}>👍 Yes</button>
          <button onClick={() => send('no')} style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 20, padding: '6px 14px', cursor: 'pointer', fontWeight: 600 }}>👎 No</button>
        </>
      ) : (
        <span style={{ color: '#16a34a', fontSize: '0.85rem' }}>
          {state === 'yes' ? 'Thanks! ❤️ Aage aur aisi posts aayengi!' : 'Thanks for feedback — improve karenge! 🙏'}
        </span>
      )}
    </div>
  );
}

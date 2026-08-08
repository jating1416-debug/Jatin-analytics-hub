'use client';

import { useEffect } from 'react';

// KONAMI CODE EASTER EGG - ↑↑↓↓←→←→BA (mazedaar surprise)
const KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

export default function KonamiCode() {
  useEffect(() => {
    let idx = 0;
    const handler = (e: KeyboardEvent) => {
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      if (key === KONAMI[idx]) {
        idx++;
        if (idx === KONAMI.length) {
          idx = 0;
          // TRIGGER: confetti + rainbow mode
          const style = document.createElement('style');
          style.textContent = `
            @keyframes konRainbow { 0%{filter:hue-rotate(0)} 100%{filter:hue-rotate(360deg)} }
            body.konami-mode .navbar, body.konami-mode .featured-banner { animation: konRainbow 2s linear infinite; }
            body.konami-mode .read-more-btn { background: linear-gradient(135deg,#00f5d4,#00bbf9,#9b5de5)!important; }
          `;
          document.head.appendChild(style);
          document.body.classList.add('konami-mode');
          setTimeout(() => document.body.classList.remove('konami-mode'), 8000);
          // confetti
          for (let i = 0; i < 50; i++) {
            setTimeout(() => {
              const el = document.createElement('div');
              el.style.cssText = `position:fixed;top:-10px;left:${Math.random()*100}vw;width:9px;height:14px;background:hsl(${Math.random()*360},75%,60%);border-radius:2px;z-index:99999;pointer-events:none;animation:konFall ${0.8+Math.random()*1.2}s linear forwards;`;
              document.body.appendChild(el);
              setTimeout(() => el.remove(), 2500);
            }, i * 40);
          }
          const fs = document.createElement('style');
          fs.textContent = '@keyframes konFall{to{transform:translateY(105vh) rotate(720deg);opacity:0.5}}';
          document.head.appendChild(fs);
          alert('🎉 KONAMI! Rainbow mode on — mazaa aaya?');
        }
      } else {
        idx = key === KONAMI[0] ? 1 : 0;
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  return null;
}

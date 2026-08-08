'use client';

import { useEffect } from 'react';

// HEADING LINKS - article headings pe hover karo -> 🔗 copy link button
// (GitHub/Notion jaisa) - exact section ka shareable link
export default function HeadingLinks() {
  useEffect(() => {
    const apply = () => {
      document.querySelectorAll('.post-body h2, .post-body h3').forEach((h) => {
        if ((h as HTMLElement).dataset.hlApplied) return;
        (h as HTMLElement).dataset.hlApplied = '1';

        const btn = document.createElement('button');
        btn.className = 'heading-link-btn';
        btn.innerHTML = '<i class="fas fa-link"></i>';
        btn.title = 'Copy link to this section';
        btn.setAttribute('aria-label', 'Copy section link');

        btn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          const url = window.location.href.split('#')[0] + '#' + h.id;
          try {
            navigator.clipboard.writeText(url);
            btn.innerHTML = '<i class="fas fa-check"></i>';
            btn.classList.add('copied');
            setTimeout(() => {
              btn.innerHTML = '<i class="fas fa-link"></i>';
              btn.classList.remove('copied');
            }, 1500);
          } catch {
            window.prompt('Copy this link:', url);
          }
        });

        h.appendChild(btn);
        h.style.position = 'relative';
      });
    };

    apply();
    const mo = typeof MutationObserver !== 'undefined'
      ? new MutationObserver(() => apply())
      : null;
    if (mo) mo.observe(document.body, { childList: true, subtree: true });
    return () => { if (mo) mo.disconnect(); };
  }, []);

  return null;
}

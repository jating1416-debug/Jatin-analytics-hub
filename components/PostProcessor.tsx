'use client';

import { useEffect } from 'react';
import { restoreQuizProgress } from '@/lib/post-transform';

// POST PROCESSOR (CLIENT)
// Content ab SERVER pe normalize hota hai (lib/post-transform) ->
// yahan sirf 2 kaam:
//   1) QUIZ INTERACTIVITY (options select + check answers)
//   2) QUIZ PROGRESS RESTORE (localStorage saved answers dikhao)
// SAFETY: sab kuch try/catch mein - koi bhi error page kabhi crash nahi karega
export default function PostProcessor({ html }: { html: string }) {
  // QUIZ INTERACTIVITY (event delegation - document pe, ek baar)
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      try {
        const target = e.target as HTMLElement;
        const submitBtn = target.closest('.quiz-submit') as HTMLElement | null;
        if (submitBtn) {
          const qi = Number(submitBtn.getAttribute('data-qi'));
          const bi = Number(submitBtn.getAttribute('data-quiz'));
          const block = document.querySelectorAll('.quiz-block')[bi];
          if (!block) return;
          const selected = block.querySelector(`.quiz-opt[data-qi="${qi}"].selected`) as HTMLElement | null;
          if (!selected) { submitBtn.textContent = 'Pehle option chuno!'; return; }
          const oi = Number(selected.getAttribute('data-oi'));
          const allOpts = block.querySelectorAll(`.quiz-opt[data-qi="${qi}"]`);
          let correct = -1;
          allOpts.forEach((o) => {
            const el = o as HTMLElement;
            if (el.getAttribute('data-ans') === '1') correct = Number(el.getAttribute('data-oi'));
          });
          const isCorrect = oi === correct;
          allOpts.forEach((o) => {
            const el = o as HTMLElement;
            const oIdx = Number(el.getAttribute('data-oi'));
            el.style.cursor = 'default';
            if (oIdx === correct) { el.style.borderColor = '#16a34a'; el.style.background = 'rgba(22,163,74,0.12)'; }
            else if (oIdx === oi && !isCorrect) { el.style.borderColor = '#ef4444'; el.style.background = 'rgba(239,68,68,0.10)'; }
          });
          submitBtn.textContent = isCorrect ? '✅ Sahi!' : '❌ Galat — sahi jawab upar green hai';
          submitBtn.disabled = true;
          const key = 'di_quiz_' + window.location.pathname + '_' + bi;
          let prog: Record<string, number> = {};
          try { prog = JSON.parse(localStorage.getItem(key) || '{}'); } catch {}
          prog['q' + qi] = oi;
          try { localStorage.setItem(key, JSON.stringify(prog)); } catch {}
          // progress count update
          const progressEl = block.querySelector('.quiz-progress') as HTMLElement | null;
          if (progressEl) {
            const qis = new Set<string>();
            block.querySelectorAll('.quiz-opt').forEach((o) => qis.add(o.getAttribute('data-qi') || ''));
            progressEl.textContent = `${Object.keys(prog).length}/${qis.size} answered`;
          }
          return;
        }

        const opt = target.closest('.quiz-opt') as HTMLElement | null;
        if (opt && opt.style.cursor !== 'default') {
          const qi = opt.getAttribute('data-qi');
          const bi = opt.getAttribute('data-quiz');
          const block = document.querySelectorAll('.quiz-block')[Number(bi)];
          if (!block) return;
          block.querySelectorAll(`.quiz-opt[data-qi="${qi}"]`).forEach((o) => {
            (o as HTMLElement).style.borderColor = 'var(--border)';
            (o as HTMLElement).style.background = '';
          });
          opt.style.borderColor = 'var(--primary)';
          opt.style.background = 'rgba(102,126,234,0.10)';
          opt.classList.add('selected');
        }
      } catch (err) {
        console.error('quiz handler error (safely ignored):', err);
      }
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  // SAVED QUIZ PROGRESS restore (content server se aata hai, localStorage yahan lagta hai)
  useEffect(() => {
    try {
      restoreQuizProgress();
    } catch (e) {
      console.error('quiz restore error (safely ignored):', e);
    }
  }, [html]);

  return null;
}

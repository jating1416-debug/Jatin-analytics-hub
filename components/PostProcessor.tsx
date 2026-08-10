'use client';

import { useEffect } from 'react';

// Post content ke shortcodes process karta hai:
// [tip], [note], [warning], [danger] -> callout boxes
// [quiz] -> interactive quiz (3 questions, green/red, localStorage progress)
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

  // CONTENT PROCESSING - ek baar, fully guarded
  useEffect(() => {
    try {
      const body = document.querySelector('.post-body.entry-content');
      if (!body) return;

      if (body.getAttribute('data-processed') === '1') return;
      body.setAttribute('data-processed', '1');

      let processed = body.innerHTML;

      // ---------- TABLE NORMALIZER (saari posts ki tables auto-fix) ----------
      try {
        if (body.getAttribute('data-tables-done') !== '1') {
          body.setAttribute('data-tables-done', '1');
          body.querySelectorAll('table').forEach((tbl) => {
            ['border', 'cellpadding', 'cellspacing', 'width', 'style'].forEach((attr) => tbl.removeAttribute(attr));

            tbl.querySelectorAll('td, th').forEach((cell) => {
              cell.removeAttribute('style');
              cell.removeAttribute('width');
              cell.removeAttribute('height');
              cell.removeAttribute('bgcolor');
              cell.removeAttribute('background');
            });

            // SMART header detection - pehli row ko th SIRF TAB jab wo header ho
            const firstRow = tbl.querySelector('tr');
            let makeHeader = false;
            if (firstRow && !firstRow.querySelector('th')) {
              const cells = Array.from(firstRow.querySelectorAll('td'));
              if (cells.length > 0) {
                const hasBold = cells.some((c) => c.querySelector('b, strong'));
                const allShort = cells.every((c) => (c.textContent || '').trim().length <= 40);
                const hasTwoRows = tbl.querySelectorAll('tr').length >= 2;
                makeHeader = hasBold || (allShort && hasTwoRows);
              }
            }
            if (makeHeader) {
              firstRow.querySelectorAll('td').forEach((td) => {
                const th = document.createElement('th');
                th.innerHTML = td.innerHTML;
                th.setAttribute('scope', 'col');
                td.replaceWith(th);
              });
            }

            if (makeHeader && !tbl.querySelector('thead')) {
              const tHead = document.createElement('thead');
              tHead.appendChild(firstRow);
              tbl.insertBefore(tHead, tbl.firstChild);
            }
            if (!tbl.querySelector('tbody')) {
              const tBody = document.createElement('tbody');
              const rows = tbl.querySelectorAll('tr');
              rows.forEach((r) => tBody.appendChild(r));
              tbl.appendChild(tBody);
            }
          });
        }
      } catch (e) { console.error('table normalize error:', e); }

      // ---------- HEADING ORDER FIX (a11y) ----------
      try {
        processed = processed.replace(/<h4([^>]*)>/gi, '<h3$1 class="content-h3">');
        processed = processed.replace(/<\/h4>/gi, '</h3>');
      } catch {}

      // ---------- LAZY IMAGES (speed) ----------
      try {
        processed = processed.replace(/<img\s/gi, '<img loading="lazy" decoding="async" ');
      } catch {}

      // ---------- CALLOUT BOXES ----------
      try {
        const callouts: [RegExp, string, string][] = [
          [/\[tip\]([\s\S]*?)\[\/tip\]/g, 'tip', '💡 Tip'],
          [/\[note\]([\s\S]*?)\[\/note\]/g, 'note', '📝 Note'],
          [/\[warning\]([\s\S]*?)\[\/warning\]/g, 'warning', '⚠️ Warning'],
          [/\[danger\]([\s\S]*?)\[\/danger\]/g, 'danger', '⛔ Important'],
        ];
        callouts.forEach(([re, cls, label]) => {
          processed = processed.replace(re, (_, inner) =>
            `<div class="callout callout-${cls}" style="border-radius:10px;padding:14px 18px;margin:18px 0;border-left:4px solid ${
              cls === 'tip' ? '#10b981' : cls === 'note' ? '#667eea' : cls === 'warning' ? '#f59e0b' : '#ef4444'
            };background:${
              cls === 'tip' ? 'rgba(16,185,129,0.10)' : cls === 'note' ? 'rgba(102,126,234,0.10)' : cls === 'warning' ? 'rgba(245,158,11,0.12)' : 'rgba(239,68,68,0.10)'
            }"><b>${label}</b><br/>${inner}</div>`
          );
        });
      } catch {}

      body.innerHTML = processed;

      // ---------- QUIZ SHORTCODE ----------
      try {
        const quizRe = /\[quiz\]([\s\S]*?)\[\/quiz\]/g;
        const quizBlocks: string[] = [];
        let qm;
        while ((qm = quizRe.exec(processed)) !== null) quizBlocks.push(qm[1]);

        quizBlocks.forEach((block, bi) => {
          const lines = block.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);
          const questions: { q: string; opts: string[]; ans: number }[] = [];
          lines.forEach((line) => {
            const parts = line.split('|');
            if (parts.length < 7) return;
            questions.push({
              q: parts[1].trim(),
              opts: [parts[2].trim(), parts[3].trim(), parts[4].trim(), parts[5].trim()],
              ans: parseInt(parts[6].trim(), 10),
            });
          });
          if (questions.length === 0) return;

          const key = 'di_quiz_' + window.location.pathname + '_' + bi;
          let prog: Record<string, number> = {};
          try { prog = JSON.parse(localStorage.getItem(key) || '{}'); } catch {}

          let html = `<div class="quiz-block" style="background:var(--card-bg);border:1px solid var(--border);border-radius:14px;padding:20px 22px;margin:24px 0;box-shadow:var(--shadow);">`;
          html += `<div class="quiz-head" style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;"><span style="font-size:1.05rem;font-weight:800;">📝 Quick Quiz</span><span style="font-size:0.75rem;font-weight:700;color:var(--text-light);">${Object.keys(prog).length}/${questions.length} answered</span></div>`;

          questions.forEach((q, qi) => {
            const saved = prog['q' + qi];
            html += `<div style="margin-bottom:14px;padding:14px 16px;border:1px solid var(--border);border-radius:12px;background:var(--bg);">`;
            html += `<div style="font-weight:700;font-size:0.93rem;margin-bottom:10px;">${qi + 1}. ${q.q}</div>`;
            q.opts.forEach((opt, oi) => {
              const isAns = oi + 1 === q.ans;
              const isSel = saved === oi + 1;
              const cls = saved ? (isAns ? 'correct' : isSel ? 'wrong' : '') : '';
              html += `<div class="quiz-opt ${cls}" data-qi="${qi}" data-oi="${oi + 1}" data-quiz="${bi}" data-ans="${isAns ? '1' : '0'}" style="display:flex;align-items:center;gap:10px;padding:8px 12px;margin:5px 0;border:1px solid var(--border);border-radius:10px;cursor:${saved ? 'default' : 'pointer'};font-size:0.88rem;${
                isAns && saved ? 'border-color:#16a34a!important;background:rgba(22,163,74,0.12)!important;' : ''
              }${isSel && saved ? 'border-color:#ef4444!important;background:rgba(239,68,68,0.10)!important;' : ''}">`;
              html += `<span style="width:16px;height:16px;border-radius:50%;border:2px solid var(--border);display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;"></span>`;
              html += `<span>${opt}</span>`;
              if (isAns && saved) html += `<span style="margin-left:auto;font-size:0.75rem;font-weight:700;color:#16a34a;">✅ Sahi</span>`;
              if (isSel && saved && !isAns) html += `<span style="margin-left:auto;font-size:0.75rem;font-weight:700;color:#ef4444;">❌ Galat</span>`;
              html += `</div>`;
            });
            if (!saved) {
              html += `<button class="quiz-submit" data-qi="${qi}" data-quiz="${bi}" style="background:var(--gradient);color:#fff;border:none;padding:8px 22px;border-radius:20px;font-weight:700;cursor:pointer;margin-top:6px;">Submit Answer</button>`;
            }
            html += `</div>`;
          });
          html += `</div>`;

          const idx = body.innerHTML.indexOf('[quiz]');
          if (idx > -1) {
            const endIdx = body.innerHTML.indexOf('[/quiz]', idx);
            if (endIdx > -1) {
              body.innerHTML = body.innerHTML.slice(0, idx) + html + body.innerHTML.slice(endIdx + 7);
            }
          }
        });
      } catch (e) { console.error('quiz build error:', e); }
    } catch (e) {
      console.error('PostProcessor error (safely ignored):', e);
    }
  }, [html]);

  return null;
}

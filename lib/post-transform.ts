// ============================================================
// POST TRANSFORM - SERVER-SIDE NORMALIZATION (CLS = ZERO)
// ============================================================
// Content ab SERVER pe hi normalize hota hai (paint se pehle):
//   - tables ke saare inline attrs (bgcolor/white-text) strip
//   - h4 -> h3 (a11y), img lazy, callouts, quiz blocks
// => Browser pe first paint se hi content sahi dikhta hai ->
//    koi layout shift nahi (pehle client transform post-paint
//    hota tha -> footer shift -> CLS 1.4!)
// Client (PostProcessor) ab SIRF quiz progress restore karta hai.

// Tags jinme style/color/background strip karna hai (tables ke andar)
const ATTR_BLOCK = new Set([
  'style', 'bgcolor', 'background', 'color', 'align', 'valign', 'nowrap',
  'width', 'height', 'border', 'cellpadding', 'cellspacing', 'face', 'size',
  'bordercolor', 'cellborder',
]);

function cleanAttrs(html: string): string {
  // har tag ke attributes parse karo, blocklisted hatao, baaki rakho
  return html.replace(/<(\/?)([a-zA-Z][a-zA-Z0-9]*)([^>]*)>/g, (m, close: string, name: string, rest: string) => {
    const trimmed = rest.trim();
    if (!trimmed || trimmed === '/') return m;
    const kept: string[] = [];
    const re = /([a-zA-Z-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g;
    let am: RegExpExecArray | null;
    while ((am = re.exec(rest)) !== null) {
      const key = am[1].toLowerCase();
      if (ATTR_BLOCK.has(key)) continue;
      const val = am[2] !== undefined ? am[2] : am[3] !== undefined ? am[3] : am[4];
      if (val !== undefined) kept.push(`${key}="${val.replace(/"/g, '&quot;')}"`);
      else kept.push(key);
    }
    return `<${close}${name}${kept.length ? ' ' + kept.join(' ') : ''}>`;
  });
}

function calloutHtml(kind: string, inner: string): string {
  const color = kind === 'tip' ? '#10b981' : kind === 'note' ? '#667eea' : kind === 'warning' ? '#f59e0b' : '#ef4444';
  const bg = kind === 'tip' ? 'rgba(16,185,129,0.10)' : kind === 'note' ? 'rgba(102,126,234,0.10)' : kind === 'warning' ? 'rgba(245,158,11,0.12)' : 'rgba(239,68,68,0.10)';
  const label = kind === 'tip' ? '💡 Tip' : kind === 'note' ? '📝 Note' : kind === 'warning' ? '⚠️ Warning' : '⛔ Important';
  return `<div class="callout callout-${kind}" style="border-radius:10px;padding:14px 18px;margin:18px 0;border-left:4px solid ${color};background:${bg}"><b>${label}</b><br/>${inner}</div>`;
}

function quizHtml(block: string, bi: number): string {
  const lines = block.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);
  const questions: { q: string; opts: string[]; ans: number }[] = [];
  lines.forEach((line) => {
    const parts = line.split('|');
    if (parts.length < 7) return;
    questions.push({ q: parts[1].trim(), opts: [parts[2].trim(), parts[3].trim(), parts[4].trim(), parts[5].trim()], ans: parseInt(parts[6].trim(), 10) });
  });
  if (!questions.length) return '';

  let html = `<div class="quiz-block" data-quiz="${bi}" style="background:var(--card-bg);border:1px solid var(--border);border-radius:14px;padding:20px 22px;margin:24px 0;box-shadow:var(--shadow);">`;
  html += `<div class="quiz-head" style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;"><span style="font-size:1.05rem;font-weight:800;">📝 Quick Quiz</span><span class="quiz-progress" style="font-size:0.75rem;font-weight:700;color:var(--text-light);">0/${questions.length} answered</span></div>`;
  questions.forEach((q, qi) => {
    html += `<div style="margin-bottom:14px;padding:14px 16px;border:1px solid var(--border);border-radius:12px;background:var(--bg);">`;
    html += `<div style="font-weight:700;font-size:0.93rem;margin-bottom:10px;">${qi + 1}. ${q.q}</div>`;
    q.opts.forEach((opt, oi) => {
      html += `<div class="quiz-opt" data-qi="${qi}" data-oi="${oi + 1}" data-quiz="${bi}" data-ans="${oi + 1 === q.ans ? '1' : '0'}" style="display:flex;align-items:center;gap:10px;padding:8px 12px;margin:5px 0;border:1px solid var(--border);border-radius:10px;cursor:pointer;font-size:0.88rem;">`;
      html += `<span style="width:16px;height:16px;border-radius:50%;border:2px solid var(--border);display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;"></span>`;
      html += `<span>${opt}</span>`;
      html += `</div>`;
    });
    html += `<button class="quiz-submit" data-qi="${qi}" data-quiz="${bi}" style="background:var(--gradient);color:#fff;border:none;padding:8px 22px;border-radius:20px;font-weight:700;cursor:pointer;margin-top:6px;">Submit Answer</button>`;
    html += `</div>`;
  });
  html += `</div>`;
  return html;
}

// SERVER-SIDE NORMALIZATION - article page ise use karta hai
export function normalizeContentServer(html: string): string {
  let out = html || '';
  try {
    // 1) TABLES: saare inline attrs strip (scoped - table blocks)
    out = out.replace(/<table[\s\S]*?<\/table>/gi, (block) => {
      let b = block;
      // font -> span
      b = b.replace(/<font[^>]*>/gi, '<span>').replace(/<\/font>/gi, '</span>');
      // saare tags ke style/bgcolor/color/width waghera hatao
      b = cleanAttrs(b);
      return b;
    });

    // 2) h4 -> h3 (a11y, size CSS se match)
    out = out.replace(/<h4([^>]*)>/gi, '<h3$1 class="content-h3">');
    out = out.replace(/<\/h4>/gi, '</h3>');

    // 3) IMAGES: lazy (agar pehle se nahi hai)
    out = out.replace(/<img(?![^>]*\bloading\s*=)[^>]*>/gi, (m) => m.replace(/^<img\s/, '<img loading="lazy" decoding="async" '));

    // 4) CALLOUTS
    ['tip', 'note', 'warning', 'danger'].forEach((kind) => {
      const re = new RegExp(`\\[${kind}\\]([\\s\\S]*?)\\[\\/${kind}\\]`, 'g');
      out = out.replace(re, (_m, inner: string) => calloutHtml(kind, inner));
    });

    // 5) QUIZ BLOCKS (progress client pe restore hota hai)
    const quizRe = /\[quiz\]([\s\S]*?)\[\/quiz\]/g;
    let bi = 0;
    out = out.replace(quizRe, (_m, block: string) => {
      const h = quizHtml(block, bi);
      bi += 1;
      return h || '';
    });
  } catch (e) {
    console.error('normalizeContentServer error (safely ignored):', e);
  }
  return out;
}

// ------------------------------------------------------------
// CLIENT FALLBACK (PostProcessor) - idempotent, quiz progress restore
// ------------------------------------------------------------

// Quiz progress restore - server content pe saved answers dikhao
export function restoreQuizProgress() {
  try {
    document.querySelectorAll('.quiz-block').forEach((block, bi) => {
      const key = 'di_quiz_' + window.location.pathname + '_' + bi;
      let prog: Record<string, number> = {};
      try { prog = JSON.parse(localStorage.getItem(key) || '{}'); } catch {}
      const answered = Object.keys(prog).length;
      const progressEl = block.querySelector('.quiz-progress') as HTMLElement | null;
      // count questions = unique data-qi
      const qis = new Set<string>();
      block.querySelectorAll('.quiz-opt').forEach((o) => qis.add(o.getAttribute('data-qi') || ''));
      if (progressEl) progressEl.textContent = `${answered}/${qis.size} answered`;
      qis.forEach((qi) => {
        const saved = prog['q' + qi];
        if (!saved) return;
        block.querySelectorAll(`.quiz-opt[data-qi="${qi}"]`).forEach((o) => {
          const el = o as HTMLElement;
          const oi = Number(el.getAttribute('data-oi'));
          const isAns = el.getAttribute('data-ans') === '1';
          el.style.cursor = 'default';
          if (isAns) { el.style.borderColor = '#16a34a'; el.style.background = 'rgba(22,163,74,0.12)'; }
          else if (oi === saved) { el.style.borderColor = '#ef4444'; el.style.background = 'rgba(239,68,68,0.10)'; }
        });
        const btn = block.querySelector(`.quiz-submit[data-qi="${qi}"]`) as HTMLButtonElement | null;
        if (btn && saved) { btn.disabled = true; btn.textContent = '✅ Answered'; }
      });
    });
  } catch (e) { console.error('quiz restore error (safely ignored):', e); }
}

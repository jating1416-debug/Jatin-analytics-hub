'use client';

import { useEffect } from 'react';

// CODE SYNTAX HIGHLIGHTING v3 - BULLETPROOF (white-text fix!)
// - INLINE style="color:..." har span pe -> CSS version mismatch ho to bhi
//   colors HAMESHA dikhenge (yehi "sab white" ka asli fix hai)
// - Retry logic (rAF + 500ms + 1500ms) - content late load ho to bhi highlight
// - Copy button + dark/light theme toggle har code block pe
// - MutationObserver -> client-side navigation pe bhi apply

const SQL_KW = 'SELECT|FROM|WHERE|GROUP|BY|ORDER|HAVING|JOIN|INNER|LEFT|RIGHT|FULL|OUTER|CROSS|ON|AND|OR|NOT|NULL|IS|AS|DISTINCT|LIMIT|OFFSET|INSERT|INTO|VALUES|UPDATE|SET|DELETE|CREATE|TABLE|ALTER|DROP|INDEX|IF|EXISTS|PRIMARY|KEY|FOREIGN|REFERENCES|CONSTRAINT|DEFAULT|CHECK|UNIQUE|CASE|WHEN|THEN|ELSE|END|LIKE|IN|BETWEEN|UNION|ALL|ASC|DESC|WITH|RECURSIVE|RANK|DENSE_RANK|ROW_NUMBER|OVER|PARTITION|LAG|LEAD|FIRST_VALUE|LAST_VALUE|NTILE|EXPLAIN|ANALYZE|COLLATE|CAST|USING|NATURAL|COUNT|SUM|AVG|MIN|MAX|ROUND|COALESCE|NULLIF|CONCAT|SUBSTR|LENGTH|UPPER|LOWER|TRIM|REPLACE|YEAR|MONTH|DAY|NOW|CURRENT_DATE|CURRENT_TIMESTAMP|strftime';

const PY_KW = 'def|class|import|from|return|if|elif|else|for|while|break|continue|pass|with|as|try|except|finally|raise|lambda|yield|global|nonlocal|None|True|False|and|or|not|in|is|del|assert|async|await|self';

const PY_FN = 'print|len|range|str|int|float|bool|list|dict|set|tuple|sum|min|max|sorted|enumerate|zip|map|filter|type|input|open|abs|round|format|join|split|append|extend|keys|values|items|get|pop|update|replace|strip|lower|upper|unique|groupby|merge|concat|pivot|head|tail|shape|columns|describe|isnull|dropna|fillna|to_csv|read_csv|read_excel|value_counts|apply|iloc|loc|dtypes|astype|rename|sort_values|drop_duplicates|pd|np';

// INLINE COLOR MAP (VS Code Dark+ palette) - CSS classes pe depend NAHI
const COLORS: Record<string, string> = {
  'tok-kw': '#c792ea',   // purple - keywords
  'tok-fn': '#82aaff',   // blue - functions
  'tok-str': '#a5d6a7',  // green - strings
  'tok-num': '#f78c6c',  // orange - numbers
  'tok-com': '#7a8aa5',  // gray - comments
  'tok-dec': '#f5d67b',  // yellow - decorators
};

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function highlightCode(code: string, lang: 'sql' | 'python' | 'generic'): string {
  let re: RegExp;
  if (lang === 'sql') {
    re = new RegExp(`(--[^\\n]*|\\/\\*[\\s\\S]*?\\*\\/|'[^'\\n]*'|"[^"\\n]*"|\\b\\d+(?:\\.\\d+)?\\b|\\b(?:${SQL_KW})\\b|\\b[A-Za-z_][A-Za-z0-9_]*(?=\\())`, 'gi');
  } else if (lang === 'python') {
    re = new RegExp(`(#[^\\n]*|'''[\\s\\S]*?'''|"""[\\s\\S]*?"""|'[^'\\n]*'|"[^"\\n]*"|\\b\\d+(?:\\.\\d+)?\\b|@\\w+|\\b(?:${PY_KW})\\b|\\b(?:${PY_FN})\\b)`, 'gi');
  } else {
    re = new RegExp(`(#[^\\n]*|\\/\\/[^\\n]*|\\/\\*[\\s\\S]*?\\*\\/|'[^'\\n]*'|"[^"\\n]*"|\\b\\d+(?:\\.\\d+)?\\b)`, 'gi');
  }

  let out = '';
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(code)) !== null) {
    out += esc(code.slice(last, m.index));
    const tok = m[0];
    let cls = 'tok-fn';
    if (tok.startsWith('#') || tok.startsWith('--') || tok.startsWith('/*') || tok.startsWith('//') || tok.startsWith("'''") || tok.startsWith('"""')) cls = 'tok-com';
    else if (tok.startsWith("'") || tok.startsWith('"')) cls = 'tok-str';
    else if (/^\d/.test(tok)) cls = 'tok-num';
    else if (tok.startsWith('@')) cls = 'tok-dec';
    else if (lang === 'python' && new RegExp(`^(${PY_KW})$`).test(tok)) cls = 'tok-kw';
    else if (lang === 'sql' && new RegExp(`^(${SQL_KW})$`, 'i').test(tok)) cls = 'tok-kw';
    else if (lang === 'python' && new RegExp(`^(${PY_FN})$`).test(tok)) cls = 'tok-fn';
    // INLINE COLOR - CSS version mismatch ho to bhi ye hi jeetega
    const color = COLORS[cls] || '#82aaff';
    out += `<span class="${cls}" style="color:${color};${cls === 'tok-kw' ? 'font-weight:600;' : ''}${cls === 'tok-com' ? 'font-style:italic;' : ''}">${esc(tok)}</span>`;
    last = m.index + tok.length;
  }
  out += esc(code.slice(last));
  return out;
}

function detectLang(text: string): 'sql' | 'python' | 'generic' {
  const sqlScore = (text.match(/\b(SELECT|FROM|WHERE|JOIN|GROUP BY|CREATE TABLE|INSERT INTO|UPDATE|DELETE FROM)\b/gi) || []).length;
  const pyScore = (text.match(/\b(def |import |from |print\(|class |lambda|pd\.|np\.|\.groupby\(|\.merge\(|read_csv)/g) || []).length;
  if (sqlScore > pyScore) return 'sql';
  if (pyScore > 0) return 'python';
  return 'generic';
}

export default function CodeHighlighter() {
  useEffect(() => {
    let highlightTimer: ReturnType<typeof setTimeout> | null = null;

    const apply = () => {
      const body = document.querySelector('.post-body.entry-content');
      if (!body) return;

      body.querySelectorAll('pre').forEach((pre) => {
        // COPY + THEME TOGGLE buttons (ek baar hi)
        if (!pre.getAttribute('data-copy-done')) {
          pre.setAttribute('data-copy-done', '1');
          pre.style.position = 'relative';

          const themeBtn = document.createElement('button');
          themeBtn.textContent = '🌙';
          themeBtn.title = 'Code theme (dark/light)';
          themeBtn.style.cssText = 'position:absolute;top:8px;right:52px;background:rgba(255,255,255,0.12);color:#e2e8f0;border:1px solid rgba(255,255,255,0.2);padding:4px 9px;border-radius:6px;font-size:0.72rem;cursor:pointer;z-index:5;';
          themeBtn.onclick = () => {
            pre.classList.toggle('code-light');
            themeBtn.textContent = pre.classList.contains('code-light') ? '☀️' : '🌙';
          };
          pre.appendChild(themeBtn);

          const btn = document.createElement('button');
          btn.innerHTML = '<i class="fas fa-copy"></i> Copy';
          btn.style.cssText = 'position:absolute;top:8px;right:8px;background:rgba(255,255,255,0.12);color:#e2e8f0;border:1px solid rgba(255,255,255,0.2);padding:4px 10px;border-radius:6px;font-size:0.72rem;cursor:pointer;z-index:5;font-family:inherit;';
          btn.onclick = () => {
            const code = pre.querySelector('code') || pre;
            const text = (code.textContent || '').replace(/\s+$/g, '');
            if (navigator.clipboard && navigator.clipboard.writeText) {
              navigator.clipboard.writeText(text).then(() => {
                btn.innerHTML = '<i class="fas fa-check"></i> Copied!';
                setTimeout(() => { btn.innerHTML = '<i class="fas fa-copy"></i> Copy'; }, 1500);
              }).catch(() => fallbackCopy(text, btn));
            } else fallbackCopy(text, btn);
          };
          pre.appendChild(btn);
        }

        // HIGHLIGHT - inline colors (bulletproof)
        const codeEl = pre.querySelector('code') || pre;
        const raw = codeEl.textContent || '';
        if (!raw.trim()) return;
        // FIX: agar data-raw set hai BUT spans wipe ho gaye (PostProcessor ne
        // innerHTML replace kiya tha) -> dobara highlight karo
        const hasRaw = codeEl.getAttribute('data-raw');
        const hasSpans = codeEl.innerHTML.includes('<span');
        if (hasRaw === raw && hasSpans) return; // already highlighted, sab sahi
        codeEl.setAttribute('data-raw', raw);
        const lang = detectLang(raw);
        codeEl.innerHTML = highlightCode(raw, lang) || esc(raw);
      });
    };

    const fallbackCopy = (text: string, btn: HTMLElement) => {
      try {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        btn.innerHTML = '<i class="fas fa-check"></i> Copied!';
        setTimeout(() => { btn.innerHTML = '<i class="fas fa-copy"></i> Copy'; }, 1500);
      } catch {
        window.prompt('Copy karo:', text);
      }
    };

    // 1) turant
    apply();
    // 2) content late load ho to retry (500ms + 1500ms)
    setTimeout(apply, 500);
    setTimeout(apply, 1500);
    // 3) window load pe
    window.addEventListener('load', apply);
    // 4) client-side navigation pe (naya DOM)
    const mo = typeof MutationObserver !== 'undefined'
      ? new MutationObserver(() => {
          apply();
          if (highlightTimer) clearTimeout(highlightTimer);
          highlightTimer = setTimeout(apply, 300);
        })
      : null;
    if (mo) mo.observe(document.body, { childList: true, subtree: true });
    return () => {
      if (mo) mo.disconnect();
      window.removeEventListener('load', apply);
      if (highlightTimer) clearTimeout(highlightTimer);
    };
  }, []);

  return null;
}

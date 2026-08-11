'use client';

import { useEffect } from 'react';

// CODE SYNTAX HIGHLIGHTING v4 - VS CODE DARK+ EXACT PALETTE
// Keywords blue, Functions yellow, Strings orange, Numbers green,
// Comments green-italic, Identifiers light-blue (VS Code jaisa!)
// - INLINE style="color:..." -> CSS version mismatch ho to bhi colors dikhenge
// - Wipe detection -> PostProcessor se colors gayab ho to dobara highlight
// - Copy button + dark/light theme toggle
// - Retry + MutationObserver

// VS Code Dark+ palette
const C = {
  kw: '#569CD6',   // blue - keywords (SELECT, FROM, WHERE)
  fn: '#DCDCAA',   // yellow - functions (SUM, COUNT, ROW_NUMBER)
  str: '#CE9178',  // orange - strings
  num: '#B5CEA8',  // green - numbers
  com: '#6A9955',  // green italic - comments
  idn: '#9CDCFE',  // light blue - identifiers (column names)
};

const SQL_KW = 'SELECT|FROM|WHERE|GROUP|BY|ORDER|HAVING|JOIN|INNER|LEFT|RIGHT|FULL|OUTER|CROSS|ON|AND|OR|NOT|NULL|IS|AS|DISTINCT|LIMIT|OFFSET|INSERT|INTO|VALUES|UPDATE|SET|DELETE|CREATE|TABLE|ALTER|DROP|INDEX|IF|EXISTS|PRIMARY|KEY|FOREIGN|REFERENCES|CONSTRAINT|DEFAULT|CHECK|UNIQUE|CASE|WHEN|THEN|ELSE|END|LIKE|IN|BETWEEN|UNION|ALL|ASC|DESC|WITH|RECURSIVE|OVER|PARTITION|EXPLAIN|ANALYZE|COLLATE|CAST|USING|NATURAL';

const SQL_FN = 'COUNT|SUM|AVG|MIN|MAX|ROUND|COALESCE|NULLIF|CONCAT|SUBSTR|LENGTH|UPPER|LOWER|TRIM|REPLACE|YEAR|MONTH|DAY|NOW|CURRENT_DATE|CURRENT_TIMESTAMP|strftime|RANK|DENSE_RANK|ROW_NUMBER|LAG|LEAD|FIRST_VALUE|LAST_VALUE|NTILE|ROW_NUMBER|ABS|CEIL|FLOOR|MOD|POWER|SQRT|DATE|CURRENT_TIME';

const PY_KW = 'def|class|import|from|return|if|elif|else|for|while|break|continue|pass|with|as|try|except|finally|raise|lambda|yield|global|nonlocal|None|True|False|and|or|not|in|is|del|assert|async|await|self';

const PY_FN = 'print|len|range|str|int|float|bool|list|dict|set|tuple|sum|min|max|sorted|enumerate|zip|map|filter|type|input|open|abs|round|format|join|split|append|extend|keys|values|items|get|pop|update|replace|strip|lower|upper|unique|groupby|merge|concat|pivot|head|tail|shape|columns|describe|isnull|dropna|fillna|to_csv|read_csv|read_excel|value_counts|apply|iloc|loc|dtypes|astype|rename|sort_values|drop_duplicates|pd|np';

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function span(cls: string, text: string): string {
  const color = (C as any)[cls.replace('tok-', '')] || '#d4d4d4';
  const extra = cls === 'tok-kw' ? 'font-weight:600;' : cls === 'tok-com' ? 'font-style:italic;' : '';
  // !important -> koi bhi CSS inhe kabhi override nahi kar sakta (VS Code look pakka)
  return `<span class="${cls}" style="color:${color} !important;${extra}">${esc(text)}</span>`;
}

export function highlightSql(sql: string): string {
  // SQL SPLIT FIX (Blogger feed newline kha jata hai):
  // "-- comment SELECT ..." EK HI LINE mein aa jata hai -> tokenizer
  // poori line comment samajhta hai -> poora query EK hi color!
  // Fix: agar "--" ke baad UPPERCASE SQL keyword (SELECT/INSERT/UPDATE/
  // CREATE/DROP/WITH/EXPLAIN/CALL/DECLARE/TRUNCATE/MERGE) aaye to wahan
  // newline daal do -> comment + query alag -> colors sahi bante hain.
  sql = sql.replace(/--[^\n]*?(?=\s+(?:SELECT|INSERT|UPDATE|CREATE|DROP|WITH|EXPLAIN|CALL|DECLARE|TRUNCATE|MERGE)\b)/g, (m) => m + '\n');
  // multi-pass tokenizer (VS Code jaisa)
  const tokens: { text: string; cls: string }[] = [];
  let i = 0;
  const n = sql.length;

  while (i < n) {
    const rest = sql.slice(i);
    // comment
    let m = rest.match(/^--[^\n]*/);
    if (m) { tokens.push({ text: m[0], cls: 'tok-com' }); i += m[0].length; continue; }
    m = rest.match(/^\/\*[\s\S]*?\*\//);
    if (m) { tokens.push({ text: m[0], cls: 'tok-com' }); i += m[0].length; continue; }
    // string
    m = rest.match(/^'[^'\n]*'/);
    if (m) { tokens.push({ text: m[0], cls: 'tok-str' }); i += m[0].length; continue; }
    m = rest.match(/^"[^"\n]*"/);
    if (m) { tokens.push({ text: m[0], cls: 'tok-str' }); i += m[0].length; continue; }
    // number
    m = rest.match(/^\d+(?:\.\d+)?/);
    if (m) { tokens.push({ text: m[0], cls: 'tok-num' }); i += m[0].length; continue; }
    // identifier / keyword / function
    m = rest.match(/^[A-Za-z_][A-Za-z0-9_]*/);
    if (m) {
      const word = m[0];
      const lower = word.toLowerCase();
      const isFn = new RegExp(`^(?:${SQL_FN})$`, 'i').test(word);
      const isKw = new RegExp(`^(?:${SQL_KW})$`, 'i').test(word);
      // function call: word immediately followed by '(' (skip spaces)
      let j = i + word.length;
      while (j < n && /\s/.test(sql[j])) j++;
      const followedByParen = sql[j] === '(';
      if (isFn && followedByParen) tokens.push({ text: word, cls: 'tok-fn' });
      else if (isKw) tokens.push({ text: word, cls: 'tok-kw' });
      else if (followedByParen) tokens.push({ text: word, cls: 'tok-fn' });
      else tokens.push({ text: word, cls: 'tok-idn' }); // identifier - light blue
      i += word.length;
      continue;
    }
    // whitespace / punctuation
    tokens.push({ text: sql[i], cls: 'tok-plain' });
    i += 1;
  }

  return tokens.map((t) => (t.cls === 'tok-plain' ? esc(t.text) : span(t.cls, t.text))).join('');
}

function highlightPython(code: string): string {
  const re = new RegExp(
    `(#[^\\n]*|'''[\\s\\S]*?'''|"""[\\s\\S]*?"""|'[^'\\n]*'|"[^"\\n]*"|\\b\\d+(?:\\.\\d+)?\\b|@\\w+|\\b(?:${PY_KW})\\b|\\b(?:${PY_FN})\\b)`,
    'gi'
  );
  let out = '';
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(code)) !== null) {
    out += esc(code.slice(last, m.index));
    const tok = m[0];
    let cls = 'tok-idn';
    if (tok.startsWith('#') || tok.startsWith("'''") || tok.startsWith('"""')) cls = 'tok-com';
    else if (tok.startsWith("'") || tok.startsWith('"')) cls = 'tok-str';
    else if (/^\d/.test(tok)) cls = 'tok-num';
    else if (tok.startsWith('@')) cls = 'tok-dec';
    else if (new RegExp(`^(${PY_KW})$`).test(tok)) cls = 'tok-kw';
    else if (new RegExp(`^(${PY_FN})$`).test(tok)) cls = 'tok-fn';
    out += span(cls, tok);
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
    // DOUBLE-MOUNT GUARD: article page + LazyWidgets dono import karein to
    // sirf EK instance chale (dusra turant exit - koi duplicate work nahi)
    if ((window as any).__diCodeHighlighter) return;
    (window as any).__diCodeHighlighter = true;

    let highlightTimer: ReturnType<typeof setTimeout> | null = null;

    const apply = () => {
      // SAFETY: koi bhi error page ko crash na kare (React 19: effect error = white screen)
      try {
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
            const done = () => {
              btn.innerHTML = '<i class="fas fa-check"></i> Copied!';
              setTimeout(() => { btn.innerHTML = '<i class="fas fa-copy"></i> Copy'; }, 1500);
            };
            if (navigator.clipboard && navigator.clipboard.writeText) {
              navigator.clipboard.writeText(text).then(done).catch(() => fallbackCopy(text, done));
            } else fallbackCopy(text, done);
          };
          pre.appendChild(btn);
        }

        // HIGHLIGHT - BULLETPROOF GUARD (infinite loop fix!)
        // Pehle wala guard `hasSpans` check karta tha -> generic blocks
        // (table outputs jaise +----+------+) mein kabhi <span> nahi banta
        // -> guard hamesha fail -> innerHTML dobara set -> MutationObserver
        // fire -> FIR SE highlight -> INFINITE LOOP -> page freeze!
        // Ab SIRF text compare hota hai: text badla nahi = kuch mat karo
        // (koi DOM write nahi = koi mutation nahi = loop impossible)
        const codeEl = pre.querySelector('code') || pre;
        const raw = codeEl.textContent || '';
        if (!raw.trim()) return;
        if (codeEl.getAttribute('data-raw') === raw) return;
        codeEl.setAttribute('data-raw', raw);
        const lang = detectLang(raw);
        const html = lang === 'sql' ? highlightSql(raw) : lang === 'python' ? highlightPython(raw) : esc(raw);
        codeEl.innerHTML = html || esc(raw);
      });
      } catch (err) {
        console.error('highlight error (safely ignored):', err);
      }
    };

    const fallbackCopy = (text: string, done: () => void) => {
      try {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        done();
      } catch {
        window.prompt('Copy karo:', text);
      }
    };

    apply();
    setTimeout(apply, 500);
    setTimeout(apply, 1500);
    window.addEventListener('load', apply);
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
      // next page pe phir se chal sake
      delete (window as any).__diCodeHighlighter;
    };
  }, []);

  return null;
}

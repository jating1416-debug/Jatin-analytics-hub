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

// ============================================================
// PIPE TABLE -> REAL HTML TABLE (server-side)
// Blogger feed mein result tables "│" pipe format mein aati hain
// aur newlines kha gayi thin -> EK LINE mein 2000-3000px tak
// phail jaati thin (kuch padh nahi sakta). Ye unhe proper
// HTML table mein convert karta hai - W3Schools/MDN jaisa.
// ============================================================
function escHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// Fused cells split (newlines kha gaye the -> do rows ek cell mein)
// Rules:
//  1) "55000 73000"      -> dono numbers
//  2) "2026-01-05 2"     -> trailing number = agli row ka id (m1 mein digit/← ho)
//  3) "5500 Chair"       -> leading number = is row ka amount (m2 ← se shuru na ho)
//  4) "1 ← Top ... X"    -> note + agli row ka pehla column (X note word na ho)
const NOTE_WORDS = new Set(['Highest','Lowest','Tie','Same','Top','rank','row_num!','Left','Right','tie','same','top','highest','lowest','left','right','first','last','next','prev','Restarts','restarts','rank_in_category']);
function splitFusedCell(cell: string): string[] {
  const t = cell.trim();
  if (!t.includes(' ')) return [t];
  // 0) ALTERNATING num/text pairs: "1 MUMBAI 1 delhi" -> [1,MUMBAI,1,delhi]
  //    (newlines kha gaye -> multiple rows ek cell mein fuse)
  {
    const toks = t.split(/\s+/);
    if (toks.length >= 3 && /^\d/.test(toks[0])) {
      const pairs: string[] = [];
      let i = 0;
      let ok = true;
      while (i < toks.length) {
        if (!/^\d/.test(toks[i])) { ok = false; break; }
        let j = i + 1;
        while (j < toks.length && !/^\d/.test(toks[j])) j++;
        pairs.push(toks[i], toks.slice(i + 1, j).join(' '));
        i = j;
      }
      if (ok && pairs.length >= 4) return pairs;
    }
  }
  // 1) dono numbers
  let m = t.match(/^(\d+(?:[.,]\d+)?)\s+(\d+(?:[.,]\d+)?)$/);
  if (m) return [m[1], m[2]];
  // 2) trailing number (agli row ka id)
  m = t.match(/^(.+?)\s+(\d{1,4})$/);
  if (m && (/←/.test(m[1]) || /\d/.test(m[1]))) return [m[1], m[2]];
  // 3) leading number (is row ka amount + agli row ka text)
  m = t.match(/^(\d+)\s+(.+)$/);
  if (m && !m[2].startsWith('←')) return [m[1], m[2]];
  // 4) note + agli row ka pehla column (jaise "1 ← Top in Accessories Accessories" -
  //    note wahi word pe khatam hota hai jo agli row shuru karta hai)
  m = t.match(/^(.+?)\s+(\S+)$/);
  if (m && m[1].includes('←') && !NOTE_WORDS.has(m[2]) && m[1].endsWith(m[2])) return [m[1], m[2]];
  return [t];
}

// header cells expand karo (fused "total product_name" ko split karke)
function expandHeaderCells(cells: string[], need: number): string[] {
  const c = cells.slice();
  let guard = 0;
  while (c.length < need && guard++ < 20) {
    let done = false;
    for (let i = 0; i < c.length; i++) {
      if (c[i].includes(' ')) {
        const sp = c[i].lastIndexOf(' ');
        const before = c[i].slice(0, sp);
        const after = c[i].slice(sp + 1);
        if (!before || !after) continue;
        c.splice(i, 1, before, after);
        done = true;
        break;
      }
    }
    if (!done) break;
  }
  return c;
}

interface PipeTableInfo {
  label: string;
  note: string;
  headers: string[];
  rows: string[][];
}

function parsePipeTable(text: string): { label: string; note: string; tables: PipeTableInfo[] } | null {
  // ASCII '|' separators ko bhi handle karo (sirf table blocks mein -
  // jab ─ separator line ho to hi convert, SQL bitwise | nahi tootega)
  let text2 = text;
  if (!text.includes('│') && /─/.test(text) && text.includes(' | ')) {
    text2 = text.replace(/ \| /g, ' │ ');
  }
  text = text2;
  if (!text.includes('│')) return null;
  // BOX-DRAWING DIAGRAMS (┌─┐├┤└┘ Excel/flowchart mockups) -> convert NAHI
  // (inme ┼ bhi hota hai par ye data table nahi hain - monospace hi sahi)
  if (/[┌┐└┘├┤]/.test(text)) return null;
  // ASLI table tabhi hai jab ┼ junction ho (separator line)
  if (!text.includes('┼')) return null;

  // ---- 1) lines banane ka try ----
  let s = text;
  const rawLines = s.split('\n').map(l => l.trim()).filter(Boolean);
  // agar 3+ lines hain aur unme │ hai -> LINE-BASED parse (sahi newlines hain)
  const sepChar = s.includes('│') ? '│' : '|';
  const sepLineIdx = rawLines.findIndex(l => /^[─┼+|\-]+$/.test(l));
  const headerIdx0 = rawLines.findIndex(l => l.includes(sepChar));
  if (rawLines.length >= 3 && headerIdx0 !== -1 && sepLineIdx !== -1) {
    const lines = rawLines;
    let nCols = lines[sepLineIdx].split(/[┼|]/).length;
    if (nCols < 2) nCols = lines[headerIdx0].split(sepChar).length;
    const headerLine = lines[headerIdx0];
    // label split
    let label = '';
    let headerText = headerLine;
    const lm = headerText.match(/^(.*?\)?:\s*)([^:]*?)$/);
    if (lm && lm[2].includes(sepChar)) { label = lm[1].replace(/:\s*$/, ':'); headerText = lm[2]; }
    else {
      const pre = lines.slice(0, headerIdx0).filter(l => !/^[─┼+|\-]+$/.test(l));
      label = pre.join(' ').replace(/:\s*$/, ':');
    }
    const headerCells = headerText.split(sepChar).map(x => x.trim()).filter(Boolean);
    const headers = expandHeaderCells(headerCells, nCols).slice(0, nCols);
    if (headers.length < 2) return null;
    const rows: string[][] = [];
    let note = '';
    for (let i = headerIdx0 + 1; i < lines.length; i++) {
      const l = lines[i];
      if (/^[─┼+|\-]+$/.test(l)) continue;
      if (!l.includes(sepChar)) { note = (note ? note + ' ' : '') + l; continue; }
      const cells: string[] = [];
      l.split(sepChar).map(x => x.trim()).filter(Boolean).forEach(c => cells.push(...splitFusedCell(c)));
      let j = 0;
      while (j + nCols <= cells.length) { rows.push(cells.slice(j, j + nCols)); j += nCols; }
      if (j < cells.length) note = (note ? note + ' ' : '') + cells.slice(j).join(' ');
    }
    return { label, note, tables: [{ label: '', note: '', headers, rows }] };
  }
  // ---- fallback: newlines reconstruct (pehle wala) ----
  s = s.replace(/(\S)\s+(?=─{2,})/g, '$1\n');   // separator se pehle
  s = s.replace(/(─{2,}(?:┼─{2,})+)\s+/g, '$1\n'); // separator ke baad
  const lines = s.split('\n').map(l => l.trim()).filter(Boolean);

  // ---- 2) har separator ka column count ----
  const sepCounts: number[] = [];
  lines.forEach(l => {
    if (/^[─┼]+$/.test(l) && l.includes('┼')) {
      sepCounts.push(l.split('┼').length);
    }
  });
  if (sepCounts.length === 0) return null;
  const nCols = sepCounts[0]; // pehla separator = pehli table

  // ---- 3) header + label ----
  const headerLine = lines.find(l => l.includes('│')) || '';
  let label = '';
  let headerText = headerLine;
  // label split: aakhri "):" ya ":" ke baad header hai
  const lm = headerText.match(/^(.*?\)?:\s*)([^:]*?)$/);
  if (lm && lm[2].includes('│')) {
    label = lm[1].replace(/:\s*$/, ':').trim();
    headerText = lm[2];
  } else {
    // labels alag line mein ho sakte hain (header se pehle)
    const pre = lines.slice(0, lines.indexOf(headerLine));
    label = pre.filter(l => !/^[─┼]+$/.test(l)).join(' ');
    if (label) label = label.replace(/:\s*$/, ':');
  }

  // headers split (fused "total product_name" ko split karo)
  const headerCells = headerText.split('│').map(x => x.trim()).filter(Boolean);
  let headers: string[] = [];
  if (headerCells.length > 0) {
    headers = expandHeaderCells(headerCells, nCols).slice(0, nCols);
  }
  if (headers.length < 2) return null;

  // ---- 4) data cells ----
  const dataPart = lines.slice(lines.indexOf(headerLine) + 1)
    .filter(l => !/^[─┼]+$/.test(l));
  let dataText = dataPart.join(' ');
  // trailing notes alag karo (jaise "Each category restarts from 1!")
  let note = '';
  const noteMatch = dataText.match(/\s+(Each category[^]*?|Top \d+ per category[^]*?|GROUP BY: summary[^]*?|Window: details[^]*?|Note:[^]*?|Note [^]*?)$/i);
  if (noteMatch) {
    note = noteMatch[1].trim();
    dataText = dataText.slice(0, noteMatch.index).trim();
  }
  // fused cells ko split karo
  const rawCells = dataText.split('│').map(x => x.trim()).filter(Boolean);
  const cells: string[] = [];
  rawCells.forEach(c => { cells.push(...splitFusedCell(c)); });

  // ---- 5) multi-table (mashup) ya single ----
  if (sepCounts.length > 1) {
    // multiple tables: headers bhi multiple hain - split headerCells by counts
    const tables: PipeTableInfo[] = [];
    let hIdx = 0;
    let note = '';
    sepCounts.forEach((nc, ti) => {
      // saare header cells ko expand karke har table ke columns do
      const totalNeed = sepCounts.reduce((a, b) => a + b, 0);
      const expanded = expandHeaderCells(headerCells, totalNeed);
      const th = expanded.slice(hIdx, hIdx + nc);
      hIdx += nc;
      tables.push({ label: '', note: '', headers: th, rows: [] });
    });
    // data rows: har position pe SAARI tables try karo (order se)
    {
      const defs = tables.map((t) => t.headers.length);
      let i = 0;
      while (i < cells.length) {
        let matched = false;
        for (let t = 0; t < tables.length; t++) {
          const nc = defs[t];
          if (i + nc > cells.length) continue;
          const chunk = cells.slice(i, i + nc);
          const lastOk = /^[\d₹$€.,+\-]/.test(chunk[nc - 1]) || chunk[nc - 1].includes('←');
          if (lastOk) {
            tables[t].rows.push(chunk);
            i += nc;
            matched = true;
            break;
          }
        }
        if (!matched) i++;
      }
    }
    // note = extracted note + bacha hua data
    const used = tables.reduce((a, t) => a + t.rows.length * t.headers.length, 0);
    const rest = cells.slice(used).join(' ').replace(/^\s*(GROUP BY|Window|Each|Top|Note|TIP|Tip)[:.]?\s*/i, '');
    if (rest) note = ((note ? note + ' ' : '') + rest).trim();
    return { label, note, tables };
  }

  // ---- 6) SINGLE TABLE: rows chunk by nCols with carry ----
  const rows: string[][] = [];
  let carry = '';
  let i = 0;
  while (i < cells.length) {
    const chunk: string[] = [];
    if (carry) { chunk.push(carry); carry = ''; }
    const need = nCols - chunk.length;
    chunk.push(...cells.slice(i, i + need));
    i += need;
    if (chunk.length < nCols) break;
    // fused last cell: "2026-01-05 2" -> last + carry
    const m = chunk[nCols - 1].match(/^(.+?)\s+(\d{1,4})$/);
    if (m && !/^\d/.test(m[1])) {
      chunk[nCols - 1] = m[1];
      carry = m[2];
    }
    rows.push(chunk);
  }
  // leftover cells bhi note mein (jo rows nahi bane)
  const used = rows.length * nCols;
  const leftover = cells.slice(used).join(' ').replace(/^\s*(GROUP BY|Window|Each|Top|Note|TIP|Tip)[:.]?\s*/i, '');
  if (carry) note = ((note ? note + ' ' : '') + carry + ' ' + leftover).trim();
  else if (leftover) note = ((note ? note + ' ' : '') + leftover).trim();

  return { label, note, tables: [{ label: '', note: '', headers, rows }] };
}

// pre blocks mein pipe tables ko HTML table se replace karo
export function pipeTablesToHtml(content: string): string {
  return content.replace(/<pre[^>]*>([\s\S]*?)<\/pre>/gi, (whole, inner: string) => {
    const text = inner
      .replace(/<[^>]+>/g, '')
      .replace(/&lt;/g, '<').replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"').replace(/&#39;/g, "'")
      .replace(/&amp;/g, '&');
    if (!text.includes('│') || !/─/.test(text)) return whole;

    const parsed = parsePipeTable(text);
    if (!parsed) return whole;

    let out = '';
    if (parsed.label) out += `<p class="output-label">${escHtml(parsed.label)}</p>`;
    parsed.tables.forEach((t) => {
      if (t.headers.length < 2) return;
      let h = `<table class="output-table"><thead><tr>`;
      t.headers.forEach((x) => { h += `<th>${escHtml(x)}</th>`; });
      h += `</tr></thead><tbody>`;
      t.rows.forEach((r) => {
        h += `<tr>` + r.map((c) => `<td>${escHtml(c)}</td>`).join('') + `</tr>`;
      });
      h += `</tbody></table>`;
      out += h;
    });
    if (parsed.note) out += `<p class="output-note">${escHtml(parsed.note)}</p>`;
    return out;
  });
}

// SERVER-SIDE NORMALIZATION - article page ise use karta hai
export function normalizeContentServer(html: string): string {
  let out = html || '';
  try {
    // 0) PIPE TABLES -> REAL HTML TABLES (sabse pehle - pre blocks pe)
    out = pipeTablesToHtml(out);

    // 0b) HEADINGS: hardcoded dark colors hatao
    //     (Blogger ne h1-h6 pe color:#0f172a waghera lagaya tha ->
    //      dark mode mein invisible. Ab CSS var(--text-dark) jeetega)
    out = out.replace(/<h([1-6])([^>]*)>/gi, (m, lvl: string, attrs: string) => {
      const cleaned = attrs.replace(/\s*style\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, (sm, st: string) => {
        const val = st.slice(1, -1);
        // WHITE colors preserve karo (hero title white rehna chahiye);
        // sirf DARK colors strip karo (dark mode mein invisible the)
        const nv = val
          .replace(/color\s*:\s*(?!white\b|#fff\b|#ffffff\b|rgb\s*\(\s*255\s*,\s*255\s*,\s*255\s*\))[^;]+;?/gi, '')
          .replace(/\s*;\s*$/g, '').replace(/\s*:\s*$/g, '');
        return nv ? ` style="${nv}"` : '';
      });
      return `<h${lvl}${cleaned}>`;
    });

    // 0c) DIV/P light backgrounds + dark text colors strip
    //     (white boxes -> transparent -> theme bg; dark text -> theme text)
    out = out.replace(/<(div|p|span|li|ul|ol|blockquote|section|article)([^>]*)>/gi, (m, tag: string, attrs: string) => {
      const cleaned = attrs.replace(/\s*style\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, (sm, st: string) => {
        const val = st.slice(1, -1);
        const nv = val
          // known LIGHT backgrounds hatao (white boxes)
          .replace(/background(?:-color)?\s*:\s*(?:#fff|#ffffff|white|rgb\(\s*255\s*,\s*255\s*,\s*255\s*\)|rgb\(\s*248\s*,\s*250\s*,\s*252\s*\)|rgb\(\s*241\s*,\s*245\s*,\s*249\s*\)|rgb\(\s*238\s*,\s*247\s*,\s*255\s*\)|#f8fafc|#f1f5f9|#eef3ff|#f0f4ff|#eef2ff)\s*;?/gi, '')
          // known DARK text colors hatao
          .replace(/color\s*:\s*(?:#2c3e50|#0f172a|#475569|#333|#333333|#222|#000|#000000|#1e293b|#111827|rgb\(\s*44\s*,\s*62\s*,\s*80\s*\)|rgb\(\s*15\s*,\s*23\s*,\s*42\s*\)|rgb\(\s*71\s*,\s*85\s*,\s*105\s*\)|rgb\(\s*51\s*,\s*51\s*,\s*51\s*\)|rgb\(\s*17\s*,\s*24\s*,\s*39\s*\))\s*;?/gi, '')
          .replace(/\s*;\s*$/g, '').replace(/\s*:\s*$/g, '');
        return nv ? ` style="${nv}"` : '';
      });
      return `<${tag}${cleaned}>`;
    });

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

    // 6) "text" GARBAGE CLEANUP (Blogger feed artifact):
    //    har code block ke baad ek akela "text" line aata hai — hatao
    //    (pattern har jagah same hai: </code></pre> ke baad akela text line)
    out = out.replace(/<\/code>\s*<\/pre>\s*\n?\s*text\s*\n?/gi, '</code></pre>\n');

    // 7) PRE BLOCKS: inline style hatao (white-space:pre-wrap waghera)
    //    -> ASCII tables (| col | col |) columns ALIGNED rahenge
    //    -> CSS .post-body pre white-space:pre + overflow-x:auto jeetega
    out = out.replace(/<pre([^>]*)>/gi, (m, attrs: string) => {
      // style attribute sirf hatao, baaki rakho
      const kept = attrs.replace(/\s*style\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '');
      return `<pre${kept}>`;
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

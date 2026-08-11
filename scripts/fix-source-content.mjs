/**
 * CONTENT SOURCE FIXER - posts.json (feed.atom ka converted form)
 *
 * Kya fix karta hai:
 * 1) SQL pre blocks: "-- comment SELECT ..." same-line -> newline split
 *    (Blogger feed ne newlines kha di thin -> tokenizer poora query
 *     comment samajhta tha -> SAB SAME COLOR. Ab proper lines.)
 * 2) Table tags ke andar ke inline attrs (bgcolor/color/style) strip
 *    (dark mode white-table bug ka permanent source fix)
 *
 * USE: node scripts/fix-source-content.mjs   (posts.json -> posts-fixed.json)
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const srcFile = path.join(root, 'posts.json');
const outFile = path.join(root, 'posts-fixed.json');

if (!fs.existsSync(srcFile)) {
  console.error('❌ posts.json nahi mili — project root mein daalo');
  process.exit(1);
}

const posts = JSON.parse(fs.readFileSync(srcFile, 'utf8'));
console.log(`📄 posts.json mein posts: ${posts.length}`);

// SQL statement starters (uppercase match - query keywords)
const SQL_STARTERS = 'SELECT|INSERT|UPDATE|DELETE|CREATE|ALTER|DROP|WITH|SHOW|EXPLAIN|CALL|SET|DECLARE|TRUNCATE|MERGE';

function fixSqlLines(html) {
  // pre blocks ke andar "-- comment <SPACE> SELECT ..." -> newline
  return html.replace(/(<pre[\s\S]*?<\/pre>)/gi, (preBlock) => {
    let fixed = preBlock.replace(
      new RegExp(`(--[^\\n]*?)\\s+(?=(?:${SQL_STARTERS})\\b)`, 'gi'),
      '$1\n'
    );
    return fixed;
  });
}

function stripTableAttrs(html) {
  // har table block ke andar saare tags ke inline style/color/bgcolor hatao
  return html.replace(/<table[\s\S]*?<\/table>/gi, (block) => {
    let b = block;
    // font -> span
    b = b.replace(/<font[^>]*>/gi, '<span>').replace(/<\/font>/gi, '</span>');
    // attributes strip (saare tags)
    b = b.replace(/<(\/?)([a-zA-Z][a-zA-Z0-9]*)([^>]*)>/g, (m, close, name, rest) => {
      const trimmed = rest.trim();
      if (!trimmed || trimmed === '/') return m;
      const kept = [];
      const re = /([a-zA-Z-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g;
      let am;
      const BLOCKED = new Set(['style', 'bgcolor', 'background', 'color', 'align', 'valign', 'nowrap', 'width', 'height', 'border', 'cellpadding', 'cellspacing', 'face', 'size', 'bordercolor', 'cellborder']);
      while ((am = re.exec(rest)) !== null) {
        const key = am[1].toLowerCase();
        if (BLOCKED.has(key)) continue;
        const val = am[2] !== undefined ? am[2] : am[3] !== undefined ? am[3] : am[4];
        if (val !== undefined) kept.push(`${key}="${val.replace(/"/g, '&quot;')}"`);
        else kept.push(key);
      }
      return `<${close}${name}${kept.length ? ' ' + kept.join(' ') : ''}>`;
    });
    return b;
  });
}

let fixed = 0, tableFixed = 0;
for (const post of posts) {
  if (!post || typeof post.content !== 'string') continue;
  const before = post.content;
  let c = fixSqlLines(before);
  if (c !== before) fixed++;
  const c2 = stripTableAttrs(c);
  if (c2 !== c) tableFixed++;
  post.content = c2;
}

fs.writeFileSync(outFile, JSON.stringify(posts, null, 1));
console.log(`✅ SQL-line fix: ${fixed} posts | table-attr fix: ${tableFixed} posts`);
console.log(`📦 Output: posts-fixed.json (${Math.round(fs.statSync(outFile).size / 1024)} KB)`);

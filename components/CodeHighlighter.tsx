'use client';

import { useEffect } from 'react';

// CODE SYNTAX HIGHLIGHTING + COPY BUTTON
// Lightweight client-side highlighter (koi heavy library nahi - fast)
export default function CodeHighlighter() {
  useEffect(() => {
    const body = document.querySelector('.post-body.entry-content');
    if (!body) return;

    // 1. Copy button har code block pe
    body.querySelectorAll('pre').forEach((pre) => {
      if (pre.getAttribute('data-copy-done')) return;
      pre.setAttribute('data-copy-done', '1');
      pre.style.position = 'relative';

      const btn = document.createElement('button');
      btn.textContent = '📋 Copy';
      btn.style.cssText = 'position:absolute;top:8px;right:8px;background:rgba(255,255,255,0.12);color:#e2e8f0;border:1px solid rgba(255,255,255,0.2);padding:4px 10px;border-radius:6px;font-size:0.72rem;cursor:pointer;z-index:5;';
      btn.onclick = () => {
        const code = pre.querySelector('code') || pre;
        navigator.clipboard.writeText(code.textContent || '').then(() => {
          btn.textContent = '✅ Copied!';
          setTimeout(() => { btn.textContent = '📋 Copy'; }, 1500);
        });
      };
      pre.appendChild(btn);
    });

    // 2. Light syntax highlight (keywords - lightweight regex, fast)
    body.querySelectorAll('pre code').forEach((el) => {
      const code = el as HTMLElement;
      if (code.getAttribute('data-hl-done')) return;
      code.setAttribute('data-hl-done', '1');
      let html = code.innerHTML;
      // SQL/Python keywords
      const kw = 'SELECT|FROM|WHERE|GROUP|BY|ORDER|HAVING|JOIN|INNER|LEFT|RIGHT|FULL|ON|AND|OR|NOT|NULL|AS|DISTINCT|LIMIT|INSERT|INTO|VALUES|UPDATE|SET|DELETE|CREATE|TABLE|COUNT|SUM|AVG|MIN|MAX|RANK|OVER|PARTITION|LAG|LEAD|WITH|CASE|WHEN|THEN|ELSE|END|LIKE|IN|BETWEEN|UNION|ALL|ASC|DESC|RETURN|VAR|CALCULATE|TOTALYTD|SAMEPERIODLASTYEAR|DIVIDE|FILTER|ALL|RANKX|SWITCH|TRUE|FALSE|def|import|from|return|if|else|elif|for|while|print|lambda|class|None|True|False|and|or|not|in|is|self|pd|np';
      html = html.replace(new RegExp('\\b(' + kw + ')\\b', 'gi'), '<span style="color:#c792ea;font-weight:600">$1</span>');
      // strings
      html = html.replace(/('(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*")/g, '<span style="color:#a5d6a7">$1</span>');
      // comments
      html = html.replace(/(--[^\n]*|#.*$)/gm, '<span style="color:#64748b;font-style:italic">$1</span>');
      // numbers
      html = html.replace(/\b(\d+(?:\.\d+)?)\b/g, '<span style="color:#f78c6c">$1</span>');
      code.innerHTML = html;
    });
  }, []);

  return null;
}

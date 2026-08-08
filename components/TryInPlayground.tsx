'use client';

import { useEffect } from 'react';

// TRY IN PLAYGROUND - post ke SQL code blocks pe button
// Click -> query localStorage mein save -> /tools/sql-playground pe le jata hai (auto-fill + run)
export default function TryInPlayground() {
  useEffect(() => {
    const body = document.querySelector('.post-body.entry-content');
    if (!body) return;

    body.querySelectorAll('pre code').forEach((code) => {
      if (code.getAttribute('data-tp-done')) return;
      const text = code.textContent || '';
      // sirf SQL-looking blocks pe button
      if (!/SELECT|INSERT|UPDATE|DELETE|CREATE|WITH|FROM|JOIN/i.test(text)) return;

      const pre = code.closest('pre');
      if (!pre) return;
      if (pre.getAttribute('data-tp-done')) return;
      pre.setAttribute('data-tp-done', '1');
      pre.style.position = 'relative';

      const btn = document.createElement('button');
      btn.innerHTML = '🧠 Try in Playground';
      btn.style.cssText = 'position:absolute;top:8px;left:8px;background:var(--gradient);color:#fff;border:none;padding:6px 14px;border-radius:16px;font-size:0.72rem;font-weight:700;cursor:pointer;z-index:6;box-shadow:0 3px 10px rgba(102,126,234,0.35);';
      btn.onclick = () => {
        try {
          localStorage.setItem('di_sql_draft', text);
          localStorage.setItem('di_sql_draft_auto', text);
        } catch {}
        window.location.href = '/tools/sql-playground';
      };
      pre.appendChild(btn);
    });
  }, []);

  return null;
}

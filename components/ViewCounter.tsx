'use client';

import { useEffect } from 'react';

// VIEW COUNTER - smart & accurate
// - Har article ka apna counter (alag-alag posts = alag views)
// - Same browser: 24 hrs ke andar SIRF EK BAAR count
// - 24 hrs ke baad dobara aaye -> count HOTA HAI (daily unique view)
// - Naye users = naye views (views organically badhte hain)
const VIEW_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

export default function ViewCounter({ articleId }: { articleId: number }) {
  useEffect(() => {
    try {
      const key = 'di_view_' + articleId;
      const last = Number(localStorage.getItem(key) || '0');
      const now = Date.now();
      if (now - last < VIEW_EXPIRY_MS) return; // 24 hrs ke andar - count nahi

      // count + timestamp save
      localStorage.setItem(key, String(now));
      fetch('/api/pageview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articleId }),
        keepalive: true,
      }).catch(() => {
        // fail hone pe timestamp revert (taaki count miss na ho)
        try { localStorage.setItem(key, String(last)); } catch {}
      });
    } catch {
      // localStorage unavailable - sessionStorage fallback (24hr nahi, session tak)
      try {
        if (!sessionStorage.getItem('di_sess_' + articleId)) {
          sessionStorage.setItem('di_sess_' + articleId, '1');
          fetch('/api/pageview', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ articleId }),
            keepalive: true,
          }).catch(() => {});
        }
      } catch {}
    }
  }, [articleId]);

  return null;
}

'use client';

import { useEffect, useState } from 'react';

// ADSENSE AD SLOTS - async, free, site slow nahi hota
// Settings (admin) se enabled + client ID + slot IDs aate hain.
// Jab tak AdSense approved + IDs daale nahi jaate, kuch bhi render nahi hota.
type AdsSettings = { enabled: boolean; client: string; homeSlot: string; articleSlot: string; sidebarSlot: string };

let adsCache: AdsSettings | null = null;
let scriptInjected = false;

export default function AdSlots({ position }: { position: 'home' | 'article' | 'sidebar' }) {
  const [ads, setAds] = useState<AdsSettings | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (adsCache) {
      setAds(adsCache);
      return;
    }
    fetch('/api/settings')
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return;
        adsCache = d?.adsense || null;
        setAds(adsCache);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  // script ek baar inject (async - render block nahi karta)
  useEffect(() => {
    if (!ads || !ads.enabled || !ads.client || scriptInjected) return;
    if (typeof window === 'undefined') return;
    scriptInjected = true;
    const s = document.createElement('script');
    s.async = true;
    s.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ads.client}`;
    s.crossOrigin = 'anonymous';
    document.head.appendChild(s);
  }, [ads]);

  if (!ads || !ads.enabled || !ads.client) return null;
  const slot = position === 'home' ? ads.homeSlot : position === 'article' ? ads.articleSlot : ads.sidebarSlot;
  if (!slot) return null;

  return (
    <div className="ad-slot" data-position={position}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={ads.client}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
      <script
        dangerouslySetInnerHTML={{
          __html: `(adsbygoogle = window.adsbygoogle || []).push({});`,
        }}
      />
    </div>
  );
}

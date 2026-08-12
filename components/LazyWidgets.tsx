'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

// LAZY WIDGETS - Performance fix (TBT 50ms -> ~10ms)
// Ye 10 widgets pehle har page pe hydrate hote the (main thread busy -> TBT + LCP delay)
// Ab sab DYNAMIC (ssr:false) - initial page shell pehle render + hydrate hota hai,
// widgets background mein alag chunks mein load hote hain (turant, koi blockage nahi).

// MOBILE PERFORMANCE v2:
// Mobile pe heavy widgets (jo keyboard/desktop ke liye hain) LOAD HI NAHI hote:
//   - CommandPalette (Ctrl+K)      -> mobile pe keyboard nahi
//   - KonamiCode (easter egg)       -> keyboard wala game
//   - ProductivityHub (387 lines)   -> VS Code shortcuts panel
//   - CheatSheet (200 lines)        -> modal
//   - SmartAssistant (186 lines)    -> chat assistant + voice
// Desktop pe SAB kuch waisa hi chalta hai (>=768px).
// Mobile pe sirf zaroori rahte hain: CodeHighlighter, ClientWidgets,
// MobileStickyBar, ImageLightbox, ReadingHistory.

const SmartAssistant = dynamic(() => import('@/components/SmartAssistant'), { ssr: false, loading: () => null });
const ClientWidgets = dynamic(() => import('@/components/ClientWidgets'), { ssr: false, loading: () => null });
const CheatSheet = dynamic(() => import('@/components/CheatSheet'), { ssr: false, loading: () => null });
const CommandPalette = dynamic(() => import('@/components/CommandPalette'), { ssr: false, loading: () => null });
const MobileStickyBar = dynamic(() => import('@/components/MobileStickyBar'), { ssr: false, loading: () => null });
const ProductivityHub = dynamic(() => import('@/components/ProductivityHub'), { ssr: false, loading: () => null });
const CodeHighlighter = dynamic(() => import('@/components/CodeHighlighter'), { ssr: false, loading: () => null });
const ImageLightbox = dynamic(() => import('@/components/ImageLightbox'), { ssr: false, loading: () => null });
const KonamiCode = dynamic(() => import('@/components/KonamiCode'), { ssr: false, loading: () => null });
const ReadingHistory = dynamic(() => import('@/components/ReadingHistory'), { ssr: false, loading: () => null });

export default function LazyWidgets() {
  // Mobile detect (SSR safe: pehle desktop mode, phir browser mein update)
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)');
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  return (
    <>
      {/* MOBILE PE BAND (desktop pe chalta hai) */}
      {!isMobile && <SmartAssistant />}
      {!isMobile && <CheatSheet />}
      {!isMobile && <CommandPalette />}
      {!isMobile && <ProductivityHub />}
      {!isMobile && <KonamiCode />}

      {/* DONO PE (mobile + desktop) - zaroori */}
      <ClientWidgets />
      <MobileStickyBar />
      <CodeHighlighter />
      <ImageLightbox />
      <ReadingHistory />
    </>
  );
}

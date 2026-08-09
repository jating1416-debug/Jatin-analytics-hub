'use client';

import dynamic from 'next/dynamic';

// LAZY WIDGETS - Performance fix (TBT 50ms -> ~10ms)
// Ye 10 widgets pehle har page pe hydrate hote the (main thread busy -> TBT + LCP delay)
// Ab sab DYNAMIC (ssr:false) - initial page shell pehle render + hydrate hota hai,
// widgets background mein alag chunks mein load hote hain (turant, koi blockage nahi).

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
  return (
    <>
      <SmartAssistant />
      <ClientWidgets />
      <CheatSheet />
      <CommandPalette />
      <MobileStickyBar />
      <ProductivityHub />
      <CodeHighlighter />
      <ImageLightbox />
      <KonamiCode />
      <ReadingHistory />
    </>
  );
}

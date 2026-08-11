import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ReadingProgress from '@/components/ReadingProgress';
import LazyWidgets from '@/components/LazyWidgets';
import PremiumFX from '@/components/PremiumFX';
import FontLoader from '@/components/FontLoader';
import { SITE_NAME, SITE_DESC, SITE_URL } from '@/lib/utils';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} | Data Analytics Blog — SQL, Python, Power BI Tutorials`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESC,
  alternates: {
    canonical: SITE_URL,
  },
  keywords: [
    'data analytics', 'SQL', 'Python', 'Power BI', 'MySQL', 'Pandas',
    'Excel', 'data analyst career', 'interview questions',
  ],
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    title: `${SITE_NAME} | Data Analytics Blog`,
    description: SITE_DESC,
    url: SITE_URL,
  },
  twitter: { card: 'summary_large_image', title: `${SITE_NAME} | Data Analytics Blog`, description: SITE_DESC },
  robots: { index: true, follow: true },
  verification: {
    // Google Search Console - Vercel env: GOOGLE_SITE_VERIFICATION
    // (Search Console → Settings → Verification → HTML tag se code lo)
    google: process.env.GOOGLE_SITE_VERIFICATION || '',
  },
  icons: {
    icon: '/icon.svg',
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Fonts + Font Awesome: NON-BLOCKING + TURANT (head parse hote hi inject).
            display=optional -> font swap kabhi nahi -> font-CLS ZERO.
            FontLoader client component inhe detect karke skip karta hai (same ids). */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){function L(href,id){try{if(document.getElementById(id))return;var l=document.createElement('link');l.id=id;l.rel='stylesheet';l.href=href;l.media='print';l.onload=function(){l.media='all';};document.head.appendChild(l);}catch(e){}}L('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Sora:wght@700;800&family=Fira+Code:wght@400&display=optional','font-gfonts');L('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css','font-fa');})();`
          }}
        />
        {/* Noscript fallback sirf bina-JS browsers ke liye. */}
        <noscript>
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Sora:wght@700;800&family=Fira+Code:wght@400&display=swap" rel="stylesheet" />
          <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet" />
        </noscript>
      </head>
      <body>
        <FontLoader />
        <ReadingProgress />
        <PremiumFX />
        <Navbar />
        {children}
        <Footer />
        {/* HEAVY WIDGETS - lazy load (performance fix) */}
        <LazyWidgets />
      </body>
    </html>
  );
}

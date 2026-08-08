import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ReadingProgress from '@/components/ReadingProgress';
import SmartAssistant from '@/components/SmartAssistant';
import ClientWidgets from '@/components/ClientWidgets';
import CheatSheet from '@/components/CheatSheet';
import CommandPalette from '@/components/CommandPalette';
import MobileStickyBar from '@/components/MobileStickyBar';
import ProductivityHub from '@/components/ProductivityHub';
import CodeHighlighter from '@/components/CodeHighlighter';
import ImageLightbox from '@/components/ImageLightbox';
import KonamiCode from '@/components/KonamiCode';
import ReadingHistory from '@/components/ReadingHistory';
import PremiumFX from '@/components/PremiumFX';
import { SITE_NAME, SITE_DESC, SITE_URL } from '@/lib/utils';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} | Data Analytics Blog — SQL, Python, Power BI Tutorials`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESC,
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
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Sora:wght@600;700;800&family=Fira+Code:wght@400;500&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
          rel="stylesheet"
        />
      </head>
      <body>
        <ReadingProgress />
        <PremiumFX />
        <Navbar />
        {children}
        <Footer />
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
      </body>
    </html>
  );
}

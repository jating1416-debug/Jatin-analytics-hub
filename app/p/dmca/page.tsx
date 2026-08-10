import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'DMCA — Data Insights',
  description: 'Data Insights DMCA policy.',
};

export default function DmcaPage() {
  return (
    <div className="layout-wrapper">
      <main className="posts-section">
        <div className="post-content-wrapper" style={{ padding: 34 }}>
          <h1 className="article-title" style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: 18 }}>⚖️ DMCA Policy</h1>
          <p style={{ color: 'var(--text-light)', lineHeight: 1.8, marginBottom: 16 }}>
            <b style={{ color: 'var(--text-dark)' }}>Last updated:</b> August 2026
          </p>
          <p style={{ color: 'var(--text-light)', lineHeight: 1.8 }}>
            Data Insights copyright laws ka respect karta hai. Agar aapko lagta hai ki koi
            content aapke copyright ka ullanghan karta hai, to <b>Contact page</b> se message
            bhejo — hum 48 ghante mein response karte hain aur galat content hata denge.
          </p>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '20px 0 10px' }}>Notice mein kya hona chahiye</h2>
          <ul style={{ paddingLeft: 22, color: 'var(--text-light)', lineHeight: 1.8 }}>
            <li>Aapka naam + contact info</li>
            <li>Copyrighted work ka description</li>
            <li>Exact URL jahan content hai</li>
            <li>Statement ki aap copyright owner ho</li>
          </ul>
        </div>
      </main>
    </div>
  );
}

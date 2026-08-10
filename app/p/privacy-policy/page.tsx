import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy — Data Insights',
  description: 'Data Insights privacy policy — aapka data kaise handle hota hai.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="layout-wrapper">
      <main className="posts-section">
        <div className="post-content-wrapper" style={{ padding: 34 }}>
          <h1 className="article-title" style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: 18 }}>
            🔒 Privacy Policy
          </h1>

          <p style={{ color: 'var(--text-light)', lineHeight: 1.8, marginBottom: 16 }}>
            <b style={{ color: 'var(--text-dark)' }}>Last updated:</b> August 2026
          </p>

          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '20px 0 10px' }}>1. Hum kya collect karte hain</h2>
          <ul style={{ paddingLeft: 22, color: 'var(--text-light)', lineHeight: 1.8 }}>
            <li><b>Comments:</b> Aap comment karte ho to naam + message save hota hai (blog pe dikhne ke liye).</li>
            <li><b>Contact form:</b> Naam + email + message — sirf reply dene ke liye.</li>
            <li><b>Newsletter:</b> Email address — sirf aapki permission se.</li>
            <li><b>Anonymous usage data:</b> Views count, page visits (koi personal info nahi).</li>
          </ul>

          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '20px 0 10px' }}>2. Cookies / localStorage</h2>
          <p style={{ color: 'var(--text-light)', lineHeight: 1.8 }}>
            Ye site browser localStorage use karta hai — theme (dark/light), reading list,
            language preference aur view counting (24 ghante mein ek baar). Ye sab aapke
            browser mein hi rehta hai.
          </p>

          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '20px 0 10px' }}>3. Third-party services</h2>
          <ul style={{ paddingLeft: 22, color: 'var(--text-light)', lineHeight: 1.8 }}>
            <li><b>Vercel</b> — hosting (server logs)</li>
            <li><b>Supabase</b> — database (data storage)</li>
            <li><b>Google Fonts & Font Awesome</b> — styling</li>
          </ul>

          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '20px 0 10px' }}>4. Aapka control</h2>
          <p style={{ color: 'var(--text-light)', lineHeight: 1.8 }}>
            Koi bhi personal data delete karwana ho to <b>Contact page</b> se message bhejo.
            Browser settings se localStorage bhi clear kar sakte ho.
          </p>
        </div>
      </main>
    </div>
  );
}

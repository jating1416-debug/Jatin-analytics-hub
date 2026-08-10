import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms & Conditions — Data Insights',
  description: 'Data Insights terms and conditions.',
};

export default function TermsPage() {
  return (
    <div className="layout-wrapper">
      <main className="posts-section">
        <div className="post-content-wrapper" style={{ padding: 34 }}>
          <h1 className="article-title" style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: 18 }}>📜 Terms & Conditions</h1>
          <p style={{ color: 'var(--text-light)', lineHeight: 1.8, marginBottom: 16 }}>
            <b style={{ color: 'var(--text-dark)' }}>Last updated:</b> August 2026
          </p>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '20px 0 10px' }}>1. Use of content</h2>
          <p style={{ color: 'var(--text-light)', lineHeight: 1.8 }}>
            Blog ka content seekhne aur reference ke liye free hai. Bina permission content
            copy karke apni website pe publish karna allowed nahi hai.
          </p>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '20px 0 10px' }}>2. Comments</h2>
          <p style={{ color: 'var(--text-light)', lineHeight: 1.8 }}>
            Comments respectful hone chahiye. Spam, abusive ya galat content delete kar diya jaata hai.
          </p>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '20px 0 10px' }}>3. Tools</h2>
          <p style={{ color: 'var(--text-light)', lineHeight: 1.8 }}>
            Saare tools browser mein chalte hain aur free hain. Tools ka use apni zimmedari pe karo.
          </p>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '20px 0 10px' }}>4. Changes</h2>
          <p style={{ color: 'var(--text-light)', lineHeight: 1.8 }}>
            Ye terms kabhi bhi update ho sakti hain — page pe updated date hamesha dikhega.
          </p>
        </div>
      </main>
    </div>
  );
}

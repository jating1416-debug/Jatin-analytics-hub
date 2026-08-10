import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Disclaimer — Data Insights',
  description: 'Data Insights disclaimer — educational content notice.',
};

export default function DisclaimerPage() {
  return (
    <div className="layout-wrapper">
      <main className="posts-section">
        <div className="post-content-wrapper" style={{ padding: 34 }}>
          <h1 className="article-title" style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: 18 }}>📝 Disclaimer</h1>
          <p style={{ color: 'var(--text-light)', lineHeight: 1.8, marginBottom: 16 }}>
            <b style={{ color: 'var(--text-dark)' }}>Last updated:</b> August 2026
          </p>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '20px 0 10px' }}>Educational purpose</h2>
          <p style={{ color: 'var(--text-light)', lineHeight: 1.8 }}>
            Is blog ka saara content <b>educational aur informational</b> purpose ke liye hai.
            Examples aur datasets sample hain — real-world production mein use karne se pehle
            apni research karo.
          </p>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '20px 0 10px' }}>No guarantee</h2>
          <p style={{ color: 'var(--text-light)', lineHeight: 1.8 }}>
            Hum content ki accuracy ke liye mehnat karte hain, lekin 100% correctness ki
            guarantee nahi dete. Kisi bhi tutorial ke result se hone wale nuksan ki zimmedari
            nahi le sakte.
          </p>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '20px 0 10px' }}>External links</h2>
          <p style={{ color: 'var(--text-light)', lineHeight: 1.8 }}>
            Blog pe external websites ke links ho sakte hain — unki content ki zimmedari humari nahi hai.
          </p>
        </div>
      </main>
    </div>
  );
}

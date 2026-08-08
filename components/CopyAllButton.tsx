'use client';

// COPY ALL BUTTON - downloads page ke liye (client component zaroori tha,
// kyunki onClick server component mein allowed nahi hai)
export default function CopyAllButton({ text }: { text: string }) {
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      const btn = document.activeElement as HTMLElement | null;
      if (btn) {
        const orig = btn.textContent;
        btn.textContent = '✅ Copied!';
        setTimeout(() => { if (btn && btn.isConnected) btn.textContent = orig; }, 1500);
      }
    } catch {
      alert('Copy nahi ho paya — manually select karke copy karo');
    }
  };
  return (
    <button onClick={copy} className="read-more-btn" style={{ border: 'none', cursor: 'pointer' }}>
      📋 Copy All
    </button>
  );
}

// Smooth loading state - homepage/route transition pe dikhega
export default function Loading() {
  return (
    <div style={{ maxWidth: 1200, margin: '40px auto', padding: '0 20px' }}>
      <div style={{ height: 30, width: '30%', background: 'var(--border)', borderRadius: 8, marginBottom: 20, opacity: 0.5 }} />
      <div style={{ height: 120, background: 'var(--border)', borderRadius: 12, marginBottom: 16, opacity: 0.4 }} />
      <div style={{ height: 120, background: 'var(--border)', borderRadius: 12, marginBottom: 16, opacity: 0.3 }} />
      <div style={{ height: 120, background: 'var(--border)', borderRadius: 12, opacity: 0.2 }} />
    </div>
  );
}

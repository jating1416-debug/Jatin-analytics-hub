// Admin loading state
export default function AdminLoading() {
  return (
    <div>
      <div style={{ height: 30, width: '40%', background: 'var(--border)', borderRadius: 8, marginBottom: 20, opacity: 0.5 }} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 20 }}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} style={{ height: 90, background: 'var(--border)', borderRadius: 12, opacity: 0.4 }} />
        ))}
      </div>
      <div style={{ height: 200, background: 'var(--border)', borderRadius: 12, opacity: 0.3 }} />
    </div>
  );
}

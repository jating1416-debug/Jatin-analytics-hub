'use client';

// LOGOUT BUTTON - Client component (Server layout mein onClick allowed nahi hai)
export default function LogoutButton() {
  return (
    <button
      style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.88rem', padding: '9px 0', fontFamily: 'inherit', width: '100%', textAlign: 'left' }}
      onClick={async () => {
        try {
          await fetch('/api/auth/logout', { method: 'POST' });
        } catch {}
        window.location.href = '/login';
      }}
    >
      <i className="fas fa-sign-out-alt" /> Logout
    </button>
  );
}

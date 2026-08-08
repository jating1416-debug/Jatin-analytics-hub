import { redirect } from 'next/navigation';
import { isAdmin } from '@/lib/auth';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await isAdmin();
  if (!admin) redirect('/login'); // login page ab /admin ke BAHAR hai (loop fix)

  return (
    <div className="layout-wrapper">
      <aside className="sidebar" style={{ position: 'static' }}>
        <div className="sidebar-widget">
          <div className="widget-title"><i className="fas fa-user-shield" /> Admin Panel</div>
          <ul className="hub-list">
            <li><Link href="/admin"><i className="fas fa-chart-line" /> Dashboard</Link></li>
            <li><Link href="/admin/articles"><i className="fas fa-file-alt" /> All Articles</Link></li>
            <li><Link href="/admin/articles/new"><i className="fas fa-plus-circle" /> New Article</Link></li>
            <li><Link href="/"><i className="fas fa-globe" /> View Site</Link></li>
            <li>
              <button
                style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.88rem', padding: '9px 0', fontFamily: 'inherit' }}
                onClick={async () => {
                  await fetch('/api/auth/logout', { method: 'POST' });
                  window.location.href = '/login';
                }}
              >
                <i className="fas fa-sign-out-alt" /> Logout
              </button>
            </li>
          </ul>
        </div>
      </aside>
      <main className="posts-section" style={{ minWidth: 0 }}>
        {children}
      </main>
    </div>
  );
}

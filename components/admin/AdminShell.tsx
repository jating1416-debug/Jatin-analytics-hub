'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import LogoutButton from '@/components/admin/LogoutButton';

// ADMIN PRO v2 - premium dark sidebar + topbar + mobile off-canvas
const NAV = [
  { href: '/admin', icon: 'fa-gauge-high', label: 'Dashboard' },
  { href: '/admin/articles', icon: 'fa-file-lines', label: 'All Articles' },
  { href: '/admin/articles/new', icon: 'fa-pen-to-square', label: 'New Article' },
  { href: '/admin/categories', icon: 'fa-folder-tree', label: 'Categories' },
  { href: '/admin/comments', icon: 'fa-comments', label: 'Comments' },
  { href: '/admin/pages', icon: 'fa-file-lines', label: 'Pages' },
  { href: '/admin/media', icon: 'fa-images', label: 'Media' },
  { href: '/admin/analytics', icon: 'fa-chart-line', label: 'Analytics' },
  { href: '/admin/settings', icon: 'fa-gear', label: 'Settings' },
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // route change pe mobile menu band
  useEffect(() => { setOpen(false); }, [pathname]);

  // mobile pe scroll lock
  useEffect(() => {
    document.body.classList.toggle('admin-menu-open', open);
    return () => document.body.classList.remove('admin-menu-open');
  }, [open]);

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin';
    return pathname.startsWith(href);
  };

  return (
    <div className="admin-shell">
      {/* overlay (mobile) */}
      {open && <div className="admin-overlay" onClick={() => setOpen(false)} />}

      {/* SIDEBAR */}
      <aside className={`admin-sidebar${open ? ' open' : ''}`}>
        <div className="admin-logo">
          <span className="admin-logo-badge"><i className="fas fa-chart-line" /></span>
          <span>
            <div className="admin-logo-name">Data Insights</div>
            <div className="admin-logo-sub">ADMIN PANEL</div>
          </span>
        </div>

        <nav className="admin-nav">
          {NAV.map((n) => {
            const active = isActive(n.href);
            return (
              <Link
                key={n.href}
                href={n.href}
                className={`admin-nav-link${active ? ' active' : ''}`}
              >
                <span className="admin-nav-icon"><i className={`fas ${n.icon}`} /></span>
                <span>{n.label}</span>
                {active && <span className="admin-nav-dot" />}
              </Link>
            );
          })}

          <div className="admin-nav-sep" />

          <Link href="/" target="_blank" className="admin-nav-link">
            <span className="admin-nav-icon"><i className="fas fa-globe" /></span>
            <span>View Site</span>
          </Link>
        </nav>

        <div className="admin-user-card">
          <div className="admin-user-avatar">👤</div>
          <div>
            <div className="admin-user-name">Jatin Kumar</div>
            <div className="admin-user-role">Administrator</div>
          </div>
          <LogoutButton />
        </div>
      </aside>

      {/* MAIN */}
      <div className="admin-main">
        {/* TOPBAR (mobile visible, desktop mini) */}
        <header className="admin-topbar">
          <button className="admin-burger" onClick={() => setOpen(!open)} aria-label="Menu">
            <i className={`fas ${open ? 'fa-xmark' : 'fa-bars'}`} />
          </button>
          <div className="admin-topbar-title">
            <i className="fas fa-user-shield" /> Admin Panel
          </div>
          <div className="admin-topbar-right">
            <Link href="/admin/articles/new" className="admin-topbar-btn">
              <i className="fas fa-plus" /> <span>New Post</span>
            </Link>
            <span className="admin-topbar-avatar">👤</span>
          </div>
        </header>

        <main className="admin-content">{children}</main>
      </div>
    </div>
  );
}

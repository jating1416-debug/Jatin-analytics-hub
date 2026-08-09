'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import { getSidebar } from '@/lib/client-sidebar';

// SIDEBAR CLIENT - sidebar data CLIENT-side fetch karta hai (/api/sidebar)
// Isse home/article pages server pe kam queries karte hain -> FAST loading
type SidebarData = {
  categories: { name: string; slug: string; count: number }[];
  recent: { title: string; slug: string; categorySlug: string; date: string }[];
  popular: { title: string; slug: string; categorySlug: string; views: number }[];
};

export default function SidebarClient() {
  const [data, setData] = useState<SidebarData | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getSidebar()
      .then((d) => { if (!cancelled) { if (d) setData(d); else setFailed(true); } })
      .catch(() => { if (!cancelled) setFailed(true); });
    return () => { cancelled = true; };
  }, []);

  if (failed) return null;
  if (!data) {
    return (
      <aside className="sidebar" aria-hidden="true">
        <div className="sidebar-widget">
          <div className="skel" style={{ height: 22, width: '55%', marginBottom: 12 }} />
          <div className="skel" style={{ height: 12, width: '100%', marginBottom: 8 }} />
          <div className="skel" style={{ height: 12, width: '85%', marginBottom: 8 }} />
          <div className="skel" style={{ height: 12, width: '70%' }} />
        </div>
        <div className="sidebar-widget">
          <div className="skel" style={{ height: 22, width: '60%', marginBottom: 12 }} />
          <div className="skel" style={{ height: 12, width: '90%', marginBottom: 8 }} />
          <div className="skel" style={{ height: 12, width: '75%', marginBottom: 8 }} />
          <div className="skel" style={{ height: 12, width: '80%' }} />
        </div>
      </aside>
    );
  }

  return (
    <Sidebar
      categories={data.categories.map((c) => ({ name: c.name, slug: c.slug, _count: { articles: c.count } }))}
      recent={data.recent}
      popular={data.popular}
    />
  );
}

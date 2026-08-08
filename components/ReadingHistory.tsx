'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

// READING HISTORY - "Aapne ye posts padhi hain" (localStorage)
type Item = { title: string; url: string; time: number };

export default function ReadingHistory() {
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    try {
      const list: Item[] = JSON.parse(localStorage.getItem('di_history') || '[]');
      setItems(list.slice(0, 6));
    } catch {}
  }, []);

  if (items.length === 0) return null;

  return (
    <div className="sidebar-widget">
      <div className="widget-title"><i className="fas fa-history" /> Reading History</div>
      <ul className="recent-posts-list">
        {items.map((it) => (
          <li className="recent-post-item" key={it.url + it.time}>
            <div className="recent-post-info">
              <Link href={it.url}>{it.title.slice(0, 50)}</Link>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

// Helper: article page pe use karne ke liye
export function addToHistory(title: string, url: string) {
  try {
    const list: Item[] = JSON.parse(localStorage.getItem('di_history') || '[]');
    const filtered = list.filter((x) => x.url !== url);
    filtered.unshift({ title, url, time: Date.now() });
    localStorage.setItem('di_history', JSON.stringify(filtered.slice(0, 15)));
  } catch {}
}

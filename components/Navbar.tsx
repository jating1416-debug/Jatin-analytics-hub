'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

const NAV_ITEMS = [
  { href: '/?cat=sql', label: '📊 SQL' },
  { href: '/?cat=python', label: '🐍 Python' },
  { href: '/?cat=power-bi', label: '📈 Power BI' },
  { href: '/?cat=career', label: '💼 Career' },
  { href: '/?cat=interview-questions', label: '🎯 Interview Q&A' },
  { href: '/?cat=case-study', label: '📁 Case Study' },
];

export default function Navbar() {
  const [dark, setDark] = useState(false);
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<{ title: string; url: string }[]>([]);
  const [showSuggest, setShowSuggest] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('di_theme') === 'dark';
    setDark(saved);
    document.documentElement.classList.toggle('dark-mode', saved);
  }, []);

  const toggleDark = () => {
    const next = !dark;
    setDark(next);
    localStorage.setItem('di_theme', next ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark-mode', next);
  };

  // LIVE SEARCH - type karte hi suggestions (server pe /api/search)
  const onSearchInput = async (value: string) => {
    setQuery(value);
    const q = value.trim();
    if (q.length < 2) { setSuggestions([]); setShowSuggest(false); return; }
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}&limit=5`);
      if (res.ok) {
        const data = await res.json();
        setSuggestions(data.results || []);
        setShowSuggest(true);
      }
    } catch {}
  };

  const onSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) window.location.href = '/search?q=' + encodeURIComponent(query.trim());
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link className="nav-logo" href="/">
          {'<DataInsights />'}
        </Link>

        <div className="nav-center" style={{ position: 'relative' }}>
          <form className="search-box" id="search-box" onSubmit={onSearchSubmit}>
            <input
              id="search-input"
              value={query}
              onChange={(e) => onSearchInput(e.target.value)}
              onFocus={() => suggestions.length > 0 && setShowSuggest(true)}
              onBlur={() => setTimeout(() => setShowSuggest(false), 200)}
              placeholder="Search posts..."
              type="text"
              autoComplete="off"
            />
            <i className="fas fa-search" />
          </form>

          {/* Live suggestions dropdown */}
          {showSuggest && suggestions.length > 0 && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 8px)', left: '50%', transform: 'translateX(-50%)',
              width: 'min(420px, 90vw)', background: 'var(--card-bg)', border: '1px solid var(--border)',
              borderRadius: 14, boxShadow: '0 18px 45px rgba(2,6,23,0.18)', zIndex: 1000, padding: 8, textAlign: 'left',
            }}>
              {suggestions.map((s) => (
                <a
                  key={s.url}
                  href={s.url}
                  style={{ display: 'block', padding: '9px 12px', borderRadius: 10, color: 'var(--text-dark)', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600 }}
                  onMouseDown={(e) => e.preventDefault()}
                >
                  {s.title}
                </a>
              ))}
            </div>
          )}
        </div>

        <ul className="nav-links">
          <li><Link href="/">🏠 Home</Link></li>
          {NAV_ITEMS.map((item) => (
            <li key={item.href}>
              <Link href={item.href}>{item.label}</Link>
            </li>
          ))}
          <li><Link href="/downloads">📥 Downloads</Link></li>
          <li>
            <a className="nav-portfolio-btn" href="https://jatinanalytics.co.in" target="_blank" rel="noopener">
              🚀 My Portfolio
            </a>
          </li>
        </ul>

        <button
          onClick={() => window.dispatchEvent(new CustomEvent('open-cheatsheet'))}
          style={{
            background: 'var(--gradient)', color: '#fff', border: 'none', padding: '8px 14px',
            borderRadius: 20, fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', flexShrink: 0,
            display: 'flex', alignItems: 'center', gap: 6,
          }}
          title="Cheat Sheet (Ctrl+Shift+C)"
        >
          <i className="fas fa-code" /> Cheat Sheet
        </button>

        <button
          onClick={() => window.dispatchEvent(new CustomEvent('open-productivity-hub'))}
          style={{
            background: 'var(--bg)', color: 'var(--text-dark)', border: '1px solid var(--border)',
            padding: '8px 14px', borderRadius: 20, fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer',
            flexShrink: 0, display: 'flex', alignItems: 'center', gap: 6,
          }}
          title="Productivity Hub"
        >
          <i className="fas fa-bolt" /> Hub
        </button>

        <button
          className="dark-mode-toggle"
          onClick={toggleDark}
          title="Toggle Dark Mode"
          aria-label="Toggle dark mode"
        >
          <i className={dark ? 'fas fa-sun' : 'fas fa-moon'} />
        </button>
      </div>
    </nav>
  );
}

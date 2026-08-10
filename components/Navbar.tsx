'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

// NAVBAR v3 - REAL category pages pe links (reliable - koi JS depend nahi)
// + compact layout (portfolio kabhi cut nahi hoga) + i18n labels

const NAV_ITEMS = [
  { href: '/category/sql', label: '📊 SQL' },
  { href: '/category/python', label: '🐍 Python' },
  { href: '/category/power-bi', label: '📈 Power BI' },
  { href: '/category/excel', label: '📗 Excel' },
  { href: '/category/career', label: '💼 Career' },
  { href: '/category/interview-questions', label: '🎯 Interview Q&A' },
  { href: '/category/case-study', label: '📁 Case Study' },
];

export default function Navbar() {
  const [dark, setDark] = useState(false);
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<{ title: string; url: string }[]>([]);
  const [showSuggest, setShowSuggest] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('di_theme') === 'dark';
    setDark(saved);
    document.body.classList.toggle('dark-mode', saved);
  }, []);

  const toggleDark = () => {
    const next = !dark;
    setDark(next);
    localStorage.setItem('di_theme', next ? 'dark' : 'light');
    document.body.classList.toggle('dark-mode', next);
  };

  // LIVE SEARCH - type karte hi suggestions (server pe /api/search)
  const onSearchInput = async (value: string) => {
    setQuery(value);
    const q = value.trim();
    if (q.length < 2) { setSuggestions([]); setShowSuggest(false); return; }
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}&limit=8`);
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
        <Link className="nav-logo" href="/" onClick={() => setMenuOpen(false)}>
          <span className="nav-logo-badge">
            <i className="fas fa-chart-line" />
          </span>
          <span className="nav-logo-text">&lt;DataInsights /&gt;</span>
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
              data-i18n="nav.search"
            />
            <i className="fas fa-search" />
          </form>

          {/* Live suggestions dropdown */}
          {showSuggest && suggestions.length > 0 && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 8px)', left: '50%', transform: 'translateX(-50%)',
              width: 'min(420px, 90vw)', background: 'var(--card-bg)', border: '1px solid var(--border)',
              borderRadius: 16, boxShadow: '0 18px 45px rgba(2,6,23,0.18)', zIndex: 1000, padding: 8, textAlign: 'left',
            }}>
              {suggestions.map((s) => (
                <a
                  key={s.url}
                  href={s.url}
                  style={{ display: 'block', padding: '10px 12px', borderRadius: 10, color: 'var(--text-dark)', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600, transition: 'background 0.15s ease' }}
                  onMouseDown={(e) => e.preventDefault()}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--gradient-soft)'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                >
                  {s.title}
                </a>
              ))}
            </div>
          )}
        </div>

        <ul className={`nav-links${menuOpen ? ' open' : ''}`}>
          <li>
            <Link href="/" onClick={() => setMenuOpen(false)} data-i18n="nav.home">🏠 Home</Link>
          </li>
          {NAV_ITEMS.map((item) => (
            <li key={item.href}>
              <Link href={item.href} onClick={() => setMenuOpen(false)}>{item.label}</Link>
            </li>
          ))}
          <li>
            <Link href="/downloads" onClick={() => setMenuOpen(false)} data-i18n="nav.downloads">📥 Downloads</Link>
          </li>
          <li>
            <a className="nav-portfolio-btn" href="https://jatinanalytics.co.in" target="_blank" rel="noopener" data-i18n="nav.portfolio">
              🚀 My Portfolio
            </a>
          </li>
        </ul>

        <button
          className="cs-navbar-btn"
          onClick={() => window.dispatchEvent(new CustomEvent('open-cheatsheet'))}
          title="Cheat Sheet (Ctrl+Shift+C)"
          data-i18n="nav.cheatsheet"
        >
          <i className="fas fa-code" /> <span>Cheat Sheet</span>
        </button>

        <button
          className="cs-navbar-btn hub-btn-text"
          onClick={() => window.dispatchEvent(new CustomEvent('open-productivity-hub'))}
          style={{ background: 'var(--bg)', color: 'var(--text-dark) !important', border: '1px solid var(--border)' }}
          title="Productivity Hub"
          data-i18n="nav.hub"
        >
          <i className="fas fa-bolt" /> <span>Hub</span>
        </button>

        <button
          className="dark-mode-toggle"
          onClick={toggleDark}
          title="Toggle Dark Mode"
          aria-label="Toggle dark mode"
        >
          <i className={dark ? 'fas fa-sun' : 'fas fa-moon'} />
        </button>

        <button
          className={`nav-toggle${menuOpen ? ' open' : ''}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menu"
          title="Menu"
        >
          <i className={`fas ${menuOpen ? 'fa-xmark' : 'fa-bars'}`} />
        </button>
      </div>
    </nav>
  );
}

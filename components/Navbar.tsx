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

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) window.location.href = '/search?q=' + encodeURIComponent(query.trim());
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link className="nav-logo" href="/">
          {'<DataInsights />'}
        </Link>

        <div className="nav-center">
          <form className="search-box" id="search-box" onSubmit={onSearch}>
            <input
              id="search-input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search posts..."
              type="text"
            />
            <i className="fas fa-search" />
          </form>
        </div>

        <ul className="nav-links">
          <li><Link href="/">🏠 Home</Link></li>
          {NAV_ITEMS.map((item) => (
            <li key={item.href}>
              <Link href={item.href}>{item.label}</Link>
            </li>
          ))}
          <li>
            <a className="nav-portfolio-btn" href="https://jatinanalytics.co.in" target="_blank" rel="noopener">
              🚀 My Portfolio
            </a>
          </li>
        </ul>

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

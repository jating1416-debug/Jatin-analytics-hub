'use client';

import { useEffect, useState } from 'react';

// COMMAND PALETTE (Ctrl+K) - VS Code jaisa quick navigation
type Command = {
  group: string;
  label: string;
  meta?: string;
  run: () => void;
};

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [commands, setCommands] = useState<Command[]>([]);

  useEffect(() => {
    const build = (): Command[] => {
      const cmds: Command[] = [
        { group: 'Actions', label: '📊 Cheat Sheet', meta: 'Quick formulas', run: () => { window.dispatchEvent(new CustomEvent('open-cheatsheet')); setOpen(false); } },
        { group: 'Actions', label: '🎲 Random Article', meta: 'Discover a post', run: () => { window.location.href = '/api/random-article'; } },
        { group: 'Actions', label: '📥 Downloads', meta: 'Cheat sheets & resources', run: () => { window.location.href = '/downloads'; } },
        { group: 'Navigation', label: '🏠 Home', meta: '/', run: () => { window.location.href = '/'; } },
        { group: 'Navigation', label: '🔍 Search', meta: '/search', run: () => { window.location.href = '/search'; } },
        { group: 'Navigation', label: '🛠️ All Tools', meta: '/tools', run: () => { window.location.href = '/tools'; } },
        { group: 'Navigation', label: '👤 Author', meta: '/author', run: () => { window.location.href = '/author'; } },
        { group: 'Categories', label: 'SQL', meta: '/category/sql', run: () => { window.location.href = '/category/sql'; } },
        { group: 'Categories', label: 'Python', meta: '/category/python', run: () => { window.location.href = '/category/python'; } },
        { group: 'Categories', label: 'Power BI', meta: '/category/power-bi', run: () => { window.location.href = '/category/power-bi'; } },
        { group: 'Categories', label: 'Excel', meta: '/category/excel', run: () => { window.location.href = '/category/excel'; } },
        { group: 'Categories', label: 'Interview Q&A', meta: '/category/interview-questions', run: () => { window.location.href = '/category/interview-questions'; } },
        { group: 'Categories', label: 'Case Study', meta: '/category/case-study', run: () => { window.location.href = '/category/case-study'; } },
        { group: 'Tools', label: '🧠 SQL Playground', meta: '257 problems', run: () => { window.location.href = '/tools/sql-playground'; } },
        { group: 'Tools', label: '📄 ATS Scanner', meta: 'Resume check', run: () => { window.location.href = '/tools/ats-scanner'; } },
        { group: 'Tools', label: '📊 DAX Explorer', meta: 'Formulas', run: () => { window.location.href = '/tools/dax-explorer'; } },
        { group: 'Tools', label: '📈 CAGR Calculator', meta: 'Growth rate', run: () => { window.location.href = '/tools/cagr-calculator'; } },
        { group: 'Tools', label: '🔧 JSON Formatter', meta: 'Beautify', run: () => { window.location.href = '/tools/json-formatter'; } },
      ];
      return cmds;
    };

    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((o) => !o);
        if (!open) setCommands(build());
      }
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  if (!open) return null;

  const filtered = commands.filter((c) =>
    !query.trim() || (c.label + ' ' + c.meta + ' ' + c.group).toLowerCase().includes(query.toLowerCase())
  );

  // group by group
  const groups: Record<string, Command[]> = {};
  filtered.forEach((c) => { (groups[c.group] = groups[c.group] || []).push(c); });

  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(2,6,23,0.56)', backdropFilter: 'blur(8px)',
        zIndex: 10001, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '9vh 16px 20px',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
    >
      <div style={{ width: 'min(680px, 100%)', background: 'var(--card-bg)', borderRadius: 18, overflow: 'hidden', boxShadow: '0 28px 90px rgba(0,0,0,0.3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 18px', borderBottom: '1px solid var(--border)' }}>
          <i className="fas fa-search" style={{ color: 'var(--primary)' }} />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or search..."
            style={{ flex: 1, border: 'none', background: 'none', outline: 'none', color: 'var(--text-dark)', fontSize: '0.95rem' }}
          />
          <span style={{ fontSize: '0.7rem', color: 'var(--text-light)' }}>ESC to close</span>
        </div>
        <div style={{ maxHeight: '60vh', overflowY: 'auto', padding: 8 }}>
          {Object.entries(groups).map(([group, cmds]) => (
            <div key={group}>
              <div style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--text-light)', letterSpacing: '0.9px', textTransform: 'uppercase', padding: '10px 12px 6px' }}>
                {group}
              </div>
              {cmds.map((c) => (
                <button
                  key={c.label}
                  onClick={c.run}
                  style={{
                    width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12,
                    padding: '11px 14px', borderRadius: 12, cursor: 'pointer', border: 'none',
                    background: 'transparent', color: 'var(--text-dark)', fontSize: '0.88rem', textAlign: 'left',
                  }}
                >
                  <span><b>{c.label}</b></span>
                  {c.meta && <span style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>{c.meta}</span>}
                </button>
              ))}
            </div>
          ))}
          {filtered.length === 0 && (
            <p style={{ padding: 20, textAlign: 'center', color: 'var(--text-light)' }}>Kuch nahi mila — koi aur keyword try karo.</p>
          )}
        </div>
      </div>
    </div>
  );
}

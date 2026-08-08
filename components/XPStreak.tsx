'use client';

import { useEffect, useState } from 'react';

// XP + STREAK + LEVEL system (localStorage - free, no backend)
// - Post padhne par +10 XP
// - Har din website kholne par streak +1 (daily)
// - Levels: 0=Rookie, 100=Learner, 250=Analyst, 500=Pro, 1000=Master
const LEVELS = [
  { min: 0, name: '🟢 Rookie' },
  { min: 100, name: '🔵 Learner' },
  { min: 250, name: '🟣 Analyst' },
  { min: 500, name: '🟠 Pro' },
  { min: 1000, name: '🔴 Master' },
];

export default function XPStreak() {
  const [xp, setXp] = useState(0);
  const [streak, setStreak] = useState(0);
  const [level, setLevel] = useState(LEVELS[0].name);

  useEffect(() => {
    try {
      const key = 'di_xp';
      const streakKey = 'di_streak';
      const lastVisitKey = 'di_last_visit';

      // XP init
      let currentXp = Number(localStorage.getItem(key) || '0');
      const today = new Date().toDateString();

      // Streak: last visit
      const lastVisit = localStorage.getItem(lastVisitKey);
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      let currentStreak = Number(localStorage.getItem(streakKey) || '0');
      if (lastVisit !== today) {
        if (lastVisit === yesterday) {
          currentStreak += 1; // consecutive
        } else {
          currentStreak = 1; // reset
        }
        localStorage.setItem(streakKey, String(currentStreak));
        localStorage.setItem(lastVisitKey, today);

        // Reading bonus: article page pe +10 XP
        if (document.querySelector('.post-body.entry-content')) {
          currentXp += 10;
          localStorage.setItem(key, String(currentXp));
        }
      }

      const lvl = [...LEVELS].reverse().find((l) => currentXp >= l.min) || LEVELS[0];
      setXp(currentXp);
      setStreak(currentStreak);
      setLevel(lvl.name);
    } catch {}
  }, []);

  return (
    <div className="sidebar-widget" style={{ textAlign: 'center' }}>
      <div className="widget-title"><i className="fas fa-trophy" /> Your Progress</div>
      <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-dark)' }}>{level}</div>
      <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--primary)', margin: '6px 0' }}>⭐ {xp} XP</div>
      <div style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>
        {streak > 0 ? `🔥 ${streak} day${streak > 1 ? 's' : ''} streak!` : 'Aaj kholo — streak shuru karo! 🔥'}
      </div>
      <div style={{ height: 8, background: 'var(--bg)', borderRadius: 4, marginTop: 10, overflow: 'hidden' }}>
        <div
          style={{
            height: 8,
            width: `${Math.min(100, (xp / 1000) * 100)}%`,
            background: 'var(--gradient)',
            borderRadius: 4,
            transition: 'width 0.5s ease',
          }}
        />
      </div>
      <div style={{ fontSize: '0.7rem', color: 'var(--text-light)', marginTop: 6 }}>
        Posts padho +10 XP | Roz aao streak ke liye 🔥
      </div>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';

// ADMIN stat card - count-up animation ke sath
export default function StatCard({
  label,
  value,
  icon,
  grad,
  hint,
}: {
  label: string;
  value: number | string;
  icon: string;
  grad: string;
  hint?: string;
}) {
  const [display, setDisplay] = useState(0);
  const numeric = typeof value === 'number';

  useEffect(() => {
    if (!numeric) { setDisplay(0); return; }
    const target = value as number;
    const dur = 1100;
    const start = performance.now();
    const step = (now: number) => {
      const p = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(target * eased));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [value, numeric]);

  return (
    <div className="admin-stat-card" style={{ background: grad }}>
      <div className="admin-stat-icon"><i className={`fas ${icon}`} /></div>
      <div className="admin-stat-value">
        {numeric ? display.toLocaleString() : value}
      </div>
      <div className="admin-stat-label">{label}</div>
      {hint && <div className="admin-stat-hint">{hint}</div>}
      <div className="admin-stat-shine" />
    </div>
  );
}

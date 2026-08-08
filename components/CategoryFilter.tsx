'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'sql', label: 'SQL' },
  { key: 'python', label: 'Python' },
  { key: 'power-bi', label: 'Power BI' },
  { key: 'excel', label: 'Excel' },
  { key: 'career', label: 'Career' },
  { key: 'interview-questions', label: 'Interview Q&A' },
  { key: 'case-study', label: 'Case Study' },
  { key: 'error', label: 'error' },
];

export default function CategoryFilter({ counts }: { counts?: Record<string, number> }) {
  const router = useRouter();
  const params = useSearchParams();
  const [active, setActive] = useState('all');

  useEffect(() => {
    const cat = params.get('cat');
    if (cat && FILTERS.some((f) => f.key === cat)) setActive(cat);
  }, [params]);

  const onFilter = (key: string) => {
    setActive(key);
    const url = key === 'all' ? '/' : `/?cat=${key}`;
    router.push(url);
  };

  return (
    <div className="filter-tags-wrapper">
      {FILTERS.map((f) => {
        const count = counts ? counts[f.key] ?? 0 : 0;
        const isActive = active === f.key;
        return (
          <button
            key={f.key}
            type="button"
            className={`filter-tag-btn${isActive ? ' active' : ''}`}
            data-filter={f.key}
            onClick={() => onFilter(f.key)}
          >
            {f.label}
            {counts !== undefined && (
              <span
                style={{
                  display: 'inline-block',
                  marginLeft: 6,
                  background: isActive ? 'rgba(255,255,255,0.25)' : 'rgba(102,126,234,0.15)',
                  color: isActive ? '#fff' : 'var(--primary)',
                  borderRadius: 10,
                  padding: '1px 7px',
                  fontSize: '0.68rem',
                  fontWeight: 700,
                }}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

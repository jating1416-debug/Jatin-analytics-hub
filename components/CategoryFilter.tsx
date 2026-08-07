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
  { key: 'interview-questions', label: '🎯 Interview Q&A' },
  { key: 'case-study', label: '📁 Case Study' },
];

export default function CategoryFilter() {
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
      {FILTERS.map((f) => (
        <button
          key={f.key}
          type="button"
          className={`filter-tag-btn${active === f.key ? ' active' : ''}`}
          data-filter={f.key}
          onClick={() => onFilter(f.key)}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
}

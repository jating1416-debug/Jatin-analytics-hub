'use client';

import { useEffect, useState } from 'react';

// FOCUS MODE - distraction-free reading (Medium jaisa)
// Sidebar/TOC/navbar hide -> sirf article clean reader
export default function FocusModeButton() {
  const [on, setOn] = useState(false);

  useEffect(() => {
    document.body.classList.toggle('focus-mode', on);
    return () => document.body.classList.remove('focus-mode');
  }, [on]);

  return (
    <button
      className={`focus-mode-btn${on ? ' active' : ''}`}
      onClick={() => setOn(!on)}
      title={on ? 'Exit Focus Mode' : 'Focus Mode - bina distraction padho'}
    >
      <i className={`fas ${on ? 'fa-compress' : 'fa-expand'}`} /> {on ? 'Exit Focus' : 'Focus'}
    </button>
  );
}

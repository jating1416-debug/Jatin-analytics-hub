'use client';

import { useEffect, useState } from 'react';

// ADMIN SETTINGS - site info, AdSense, sidebar widgets, comments moderation, robots, backup
type Settings = {
  site: { title: string; description: string };
  adsense: { enabled: boolean; client: string; homeSlot: string; articleSlot: string; sidebarSlot: string };
  widgets: Record<string, boolean>;
  comments: { moderation: boolean };
  robotsText: string;
};

const DEFAULT: Settings = {
  site: { title: 'Data Insights', description: '' },
  adsense: { enabled: false, client: '', homeSlot: '', articleSlot: '', sidebarSlot: '' },
  widgets: {
    about: true, hub: true, quote: true, readingList: true, randomSaved: true,
    toolkit: true, toolbox: true, allTools: true, categories: true, recent: true,
    popular: true, telegram: true, portfolio: true,
  },
  comments: { moderation: false },
  robotsText: '',
};

const WIDGET_LABELS: Record<string, string> = {
  about: '👤 About (Jatin)',
  hub: '⚡ Productivity Hub',
  quote: '💬 Quote of the Day',
  readingList: '🔖 Reading List',
  randomSaved: '🎲 Random + Saved',
  toolkit: '📦 Analyst Toolkit',
  toolbox: '🔧 Developer Toolbox',
  allTools: '🛠️ All Tools',
  categories: '🗂️ Categories',
  recent: '🕐 Recent Posts',
  popular: '🔥 Popular Posts',
  telegram: '📨 Telegram',
  portfolio: '🚀 Portfolio CTA',
};

export default function AdminSettings() {
  const [s, setS] = useState<Settings>(DEFAULT);
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [backupLoading, setBackupLoading] = useState(false);

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((d) => { if (d) setS({ ...DEFAULT, ...d }); })
      .catch(() => {});
  }, []);

  const save = async () => {
    setSaving(true);
    setMsg(null);
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(s),
      });
      const d = await res.json();
      if (res.ok) setMsg({ type: 'ok', text: '✅ Settings saved!' });
      else setMsg({ type: 'err', text: d.error || 'Save fail' });
    } catch { setMsg({ type: 'err', text: 'Network error' }); }
    finally { setSaving(false); }
  };

  const exportBackup = async () => {
    setBackupLoading(true);
    try {
      const res = await fetch('/api/export');
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `data-insights-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(a.href);
      setMsg({ type: 'ok', text: '✅ Backup download ho gaya!' });
    } catch { setMsg({ type: 'err', text: 'Backup fail' }); }
    finally { setBackupLoading(false); }
  };

  const inp: React.CSSProperties = {
    width: '100%', padding: '10px 14px', border: '1px solid var(--border)', borderRadius: 10,
    background: 'var(--bg)', color: 'var(--text-dark)', fontSize: '0.88rem', outline: 'none', boxSizing: 'border-box',
  };
  const lbl: React.CSSProperties = { display: 'block', fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-light)', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.4px' };

  return (
    <>
      <div className="admin-page-head">
        <div>
          <h1>⚙️ Settings</h1>
          <p className="admin-page-sub">Site info, AdSense, sidebar widgets, comments, robots — sab yahin se</p>
        </div>
        <button className="admin-cta-btn" onClick={save} disabled={saving} style={{ border: 'none', cursor: 'pointer' }}>
          {saving ? <><i className="fas fa-spinner fa-spin" /> Saving...</> : <><i className="fas fa-save" /> Save Settings</>}
        </button>
      </div>

      {msg && <p className={`admin-msg ${msg.type === 'ok' ? 'ok' : 'err'}`}>{msg.text}</p>}

      <div className="admin-dash-grid">
        {/* SITE INFO */}
        <div className="admin-panel">
          <div className="admin-panel-head"><h2><i className="fas fa-globe" /> Site Info</h2></div>
          <label style={lbl}>Site Title</label>
          <input style={inp} value={s.site.title} onChange={(e) => setS({ ...s, site: { ...s.site, title: e.target.value } })} />
          <div style={{ height: 10 }} />
          <label style={lbl}>Site Description</label>
          <textarea style={{ ...inp, minHeight: 70 }} value={s.site.description} onChange={(e) => setS({ ...s, site: { ...s.site, description: e.target.value } })} />
          <div style={{ fontSize: '0.72rem', color: 'var(--text-light)', marginTop: 6 }}>
            📌 Ye footer aur SEO description mein use hota hai.
          </div>
        </div>

        {/* ADSENSE */}
        <div className="admin-panel">
          <div className="admin-panel-head">
            <h2><i className="fas fa-dollar-sign" /> AdSense (Monetization)</h2>
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, cursor: 'pointer', fontSize: '0.88rem', fontWeight: 700 }}>
            <input type="checkbox" checked={s.adsense.enabled} onChange={(e) => setS({ ...s, adsense: { ...s.adsense, enabled: e.target.checked } })} />
            Ads enable karo (AdSense approval ke baad)
          </label>
          <label style={lbl}>AdSense Client ID</label>
          <input style={inp} value={s.adsense.client} onChange={(e) => setS({ ...s, adsense: { ...s.adsense, client: e.target.value } })} placeholder="ca-pub-XXXXXXXXXXXXXXXX" />
          <div style={{ height: 10 }} />
          <label style={lbl}>Home Page Ad Slot ID</label>
          <input style={inp} value={s.adsense.homeSlot} onChange={(e) => setS({ ...s, adsense: { ...s.adsense, homeSlot: e.target.value } })} placeholder="1234567890" />
          <div style={{ height: 10 }} />
          <label style={lbl}>Article Page Ad Slot ID</label>
          <input style={inp} value={s.adsense.articleSlot} onChange={(e) => setS({ ...s, adsense: { ...s.adsense, articleSlot: e.target.value } })} placeholder="1234567890" />
          <div style={{ height: 10 }} />
          <label style={lbl}>Sidebar Ad Slot ID</label>
          <input style={inp} value={s.adsense.sidebarSlot} onChange={(e) => setS({ ...s, adsense: { ...s.adsense, sidebarSlot: e.target.value } })} placeholder="1234567890" />
          <div style={{ fontSize: '0.72rem', color: 'var(--text-light)', marginTop: 8, lineHeight: 1.6 }}>
            📌 Google AdSense → <b>My ads</b> → naya ad banate waqt <b>slot ID</b> milta hai (numbers).
            Client ID = ca-pub- wala. Sab fill karke Save karo — ads turant dikhne lageinge (async load, site slow nahi hoga).
          </div>
        </div>

        {/* COMMENTS + ROBOTS */}
        <div className="admin-panel">
          <div className="admin-panel-head"><h2><i className="fas fa-comments" /> Comments</h2></div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, cursor: 'pointer', fontSize: '0.88rem', fontWeight: 700 }}>
            <input type="checkbox" checked={s.comments.moderation} onChange={(e) => setS({ ...s, comments: { moderation: e.target.checked } })} />
            Moderation ON (naye comments pehle pending — aap approve karo)
          </label>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-light)', lineHeight: 1.6 }}>
            OFF = comments turant dikhte hain. ON = admin → Comments mein approve karna padega.
          </div>
          <div style={{ height: 16 }} />
          <div className="admin-panel-head"><h2><i className="fas fa-robot" /> Robots.txt Custom</h2></div>
          <textarea style={{ ...inp, minHeight: 90, fontFamily: "'Fira Code', monospace", fontSize: '0.78rem' }} value={s.robotsText} onChange={(e) => setS({ ...s, robotsText: e.target.value })} placeholder="Khali chhodo — default: User-agent: * allow / disallow /admin" />
        </div>

        {/* WIDGET TOGGLES */}
        <div className="admin-panel">
          <div className="admin-panel-head"><h2><i className="fas fa-toggle-on" /> Sidebar Widgets</h2></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
            {Object.keys(WIDGET_LABELS).map((k) => (
              <label key={k} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', padding: '5px 0' }}>
                <input type="checkbox" checked={!!s.widgets[k]} onChange={(e) => setS({ ...s, widgets: { ...s.widgets, [k]: e.target.checked } })} />
                {WIDGET_LABELS[k]}
              </label>
            ))}
          </div>
        </div>

        {/* BACKUP */}
        <div className="admin-panel">
          <div className="admin-panel-head"><h2><i className="fas fa-database" /> Backup & Export</h2></div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-light)', lineHeight: 1.7, marginBottom: 14 }}>
            Saara data (articles, categories, tags, comments, pages, settings) ek JSON file mein
            download karo. Restore ke liye file ko maine bata diya tha — CLI script se ho jaata hai.
          </p>
          <button className="admin-cta-btn" onClick={exportBackup} disabled={backupLoading} style={{ border: 'none', cursor: 'pointer' }}>
            {backupLoading ? <><i className="fas fa-spinner fa-spin" /> Bana rahe hain...</> : <><i className="fas fa-download" /> Download Backup (JSON)</>}
          </button>
        </div>
      </div>
    </>
  );
}

'use client';

import { useEffect, useRef, useState } from 'react';

// ============================================================
// MEDIA PICKER MODAL
// - "Library" tab: /api/media se saari pehle-uploaded images grid mein
// - "Upload" tab: drag-drop ya click-to-browse, seedha /api/upload
// - Image select/upload hote hi onInsert(url) call hota hai aur modal band
// ============================================================

type MediaFile = { name: string; url: string; size: number; created: string };

export default function MediaPicker({
  open,
  onClose,
  onInsert,
}: {
  open: boolean;
  onClose: () => void;
  onInsert: (url: string) => void;
}) {
  const [tab, setTab] = useState<'library' | 'upload'>('library');
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setTab('library');
    setErr('');
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const load = async () => {
    setLoading(true);
    setErr('');
    try {
      const res = await fetch('/api/media');
      const d = await res.json();
      if (d.error) setErr(d.error);
      setFiles(d.files || []);
    } catch {
      setErr('Media library load nahi ho paayi');
    } finally {
      setLoading(false);
    }
  };

  const doUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErr('Sirf image files allowed hain');
      return;
    }
    setUploading(true);
    setErr('');
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: form });
      const data = await res.json();
      if (res.ok && data.url) {
        onInsert(data.url);
        onClose();
      } else {
        setErr(data.error || 'Upload fail ho gaya');
      }
    } catch {
      setErr('Upload error');
    } finally {
      setUploading(false);
    }
  };

  if (!open) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000, padding: 20,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--card-bg, #fff)', borderRadius: 14, width: '100%',
          maxWidth: 720, maxHeight: '80vh', display: 'flex', flexDirection: 'column',
          overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        }}
      >
        {/* HEADER */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => setTab('library')}
              style={{
                padding: '7px 14px', borderRadius: 8, border: '1px solid var(--border)', cursor: 'pointer',
                fontWeight: 700, fontSize: '0.85rem',
                background: tab === 'library' ? 'var(--gradient)' : 'transparent',
                color: tab === 'library' ? '#fff' : 'var(--text-dark)',
              }}
            >
              🖼️ Media Library
            </button>
            <button
              onClick={() => setTab('upload')}
              style={{
                padding: '7px 14px', borderRadius: 8, border: '1px solid var(--border)', cursor: 'pointer',
                fontWeight: 700, fontSize: '0.85rem',
                background: tab === 'upload' ? 'var(--gradient)' : 'transparent',
                color: tab === 'upload' ? '#fff' : 'var(--text-dark)',
              }}
            >
              ⬆️ Upload New
            </button>
          </div>
          <button onClick={onClose} style={{ border: 'none', background: 'transparent', fontSize: '1.3rem', cursor: 'pointer', color: 'var(--text-light)' }}>×</button>
        </div>

        {err && <div style={{ padding: '10px 18px', color: '#ef4444', fontSize: '0.85rem' }}>{err}</div>}

        {/* BODY */}
        <div style={{ padding: 18, overflowY: 'auto', flex: 1 }}>
          {tab === 'library' ? (
            loading ? (
              <p style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>⏳ Loading...</p>
            ) : files.length === 0 ? (
              <p style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>Abhi koi image upload nahi hui. "Upload New" tab se daalo.</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 10 }}>
                {files.map((f) => (
                  <button
                    key={f.name}
                    onClick={() => { onInsert(f.url); onClose(); }}
                    title={f.name}
                    style={{
                      border: '1px solid var(--border)', borderRadius: 10, padding: 0, cursor: 'pointer',
                      overflow: 'hidden', background: 'var(--bg)', aspectRatio: '1/1',
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={f.url} alt={f.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  </button>
                ))}
              </div>
            )
          ) : (
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                const file = e.dataTransfer.files?.[0];
                if (file) doUpload(file);
              }}
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: `2px dashed ${dragOver ? 'var(--primary)' : 'var(--border)'}`,
                borderRadius: 12, padding: '50px 20px', textAlign: 'center', cursor: 'pointer',
                background: dragOver ? 'rgba(102,126,234,0.06)' : 'var(--bg)',
                minHeight: 220, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10,
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => { const f = e.target.files?.[0]; if (f) doUpload(f); }}
              />
              {uploading ? (
                <span style={{ fontSize: '0.95rem', color: 'var(--primary)', fontWeight: 700 }}>⏳ Upload ho raha hai...</span>
              ) : (
                <>
                  <span style={{ fontSize: '2rem' }}>📤</span>
                  <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-dark)' }}>Image yahan drag karo, ya click karke choose karo</span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-light)' }}>JPG, PNG, WEBP, GIF supported</span>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

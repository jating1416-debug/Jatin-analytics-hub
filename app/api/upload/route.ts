import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/auth';

// POST /api/upload  (multipart: file)
// Image ko Supabase Storage mein upload karta hai.
// Env vars: SUPABASE_URL, SUPABASE_SERVICE_KEY, SUPABASE_BUCKET (optional, default "images")
export async function POST(req: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    return NextResponse.json(
      { error: 'SUPABASE_URL / SUPABASE_SERVICE_KEY env vars set nahi hain. (Supabase → Settings → API keys)' },
      { status: 500 }
    );
  }

  try {
    const form = await req.formData();
    const file = form.get('file') as File | null;
    if (!file) return NextResponse.json({ error: 'File nahi mili' }, { status: 400 });

    const bytes = Buffer.from(await file.arrayBuffer());
    const ext = (file.name.split('.').pop() || 'png').toLowerCase().replace(/[^a-z0-9]/g, '');
    const safeExt = ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext) ? ext : 'png';
    const name = 'img_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8) + '.' + safeExt;
    const bucket = process.env.SUPABASE_BUCKET || 'images';

    const res = await fetch(`${SUPABASE_URL}/storage/v1/object/${bucket}/${name}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': file.type || 'image/png',
        'x-upsert': 'false',
      },
      body: bytes,
    });

    if (!res.ok) {
      const txt = await res.text().catch(() => '');
      // bucket nahi bana to try create
      if (res.status === 404 || txt.includes('bucket')) {
        await fetch(`${SUPABASE_URL}/storage/v1/bucket`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id: bucket, name: bucket, public: true }),
        }).catch(() => {});
        return NextResponse.json({ error: 'Bucket create karna padega — dobara upload try karo (Supabase → Storage → New bucket: ' + bucket + ', public)' }, { status: 500 });
      }
      return NextResponse.json({ error: 'Upload fail: ' + txt.slice(0, 150) }, { status: 500 });
    }

    // public URL
    const url = `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${name}`;
    return NextResponse.json({ url });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Upload error' }, { status: 500 });
  }
}

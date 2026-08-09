import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/auth';

// GET /api/media - Supabase Storage se images list (admin)
// DELETE /api/media?name=xyz.png - image delete (admin)
// Upload /api/upload se hota hai (pehle se hai)
export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
  const bucket = process.env.SUPABASE_BUCKET || 'images';
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    return NextResponse.json({ error: 'SUPABASE_URL / SUPABASE_SERVICE_KEY env vars set nahi hain' }, { status: 500 });
  }
  try {
    const res = await fetch(`${SUPABASE_URL}/storage/v1/object/list/${bucket}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prefix: '', limit: 200, offset: 0, sortBy: { column: 'created_at', order: 'desc' } }),
    });
    if (!res.ok) {
      const txt = await res.text();
      // bucket nahi bani? clear error
      if (res.status === 404) {
        return NextResponse.json({ error: `Bucket "${bucket}" nahi mila — Supabase → Storage → public bucket "${bucket}" banao`, files: [] });
      }
      return NextResponse.json({ error: 'Storage list fail: ' + txt.slice(0, 120), files: [] }, { status: 500 });
    }
    const data = await res.json();
    const files = (Array.isArray(data) ? data : [])
      .filter((f: any) => f && !f.id?.startsWith?.('folder') && !f.metadata?.mimetype?.startsWith?.('application/octet'))
      .map((f: any) => ({
        name: f.name,
        url: `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${f.name}`,
        size: f.metadata?.size || 0,
        created: f.created_at || '',
      }));
    return NextResponse.json({ files });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Error', files: [] }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const name = req.nextUrl.searchParams.get('name');
  if (!name) return NextResponse.json({ error: 'name chahiye' }, { status: 400 });
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
  const bucket = process.env.SUPABASE_BUCKET || 'images';
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    return NextResponse.json({ error: 'Env vars nahi' }, { status: 500 });
  }
  try {
    const res = await fetch(`${SUPABASE_URL}/storage/v1/object/${bucket}/${name}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${SUPABASE_SERVICE_KEY}` },
    });
    if (!res.ok) return NextResponse.json({ error: 'Delete fail' }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Delete error' }, { status: 500 });
  }
}

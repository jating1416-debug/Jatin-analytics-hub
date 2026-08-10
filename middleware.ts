import { NextRequest, NextResponse } from 'next/server';

// ============================================================
// 301 REDIRECT SYSTEM (Edge middleware - FAST, free)
// - Redirects admin panel (/admin/redirects) se manage hote hain
// - DB (Setting) mein saved -> /api/redirects se cached list
// - Har request pe check (60s in-memory cache - koi slow nahi)
// - Match milne pe 301 Permanent redirect
// - Admin/API/assets ko skip (kabhi redirect nahi honge)
// ============================================================

let cache: { list: [string, string][]; at: number } | null = null;

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // skip internal/admin/static
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/icon') ||
    pathname.includes('.') // files (robots.txt, sitemap.xml, images...)
  ) {
    return NextResponse.next();
  }

  // redirect list - 60s in-memory cache (serverless instance ke andar)
  if (!cache || Date.now() - cache.at > 60 * 1000) {
    try {
      const res = await fetch(`${req.nextUrl.origin}/api/redirects`, {
        next: { revalidate: 60 },
      });
      const data = await res.json();
      cache = {
        list: Array.isArray(data?.redirects)
          ? data.redirects
              .filter((r: any) => r && r.enabled !== false && r.from && r.to)
              .map((r: any) => [r.from.replace(/\/+$/, ''), r.to])
          : [],
        at: Date.now(),
      };
    } catch (e) {
      console.error('redirects fetch error:', e);
      cache = { list: cache?.list || [], at: Date.now() };
    }
  }

  // exact match (trailing slash ignore karke)
  const clean = pathname.replace(/\/+$/, '');
  const match = cache.list.find(([from]) => from === clean);
  if (match) {
    return NextResponse.redirect(new URL(match[1], req.nextUrl.origin), 301);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};

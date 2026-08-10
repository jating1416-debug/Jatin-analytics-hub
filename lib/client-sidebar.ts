// CLIENT-SIDE SHARED SIDEBAR FETCH
// Hero, SidebarClient, CategoryTiles sab /api/sidebar use karte hain
// Ye module EK hi fetch promise share karta hai -> 1 request, sabko data
// 12s timeout: API slow/hang ho to UI kabhi nahi atkega (null -> fallback UI)
let cached: Promise<any> | null = null;

export function getSidebar() {
  if (!cached) {
    cached = fetch('/api/sidebar', { signal: AbortSignal.timeout(12000) })
      .then((r) => r.json())
      .catch(() => null);
  }
  return cached;
}

export function clearSidebarCache() {
  cached = null;
}

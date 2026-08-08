// CLIENT-SIDE SHARED SIDEBAR FETCH
// Hero, SidebarClient, CategoryTiles sab /api/sidebar use karte hain
// Ye module EK hi fetch promise share karta hai -> 1 request, sabko data
let cached: Promise<any> | null = null;

export function getSidebar() {
  if (!cached) {
    cached = fetch('/api/sidebar')
      .then((r) => r.json())
      .catch(() => null);
  }
  return cached;
}

export function clearSidebarCache() {
  cached = null;
}

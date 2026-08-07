# 🚀 Jatin Analytics Hub — Custom CMS

**Next.js 15 + TypeScript + PostgreSQL (Supabase) + Prisma** — Data Analytics education platform.
Design: 100% same as the Blogger theme (ported CSS).

## 📁 Structure
```
app/
  page.tsx               → Homepage (hero + latest + filter + sidebar)
  category/[slug]/       → /category/sql etc.
  [category]/[slug]/     → /sql/inner-join (article page)
  search/                → /search?q=
  sitemap.ts / robots.ts → SEO
  admin/                 → (Phase 2 - admin panel)
components/              → Navbar, Footer, Hero, ArticleCard, Sidebar, TOC...
lib/                     → prisma, auth, utils
prisma/schema.prisma     → Database schema
scripts/import-feed.ts   → feed.atom se posts import
```

## 🚀 Setup (Vercel + Supabase — ₹0)

1. **Supabase:** supabase.com → New Project → Project Settings → Database → copy `DATABASE_URL`
2. **Env:** `.env.example` ko `.env` banao, values daalo (`DATABASE_URL`, `ADMIN_PASSWORD`)
3. **Install:**
```bash
npm install
npx prisma db push        # tables banao
npx prisma generate
```
4. **Import posts:**
```bash
cp feed.atom .            # apni feed.atom file root mein
npm run import:feed
```
5. **Run locally:**
```bash
npm run dev
```
6. **Deploy (Vercel):**
- GitHub repo banao → push karo
- Vercel → New Project → repo select
- Env vars daalo (DATABASE_URL, ADMIN_PASSWORD, NEXT_PUBLIC_SITE_URL)
- Domain: `blog.jatinanalytics.co.in` connect karo (Vercel → Settings → Domains)

## 🗄️ Post kaise daaloge (admin panel ke bina bhi):
Abhi admin panel Phase 2 mein hai — beech mein posts daalne ke liye:
- **Option 1:** `feed.atom` update karo + `npm run import:feed` (blogger se sync)
- **Option 2:** Admin panel banne tak — Supabase Table Editor mein seedha insert (content HTML mein)

## ⚠️ Important
- Har post ka content **HTML** hai (Blogger jaisa — `[tip]`, `[note]`, `[quiz]` shortcodes ka processing Phase 2 mein JS se)
- 1000+ posts ke liye pagination + sitemap already ready hai
- Two Vercel projects: ye project = `blog.jatinanalytics.co.in` | portfolio wala alag

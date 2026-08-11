/**
 * RESTORE SCRIPT - deleted posts wapas lao (posts.json se)
 * - Sirf MISSING posts create karta hai (existing ko touch nahi)
 * - "Data Analytics" (misc) category wapas banata hai
 * - Garbage slugs (images/image) SKIP
 */
import { prisma } from '../lib/prisma';
import { slugify, readingTime, excerptFrom } from '../lib/utils';
import * as fs from 'fs';

const GARBAGE = new Set(['images', 'image']);

async function main() {
  const data = JSON.parse(fs.readFileSync('/home/user/jatin-analytics-hub/posts.json', 'utf8'));

  // 1) misc category wapas banao (agar nahi hai)
  let misc = await prisma.category.findUnique({ where: { slug: 'misc' } });
  if (!misc) {
    misc = await prisma.category.create({
      data: { name: 'Data Analytics', slug: 'misc', description: 'General data analytics posts' },
    });
    console.log('✅ Category "Data Analytics" (misc) wapas ban gayi (id:', misc.id, ')');
  } else {
    console.log('ℹ️ Category misc already hai:', misc.id);
  }

  // 2) admin user dhoondo
  const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
  if (!admin) { console.error('❌ Admin user nahi mila'); process.exit(1); }

  // 3) DB ke current slugs
  const db = await prisma.article.findMany({ select: { slug: true } });
  const dbSlugs = new Set(db.map((a) => a.slug));

  // 4) missing posts restore karo
  let restored = 0, skipped = 0;
  for (const post of data) {
    const slug = post.slug;
    if (!slug || GARBAGE.has(slug)) { skipped++; continue; }
    if (dbSlugs.has(slug)) { skipped++; continue; } // already hai - mat chhedo
    const title = String(post.title || '').trim();
    const content = String(post.content || '').trim();
    if (!title || !content) { skipped++; continue; }

    // category resolve (import-json jaisa, par missing hi chahiye)
    const labels: string[] = Array.isArray(post.labels) ? post.labels.map(String) : [];
    let catSlug = 'misc';
    const rules: [string, (l: string) => boolean][] = [
      ['interview-questions', (l) => l.includes('interview')],
      ['case-study', (l) => l.includes('case')],
      ['career', (l) => l.includes('career') || l.includes('resume') || l.includes('job')],
      ['sql', (l) => l === 'sql' || l === 'mysql' || l.includes('sql')],
      ['power-bi', (l) => l.includes('power') || l.includes('dax')],
      ['python', (l) => l.includes('python') || l.includes('pandas') || l.includes('numpy') || l.includes('matplotlib') || l.includes('seaborn') || l.includes('eda') || l.includes('data cleaning')],
      ['excel', (l) => l.includes('excel') || l.includes('lookup') || l.includes('pivot')],
    ];
    for (const [slug2, match] of rules) {
      if (labels.some((l) => match(l.toLowerCase()))) { catSlug = slug2; break; }
    }
    let cat = await prisma.category.findUnique({ where: { slug: catSlug } });
    if (!cat) {
      const names: Record<string, string> = { sql: 'SQL', python: 'Python', 'power-bi': 'Power BI', excel: 'Excel', career: 'Career', 'interview-questions': 'Interview Q&A', 'case-study': 'Case Study', misc: 'Data Analytics' };
      cat = await prisma.category.create({ data: { name: names[catSlug] || catSlug, slug: catSlug } });
    }

    let publishedAt = new Date();
    if (post.publishedAt) { const d = new Date(post.publishedAt); if (!isNaN(d.getTime())) publishedAt = d; }

    await prisma.article.create({
      data: {
        title: title.slice(0, 300),
        slug,
        excerpt: excerptFrom(content, 220),
        content,
        contentType: 'TUTORIAL',
        readingTime: readingTime(content),
        categoryId: cat.id,
        authorId: admin.id,
        status: 'PUBLISHED',
        publishedAt,
        createdAt: publishedAt,
      },
    });
    restored++;
    console.log(`✅ Restored: ${title.slice(0, 50)} [${catSlug}]`);
  }

  console.log(`\n🎉 Done! Restored: ${restored} | Skipped: ${skipped}`);
  const now = await prisma.article.count();
  console.log('Articles ab:', now);
}
main().catch((e) => { console.error('❌', e.message); process.exit(1); }).finally(() => process.exit(0));

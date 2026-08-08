/**
 * FEED.ATOM IMPORTER (improved - Blogger feed structure ke liye)
 * 
 * USE:
 *   1. feed.atom ko project root mein daalo (Blogger Export/Feed wali file)
 *   2. npm run db:generate   (pehli baar)
 *   3. npm run import:feed
 *
 * KYA KARTA HAI:
 *   - feed.atom parse karke 95+ posts nikalta hai (title, HTML content, labels, date)
 *   - Categories auto-create (sql, python, power-bi, excel, career, interview-questions, case-study, misc)
 *   - Labels ko smart specificity ke saath categories mein map karta hai
 *   - Duplicate slug pe skip (dobara chalao safe)
 */
import { XMLParser } from 'fast-xml-parser';
import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import { slugify, readingTime, excerptFrom } from '../lib/utils';

const prisma = new PrismaClient();

// Blogger label -> category slug (specificity order matters)
const CATEGORY_RULES: { slug: string; match: (label: string) => boolean }[] = [
  { slug: 'interview-questions', match: (l) => l.includes('interview') },
  { slug: 'case-study', match: (l) => l.includes('case') },
  { slug: 'career', match: (l) => l.includes('career') || l.includes('resume') || l.includes('job') },
  { slug: 'sql', match: (l) => l === 'sql' || l === 'mysql' || l.includes('sql') },
  { slug: 'power-bi', match: (l) => l.includes('power') || l.includes('dax') },
  { slug: 'python', match: (l) => l.includes('python') || l.includes('pandas') || l.includes('numpy') || l.includes('matplotlib') || l.includes('seaborn') || l.includes('eda') || l.includes('data cleaning') },
  { slug: 'excel', match: (l) => l.includes('excel') || l.includes('lookup') || l.includes('pivot') },
  { slug: 'misc', match: () => true }, // fallback: Data analyst, beginners, etc.
];

function resolveCategory(labels: string[]): string {
  for (const rule of CATEGORY_RULES) {
    for (const label of labels) {
      if (rule.match(label.toLowerCase())) return rule.slug;
    }
  }
  return 'misc';
}

async function main() {
  const file = path.join(process.cwd(), 'feed.atom');
  if (!fs.existsSync(file)) {
    console.error('❌ feed.atom file nahi mili — project root mein daalo');
    process.exit(1);
  }

  // Safety: invalid control chars hatao + raw & fix (file clean ho to koi asar nahi)
  let xml = fs.readFileSync(file, 'utf8');
  xml = xml.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '');
  xml = xml.replace(/&(?!(?:amp|lt|gt|quot|apos|#\d+|#x[0-9a-fA-F]+);)/g, '&amp;');

  const parser = new XMLParser({ ignoreAttributes: false });
  const data = parser.parse(xml);

  const feed = data.feed || {};
  const entries: any[] = Array.isArray(feed.entry) ? feed.entry : feed.entry ? [feed.entry] : [];
  console.log(`📄 feed.atom mein entries: ${entries.length}`);

  // 1. Categories
  const catSlugs = ['sql', 'python', 'power-bi', 'excel', 'career', 'interview-questions', 'case-study', 'misc'];
  const catNames: Record<string, string> = {
    sql: 'SQL', python: 'Python', 'power-bi': 'Power BI', excel: 'Excel',
    career: 'Career', 'interview-questions': 'Interview Q&A', 'case-study': 'Case Study', misc: 'Data Analytics',
  };
  const categories: Record<string, number> = {};
  for (const slug of catSlugs) {
    const cat = await prisma.category.upsert({
      where: { slug },
      update: {},
      create: { name: catNames[slug], slug },
    });
    categories[slug] = cat.id;
  }
  console.log('✅ Categories ready');

  // 2. Admin user
  let admin = await prisma.user.findUnique({ where: { email: 'admin@jatinanalytics.co.in' } });
  if (!admin) {
    admin = await prisma.user.create({
      data: {
        name: 'Jatin Kumar',
        email: 'admin@jatinanalytics.co.in',
        password: 'managed-by-admin-panel',
        role: 'ADMIN',
      },
    });
    console.log('✅ Admin user created');
  }

  // 3. Articles
  let imported = 0;
  let skipped = 0;
  for (const entry of entries) {
    // title - string ya object ho sakta hai
    const title = typeof entry.title === 'string' ? entry.title : entry.title?.['#text'] || 'Untitled';
    if (!title.trim()) { skipped++; continue; }

    // content - HTML (#text) ho sakta hai ya direct string
    let htmlContent = '';
    if (typeof entry.content === 'string') htmlContent = entry.content;
    else if (entry.content && typeof entry.content['#text'] === 'string') htmlContent = entry.content['#text'];
    else if (entry.summary) htmlContent = typeof entry.summary === 'string' ? entry.summary : entry.summary['#text'] || '';
    if (!htmlContent.trim()) { skipped++; continue; }

    let slug = slugify(title);
    if (!slug) { console.warn(`⚠️ Skip (no slug): ${title.slice(0, 50)}`); skipped++; continue; }

    // labels - array of {@_term} objects
    const rawCat = entry.category;
    const labels: string[] = Array.isArray(rawCat)
      ? rawCat.map((c: any) => (typeof c === 'string' ? c : c['@_term'] || c.term || '')).filter(Boolean)
      : rawCat && typeof rawCat === 'object'
        ? [(rawCat['@_term'] || rawCat.term || '')].filter(Boolean)
        : typeof rawCat === 'string' ? [rawCat] : [];

    const catSlug = resolveCategory(labels);

    // published date
    const publishedRaw = entry.published || entry.updated || entry['blogger:created'] || null;
    let publishedAt = new Date();
    if (publishedRaw) {
      const d = new Date(String(publishedRaw));
      if (!isNaN(d.getTime())) publishedAt = d;
    }

    // duplicate check
    const existing = await prisma.article.findUnique({ where: { slug } });
    if (existing) {
      console.log(`⏭️ Skip (already exists): ${title.slice(0, 50)}`);
      skipped++;
      continue;
    }

    await prisma.article.create({
      data: {
        title: String(title).slice(0, 300),
        slug,
        excerpt: excerptFrom(htmlContent, 220),
        content: htmlContent,
        contentType: 'TUTORIAL',
        readingTime: readingTime(htmlContent),
        categoryId: categories[catSlug],
        authorId: admin.id,
        status: 'PUBLISHED',
        publishedAt,
        createdAt: publishedAt,
      },
    });
    imported++;
    if (imported % 10 === 0 || imported <= 5) {
      console.log(`✅ Imported ${imported}/${entries.length}: ${String(title).slice(0, 55)} [${catSlug}]`);
    }
  }

  console.log(`\n🎉 Done! Imported: ${imported} | Skipped: ${skipped}`);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error('❌ Import error:', e.message);
  process.exit(1);
});

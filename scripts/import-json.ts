/**
 * JSON IMPORT — 100% bulletproof (koi XML parsing nahi)
 *
 * USE:
 *   1. posts.json ko project root mein daalo (main de dunga)
 *   2. npm run import:json
 */
import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import { slugify, readingTime, excerptFrom } from '../lib/utils';

const prisma = new PrismaClient();

const CATEGORY_RULES: { slug: string; match: (l: string) => boolean }[] = [
  { slug: 'interview-questions', match: (l) => l.includes('interview') },
  { slug: 'case-study', match: (l) => l.includes('case') },
  { slug: 'career', match: (l) => l.includes('career') || l.includes('resume') || l.includes('job') },
  { slug: 'sql', match: (l) => l === 'sql' || l === 'mysql' || l.includes('sql') },
  { slug: 'power-bi', match: (l) => l.includes('power') || l.includes('dax') },
  { slug: 'python', match: (l) => l.includes('python') || l.includes('pandas') || l.includes('numpy') || l.includes('matplotlib') || l.includes('seaborn') || l.includes('eda') || l.includes('data cleaning') },
  { slug: 'excel', match: (l) => l.includes('excel') || l.includes('lookup') || l.includes('pivot') },
  { slug: 'misc', match: () => true },
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
  const file = path.join(process.cwd(), 'posts.json');
  if (!fs.existsSync(file)) {
    console.error('❌ posts.json nahi mili — project root mein daalo');
    process.exit(1);
  }

  const posts = JSON.parse(fs.readFileSync(file, 'utf8'));
  console.log(`📄 posts.json mein posts: ${posts.length}`);

  // Categories
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

  // Admin
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

  let imported = 0, skipped = 0;
  for (const post of posts) {
    const title = String(post.title || '').trim();
    const content = String(post.content || '').trim();
    if (!title || !content) { skipped++; continue; }
    const slug = post.slug || slugify(title);
    if (!slug) { skipped++; continue; }

    const labels: string[] = Array.isArray(post.labels) ? post.labels.map(String) : [];
    const catSlug = resolveCategory(labels);

    let publishedAt = new Date();
    if (post.publishedAt) {
      const d = new Date(post.publishedAt);
      if (!isNaN(d.getTime())) publishedAt = d;
    }

    const existing = await prisma.article.findUnique({ where: { slug } });
    if (existing) {
      console.log(`⏭️ Skip (exists): ${title.slice(0, 50)}`);
      skipped++;
      continue;
    }

    await prisma.article.create({
      data: {
        title: title.slice(0, 300),
        slug,
        excerpt: excerptFrom(content, 220),
        content,
        contentType: 'TUTORIAL',
        readingTime: readingTime(content),
        categoryId: categories[catSlug],
        authorId: admin.id,
        status: 'PUBLISHED',
        publishedAt,
        createdAt: publishedAt,
      },
    });
    imported++;
    if (imported % 10 === 0 || imported <= 5) {
      console.log(`✅ Imported ${imported}/${posts.length}: ${title.slice(0, 55)} [${catSlug}]`);
    }
  }

  console.log(`\n🎉 Done! Imported: ${imported} | Skipped: ${skipped}`);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error('❌ Import error:', e.message);
  process.exit(1);
});

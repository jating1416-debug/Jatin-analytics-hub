import type { Article, Category, User } from '@prisma/client';

export type ArticleWithCategory = Article & {
  category: Category | null;
  author?: Pick<User, 'name'> | null;
};

export type CategoryWithCount = Category & { _count: { articles: number } };

import "server-only";

import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

export interface ListCategoriesFilters {
  search?: string;
  active?: boolean;
}

export async function listCategories(filters: ListCategoriesFilters = {}) {
  const where: Prisma.CategoryWhereInput = {};

  if (typeof filters.active === "boolean") where.active = filters.active;
  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search, mode: "insensitive" } },
      { description: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  return prisma.category.findMany({
    where,
    select: {
      id: true,
      name: true,
      description: true,
      active: true,
      _count: { select: { users: true, trainingSessions: true } },
    },
    orderBy: [{ active: "desc" }, { name: "asc" }],
  });
}

export type CategoryListItem = Awaited<
  ReturnType<typeof listCategories>
>[number];

export async function getCategoryById(id: string) {
  return prisma.category.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      description: true,
      active: true,
    },
  });
}

export type CategoryDetail = NonNullable<
  Awaited<ReturnType<typeof getCategoryById>>
>;

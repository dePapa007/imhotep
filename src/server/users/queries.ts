import "server-only";

import type { Prisma, Role } from "@prisma/client";

import { prisma } from "@/lib/prisma";

export interface ListUsersFilters {
  search?: string;
  role?: Role;
  active?: boolean;
}

export async function listUsers(filters: ListUsersFilters = {}) {
  const where: Prisma.UserWhereInput = {};

  if (filters.role) where.role = filters.role;
  if (typeof filters.active === "boolean") where.active = filters.active;
  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search, mode: "insensitive" } },
      { email: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  return prisma.user.findMany({
    where,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      active: true,
      category: { select: { id: true, name: true } },
    },
    orderBy: [{ active: "desc" }, { name: "asc" }],
  });
}

export type UserListItem = Awaited<ReturnType<typeof listUsers>>[number];

export async function getUserById(id: string) {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      active: true,
      categoryId: true,
      category: { select: { id: true, name: true } },
      createdAt: true,
      _count: { select: { registrations: true } },
    },
  });
}

export type UserDetail = NonNullable<Awaited<ReturnType<typeof getUserById>>>;

export async function listCategories() {
  return prisma.category.findMany({
    where: { active: true },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
}

export type CategoryOption = Awaited<ReturnType<typeof listCategories>>[number];

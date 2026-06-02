"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import {
  createCategorySchema,
  updateCategorySchema,
  type CategoryFormState,
} from "@/lib/validators/category";
import { requireRole } from "@/server/auth/dal";

async function nameTaken(name: string, excludeId?: string) {
  const existing = await prisma.category.findFirst({
    where: {
      name: { equals: name, mode: "insensitive" },
      ...(excludeId ? { id: { not: excludeId } } : {}),
    },
    select: { id: true },
  });
  return Boolean(existing);
}

export async function createCategory(
  _prevState: CategoryFormState,
  formData: FormData,
): Promise<CategoryFormState> {
  await requireRole("ADMIN");

  const parsed = createCategorySchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
  });

  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  const { name, description } = parsed.data;

  if (await nameTaken(name)) {
    return { fieldErrors: { name: ["A category with this name already exists"] } };
  }

  await prisma.category.create({ data: { name, description } });

  revalidatePath("/admin/categories");
  redirect("/admin/categories");
}

export async function updateCategory(
  id: string,
  _prevState: CategoryFormState,
  formData: FormData,
): Promise<CategoryFormState> {
  await requireRole("ADMIN");

  const parsed = updateCategorySchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    active: formData.get("active"),
  });

  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  const { name, description, active } = parsed.data;

  if (await nameTaken(name, id)) {
    return { fieldErrors: { name: ["A category with this name already exists"] } };
  }

  await prisma.category.update({
    where: { id },
    data: { name, description, active },
  });

  revalidatePath("/admin/categories");
  revalidatePath(`/admin/categories/${id}/edit`);
  redirect("/admin/categories");
}

export async function toggleCategoryActive(id: string): Promise<void> {
  await requireRole("ADMIN");

  const category = await prisma.category.findUnique({
    where: { id },
    select: { id: true, active: true },
  });
  if (!category) return;

  await prisma.category.update({
    where: { id },
    data: { active: !category.active },
  });

  revalidatePath("/admin/categories");
}

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { hashPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";
import {
  createUserSchema,
  updateUserSchema,
  type UserFormState,
} from "@/lib/validators/user";
import { requireRole } from "@/server/auth/dal";
import { notifyUserWelcome } from "@/server/notifications/dispatch";

export async function createUser(
  _prevState: UserFormState,
  formData: FormData,
): Promise<UserFormState> {
  await requireRole("ADMIN");

  const parsed = createUserSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    role: formData.get("role"),
    categoryId: formData.get("categoryId"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  const { name, email, role, categoryId, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { fieldErrors: { email: ["A user with this email already exists"] } };
  }

  const created = await prisma.user.create({
    data: {
      name,
      email,
      role,
      categoryId,
      passwordHash: await hashPassword(password),
    },
    select: { id: true },
  });

  notifyUserWelcome({
    userId: created.id,
    name,
    email,
    role,
    password,
  });

  revalidatePath("/admin/users");
  revalidatePath("/admin/trainers");
  redirect(`/admin/users/${created.id}`);
}

export async function updateUser(
  id: string,
  _prevState: UserFormState,
  formData: FormData,
): Promise<UserFormState> {
  const admin = await requireRole("ADMIN");

  const parsed = updateUserSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    role: formData.get("role"),
    categoryId: formData.get("categoryId"),
    active: formData.get("active"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  const { name, email, role, categoryId, active, password } = parsed.data;

  // Prevent admins from locking themselves out.
  if (id === admin.id && (!active || role !== "ADMIN")) {
    return {
      error:
        "You cannot deactivate or change the role of your own account.",
    };
  }

  const emailOwner = await prisma.user.findUnique({ where: { email } });
  if (emailOwner && emailOwner.id !== id) {
    return { fieldErrors: { email: ["A user with this email already exists"] } };
  }

  await prisma.user.update({
    where: { id },
    data: {
      name,
      email,
      role,
      categoryId,
      active,
      ...(password ? { passwordHash: await hashPassword(password) } : {}),
    },
  });

  revalidatePath("/admin/users");
  revalidatePath("/admin/trainers");
  revalidatePath(`/admin/users/${id}`);
  redirect(`/admin/users/${id}`);
}

export async function toggleUserActive(id: string): Promise<void> {
  const admin = await requireRole("ADMIN");

  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, active: true },
  });
  if (!user) return;

  // An admin cannot deactivate their own account.
  if (user.id === admin.id && user.active) return;

  await prisma.user.update({
    where: { id },
    data: { active: !user.active },
  });

  revalidatePath("/admin/users");
  revalidatePath("/admin/trainers");
  revalidatePath(`/admin/users/${id}`);
}

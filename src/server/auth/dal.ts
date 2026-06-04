import "server-only";

import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { Locale, Role } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { roleHome } from "@/lib/roles";
import { decrypt, SESSION_COOKIE, type SessionPayload } from "@/lib/session";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  preferredLocale: Locale;
  active: boolean;
  categoryId: string | null;
}

/** Read and verify the session token from the cookie (no DB access). */
export const getSession = cache(async (): Promise<SessionPayload | null> => {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  return decrypt(token);
});

/**
 * Securely resolve the current user from the database. Returns null when there
 * is no valid session or the account is missing/inactive.
 */
export const getCurrentUser = cache(async (): Promise<SessionUser | null> => {
  const session = await getSession();
  if (!session) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      preferredLocale: true,
      active: true,
      categoryId: true,
    },
  });

  if (!user || !user.active) return null;
  return user;
});

/** Require an authenticated, active user or redirect to login. */
export async function requireUser(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

/** Require a specific role or redirect the user to their own dashboard. */
export async function requireRole(role: Role): Promise<SessionUser> {
  const user = await requireUser();
  if (user.role !== role) redirect(roleHome(user.role));
  return user;
}

"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";
import { roleHome } from "@/lib/roles";
import { createSession, deleteSession } from "@/lib/session";

const loginSchema = z.object({
  email: z.string().trim().min(1, "Email is required"),
  password: z.string().min(1, "Password is required"),
});

export interface LoginState {
  error?: string;
  fieldErrors?: {
    email?: string[];
    password?: string[];
  };
}

export async function login(
  _prevState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
    select: {
      id: true,
      role: true,
      active: true,
      passwordHash: true,
    },
  });

  // Generic message avoids leaking which accounts exist.
  const invalid: LoginState = { error: "Invalid email or password." };

  if (!user || !user.passwordHash) return invalid;
  if (!user.active) {
    return { error: "This account is inactive. Contact an administrator." };
  }

  const passwordValid = await verifyPassword(password, user.passwordHash);
  if (!passwordValid) return invalid;

  await createSession({ userId: user.id, role: user.role });
  redirect(roleHome(user.role));
}

export async function logout(): Promise<void> {
  await deleteSession();
  redirect("/login");
}

"use server";

import { revalidatePath } from "next/cache";

import { setLocaleCookie } from "@/i18n/resolve-locale";
import { updateLocaleSchema } from "@/lib/validators/profile";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/server/auth/dal";

export interface ProfileActionResult {
  error?: string;
  success?: boolean;
}

export async function updatePreferredLocale(
  _prev: ProfileActionResult,
  formData: FormData,
): Promise<ProfileActionResult> {
  void _prev;
  const user = await requireUser();

  const parsed = updateLocaleSchema.safeParse({
    locale: formData.get("locale"),
  });
  if (!parsed.success) {
    return { error: "invalid" };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { preferredLocale: parsed.data.locale },
  });

  await setLocaleCookie(parsed.data.locale);

  revalidatePath("/", "layout");
  revalidatePath("/admin", "layout");
  revalidatePath("/trainer", "layout");
  revalidatePath("/user", "layout");

  return { success: true };
}

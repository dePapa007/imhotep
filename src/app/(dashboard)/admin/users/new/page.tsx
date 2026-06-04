import type { Metadata } from "next";

import { UserForm } from "@/components/admin/user-form";
import { PageHeading } from "@/components/layout/page-heading";
import { createTranslator } from "@/i18n/get-messages";
import { requireRole } from "@/server/auth/dal";
import { createUser } from "@/server/users/actions";
import { listCategories } from "@/server/users/queries";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const user = await requireRole("ADMIN");
  const t = createTranslator(user.preferredLocale);
  return { title: t("admin.newUser") };
}

export default async function NewUserPage() {
  const user = await requireRole("ADMIN");
  const t = createTranslator(user.preferredLocale);
  const categories = await listCategories();

  return (
    <div>
      <PageHeading
        title={t("admin.newUser")}
        description={t("admin.newUserDescription")}
      />
      <UserForm action={createUser} categories={categories} mode="create" />
    </div>
  );
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { UserForm } from "@/components/admin/user-form";
import { PageHeading } from "@/components/layout/page-heading";
import { createTranslator } from "@/i18n/get-messages";
import { requireRole } from "@/server/auth/dal";
import { updateUser } from "@/server/users/actions";
import { getUserById, listCategories } from "@/server/users/queries";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata(): Promise<Metadata> {
  const admin = await requireRole("ADMIN");
  const t = createTranslator(admin.preferredLocale);
  return { title: t("admin.editUser") };
}

export default async function EditUserPage({ params }: PageProps) {
  const admin = await requireRole("ADMIN");
  const t = createTranslator(admin.preferredLocale);
  const { id } = await params;

  const [user, categories] = await Promise.all([
    getUserById(id),
    listCategories(),
  ]);

  if (!user) notFound();

  const updateUserWithId = updateUser.bind(null, user.id);

  return (
    <div>
      <PageHeading
        title={t("admin.editUser")}
        description={t("admin.editUserDesc", { name: user.name })}
      />
      <UserForm
        action={updateUserWithId}
        categories={categories}
        mode="edit"
        defaults={{
          name: user.name,
          email: user.email,
          role: user.role,
          categoryId: user.categoryId,
          active: user.active,
        }}
      />
    </div>
  );
}

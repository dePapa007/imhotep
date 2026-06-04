import type { Metadata } from "next";

import { CategoryForm } from "@/components/admin/category-form";
import { PageHeading } from "@/components/layout/page-heading";
import { createTranslator } from "@/i18n/get-messages";
import { requireRole } from "@/server/auth/dal";
import { createCategory } from "@/server/categories/actions";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const user = await requireRole("ADMIN");
  const t = createTranslator(user.preferredLocale);
  return { title: t("admin.newCategory") };
}

export default async function NewCategoryPage() {
  const user = await requireRole("ADMIN");
  const t = createTranslator(user.preferredLocale);

  return (
    <div>
      <PageHeading
        title={t("admin.newCategory")}
        description={t("admin.newCategoryDescription")}
      />
      <CategoryForm action={createCategory} mode="create" />
    </div>
  );
}

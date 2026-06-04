import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CategoryForm } from "@/components/admin/category-form";
import { PageHeading } from "@/components/layout/page-heading";
import { createTranslator } from "@/i18n/get-messages";
import { requireRole } from "@/server/auth/dal";
import { updateCategory } from "@/server/categories/actions";
import { getCategoryById } from "@/server/categories/queries";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata(): Promise<Metadata> {
  const user = await requireRole("ADMIN");
  const t = createTranslator(user.preferredLocale);
  return { title: t("common.edit") };
}

export default async function EditCategoryPage({ params }: PageProps) {
  const user = await requireRole("ADMIN");
  const t = createTranslator(user.preferredLocale);
  const { id } = await params;

  const category = await getCategoryById(id);
  if (!category) notFound();

  const updateCategoryWithId = updateCategory.bind(null, category.id);

  return (
    <div>
      <PageHeading
        title={t("common.edit")}
        description={t("admin.editCategoryDesc", { name: category.name })}
      />
      <CategoryForm
        action={updateCategoryWithId}
        mode="edit"
        defaults={{
          name: category.name,
          description: category.description,
          active: category.active,
        }}
      />
    </div>
  );
}

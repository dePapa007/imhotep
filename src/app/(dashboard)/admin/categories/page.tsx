import type { Metadata } from "next";

import { CategoriesList } from "@/components/admin/categories-list";
import { PageHeading } from "@/components/layout/page-heading";
import { createTranslator } from "@/i18n/get-messages";
import type { ListCategoriesFilters } from "@/server/categories/queries";
import { requireRole } from "@/server/auth/dal";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ search?: string; status?: string }>;
}

export async function generateMetadata(): Promise<Metadata> {
  const user = await requireRole("ADMIN");
  const t = createTranslator(user.preferredLocale);
  return { title: t("admin.categoriesTitle") };
}

export default async function AdminCategoriesPage({ searchParams }: PageProps) {
  const user = await requireRole("ADMIN");
  const t = createTranslator(user.preferredLocale);
  const params = await searchParams;

  const filters: ListCategoriesFilters = {};
  if (params.search) filters.search = params.search;
  if (params.status === "active") filters.active = true;
  if (params.status === "archived") filters.active = false;

  return (
    <div>
      <PageHeading
        title={t("admin.categoriesTitle")}
        description={t("admin.categoriesDescription")}
      />
      <CategoriesList filters={filters} locale={user.preferredLocale} />
    </div>
  );
}

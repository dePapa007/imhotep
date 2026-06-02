import type { Metadata } from "next";

import { CategoriesList } from "@/components/admin/categories-list";
import { PageHeading } from "@/components/layout/page-heading";
import type { ListCategoriesFilters } from "@/server/categories/queries";
import { requireRole } from "@/server/auth/dal";

export const metadata: Metadata = {
  title: "Categories",
};

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ search?: string; status?: string }>;
}

export default async function AdminCategoriesPage({ searchParams }: PageProps) {
  await requireRole("ADMIN");
  const params = await searchParams;

  const filters: ListCategoriesFilters = {};
  if (params.search) filters.search = params.search;
  if (params.status === "active") filters.active = true;
  if (params.status === "archived") filters.active = false;

  return (
    <div>
      <PageHeading
        title="Categories"
        description="Create and manage training categories."
      />
      <CategoriesList filters={filters} />
    </div>
  );
}

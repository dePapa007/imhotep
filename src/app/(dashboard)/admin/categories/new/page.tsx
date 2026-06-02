import type { Metadata } from "next";

import { CategoryForm } from "@/components/admin/category-form";
import { PageHeading } from "@/components/layout/page-heading";
import { requireRole } from "@/server/auth/dal";
import { createCategory } from "@/server/categories/actions";

export const metadata: Metadata = {
  title: "New category",
};

export const dynamic = "force-dynamic";

export default async function NewCategoryPage() {
  await requireRole("ADMIN");

  return (
    <div>
      <PageHeading
        title="New category"
        description="Add a category for grouping users and trainings."
      />
      <CategoryForm action={createCategory} mode="create" />
    </div>
  );
}

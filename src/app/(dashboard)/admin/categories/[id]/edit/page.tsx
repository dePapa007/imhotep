import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CategoryForm } from "@/components/admin/category-form";
import { PageHeading } from "@/components/layout/page-heading";
import { requireRole } from "@/server/auth/dal";
import { updateCategory } from "@/server/categories/actions";
import { getCategoryById } from "@/server/categories/queries";

export const metadata: Metadata = {
  title: "Edit category",
};

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditCategoryPage({ params }: PageProps) {
  await requireRole("ADMIN");
  const { id } = await params;

  const category = await getCategoryById(id);
  if (!category) notFound();

  const updateCategoryWithId = updateCategory.bind(null, category.id);

  return (
    <div>
      <PageHeading
        title="Edit category"
        description={`Update ${category.name}.`}
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

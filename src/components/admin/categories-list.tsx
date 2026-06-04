import Link from "next/link";

import { CategoryCard } from "@/components/admin/category-card";
import { CategoryFilters } from "@/components/admin/category-filters";
import { buttonClasses } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import {
  listCategories,
  type ListCategoriesFilters,
} from "@/server/categories/queries";

export async function CategoriesList({
  filters,
}: {
  filters: ListCategoriesFilters;
}) {
  const categories = await listCategories(filters);

  return (
    <div className="flex flex-col gap-4">
      <Link href="/admin/categories/new" className={buttonClasses()}>
        New category
      </Link>

      <CategoryFilters />

      {categories.length === 0 ? (
        <EmptyState
          title="No categories found"
          description="Try adjusting your search or filters."
        />
      ) : (
        <div className="flex flex-col gap-3">
          {categories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      )}
    </div>
  );
}

import Link from "next/link";

import { CategoryCard } from "@/components/admin/category-card";
import { CategoryFilters } from "@/components/admin/category-filters";
import { buttonClasses } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { createTranslator } from "@/i18n/get-messages";
import type { Locale } from "@/i18n/locales";
import {
  listCategories,
  type ListCategoriesFilters,
} from "@/server/categories/queries";

export async function CategoriesList({
  filters,
  locale,
}: {
  filters: ListCategoriesFilters;
  locale: Locale;
}) {
  const t = createTranslator(locale);
  const categories = await listCategories(filters);

  return (
    <div className="flex flex-col gap-4">
      <Link href="/admin/categories/new" className={buttonClasses()}>
        {t("admin.newCategory")}
      </Link>

      <CategoryFilters />

      {categories.length === 0 ? (
        <EmptyState
          title={t("admin.noCategoriesMatch")}
          description={t("admin.noCategoriesMatchDesc")}
        />
      ) : (
        <div className="flex flex-col gap-3">
          {categories.map((category) => (
            <CategoryCard key={category.id} category={category} locale={locale} />
          ))}
        </div>
      )}
    </div>
  );
}

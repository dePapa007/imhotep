import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button, buttonClasses } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { createTranslator } from "@/i18n/get-messages";
import type { Locale } from "@/i18n/locales";
import { toggleCategoryActive } from "@/server/categories/actions";
import type { CategoryListItem } from "@/server/categories/queries";

export function CategoryCard({
  category,
  locale,
}: {
  category: CategoryListItem;
  locale: Locale;
}) {
  const t = createTranslator(locale);
  const toggle = toggleCategoryActive.bind(null, category.id);

  return (
    <Card>
      <CardContent className="flex flex-col gap-3 p-4">
        <div>
          <div className="flex items-center gap-2">
            <p className="font-medium">{category.name}</p>
            <Badge variant={category.active ? "success" : "destructive"}>
              {category.active ? t("common.active") : t("common.archived")}
            </Badge>
          </div>
          {category.description ? (
            <p className="text-muted-foreground mt-1 text-sm">
              {category.description}
            </p>
          ) : null}
          <p className="text-muted-foreground mt-2 text-xs">
            {t("admin.categoryMeta", {
              users: category._count.users,
              sessions: category._count.trainingSessions,
            })}
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/admin/categories/${category.id}/edit`}
            className={buttonClasses({ variant: "outline", size: "sm" })}
          >
            {t("common.edit")}
          </Link>
          <form action={toggle} className="w-full sm:w-auto">
            <Button
              type="submit"
              size="sm"
              variant={category.active ? "destructive" : "secondary"}
            >
              {category.active ? t("admin.archive") : t("admin.restoreCategory")}
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}

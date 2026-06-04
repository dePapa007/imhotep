import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { createTranslator } from "@/i18n/get-messages";
import type { Locale } from "@/i18n/locales";
import type { UserListItem } from "@/server/users/queries";

export function UserCard({
  user,
  locale,
}: {
  user: UserListItem;
  locale: Locale;
}) {
  const t = createTranslator(locale);

  return (
    <Card>
      <Link href={`/admin/users/${user.id}`}>
        <CardContent className="flex items-center justify-between gap-3 p-4">
          <div>
            <p className="font-medium">{user.name}</p>
            <p className="text-muted-foreground text-xs">{user.email}</p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <Badge variant="primary">{t(`roles.${user.role}`)}</Badge>
            <span className="text-muted-foreground text-xs">
              {user.category ? user.category.name : t("common.noCategory")}
            </span>
            <span className="text-muted-foreground text-xs">
              {user.active ? t("common.active") : t("common.inactive")}
            </span>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}

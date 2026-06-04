import Link from "next/link";

import { UserCard } from "@/components/admin/user-card";
import { UserFilters } from "@/components/admin/user-filters";
import { buttonClasses } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { createTranslator } from "@/i18n/get-messages";
import type { Locale } from "@/i18n/locales";
import { listUsers, type ListUsersFilters } from "@/server/users/queries";

interface UsersListProps {
  filters: ListUsersFilters;
  lockRole?: boolean;
  locale: Locale;
}

export async function UsersList({
  filters,
  lockRole = false,
  locale,
}: UsersListProps) {
  const t = createTranslator(locale);
  const users = await listUsers(filters);

  return (
    <div className="flex flex-col gap-4">
      <Link href="/admin/users/new" className={buttonClasses()}>
        {t("admin.newUser")}
      </Link>

      <UserFilters lockRole={lockRole} />

      {users.length === 0 ? (
        <EmptyState title={t("admin.noUsersMatch")} />
      ) : (
        <div className="flex flex-col gap-3">
          {users.map((user) => (
            <UserCard key={user.id} user={user} locale={locale} />
          ))}
        </div>
      )}
    </div>
  );
}

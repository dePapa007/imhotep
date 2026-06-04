import type { Metadata } from "next";

import { UsersList } from "@/components/admin/users-list";
import { PageHeading } from "@/components/layout/page-heading";
import { createTranslator } from "@/i18n/get-messages";
import { ROLE_VALUES } from "@/lib/validators/user";
import type { ListUsersFilters } from "@/server/users/queries";
import { requireRole } from "@/server/auth/dal";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ search?: string; role?: string; status?: string }>;
}

export async function generateMetadata(): Promise<Metadata> {
  const user = await requireRole("ADMIN");
  const t = createTranslator(user.preferredLocale);
  return { title: t("admin.usersTitle") };
}

export default async function AdminUsersPage({ searchParams }: PageProps) {
  const user = await requireRole("ADMIN");
  const t = createTranslator(user.preferredLocale);
  const params = await searchParams;

  const filters: ListUsersFilters = {};
  if (params.search) filters.search = params.search;
  if (params.role && (ROLE_VALUES as readonly string[]).includes(params.role)) {
    filters.role = params.role as ListUsersFilters["role"];
  }
  if (params.status === "active") filters.active = true;
  if (params.status === "inactive") filters.active = false;

  return (
    <div>
      <PageHeading
        title={t("admin.usersTitle")}
        description={t("admin.usersDescription")}
      />
      <UsersList filters={filters} locale={user.preferredLocale} />
    </div>
  );
}

import type { Metadata } from "next";

import { UsersList } from "@/components/admin/users-list";
import { PageHeading } from "@/components/layout/page-heading";
import { createTranslator } from "@/i18n/get-messages";
import type { ListUsersFilters } from "@/server/users/queries";
import { requireRole } from "@/server/auth/dal";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ search?: string; status?: string }>;
}

export async function generateMetadata(): Promise<Metadata> {
  const user = await requireRole("ADMIN");
  const t = createTranslator(user.preferredLocale);
  return { title: t("admin.trainersTitle") };
}

export default async function AdminTrainersPage({ searchParams }: PageProps) {
  const user = await requireRole("ADMIN");
  const t = createTranslator(user.preferredLocale);
  const params = await searchParams;

  const filters: ListUsersFilters = { role: "TRAINER" };
  if (params.search) filters.search = params.search;
  if (params.status === "active") filters.active = true;
  if (params.status === "inactive") filters.active = false;

  return (
    <div>
      <PageHeading
        title={t("admin.trainersTitle")}
        description={t("admin.trainersDescription")}
      />
      <UsersList
        filters={filters}
        lockRole
        locale={user.preferredLocale}
      />
    </div>
  );
}

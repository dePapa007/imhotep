import type { Metadata } from "next";

import { UsersList } from "@/components/admin/users-list";
import { PageHeading } from "@/components/layout/page-heading";
import type { ListUsersFilters } from "@/server/users/queries";
import { requireRole } from "@/server/auth/dal";

export const metadata: Metadata = {
  title: "Trainers",
};

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ search?: string; status?: string }>;
}

export default async function AdminTrainersPage({ searchParams }: PageProps) {
  await requireRole("ADMIN");
  const params = await searchParams;

  const filters: ListUsersFilters = { role: "TRAINER" };
  if (params.search) filters.search = params.search;
  if (params.status === "active") filters.active = true;
  if (params.status === "inactive") filters.active = false;

  return (
    <div>
      <PageHeading
        title="Trainers"
        description="All accounts with the trainer role."
      />
      <UsersList
        filters={filters}
        lockRole
        emptyMessage="No trainers yet. Create one from the Users page."
      />
    </div>
  );
}

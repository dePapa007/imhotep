import type { Metadata } from "next";

import { UsersList } from "@/components/admin/users-list";
import { PageHeading } from "@/components/layout/page-heading";
import { ROLE_VALUES } from "@/lib/validators/user";
import type { ListUsersFilters } from "@/server/users/queries";
import { requireRole } from "@/server/auth/dal";

export const metadata: Metadata = {
  title: "Users",
};

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ search?: string; role?: string; status?: string }>;
}

export default async function AdminUsersPage({ searchParams }: PageProps) {
  await requireRole("ADMIN");
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
        title="Users"
        description="Create, search, and manage all accounts."
      />
      <UsersList filters={filters} />
    </div>
  );
}

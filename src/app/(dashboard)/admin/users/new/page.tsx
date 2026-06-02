import type { Metadata } from "next";

import { UserForm } from "@/components/admin/user-form";
import { PageHeading } from "@/components/layout/page-heading";
import { requireRole } from "@/server/auth/dal";
import { createUser } from "@/server/users/actions";
import { listCategories } from "@/server/users/queries";

export const metadata: Metadata = {
  title: "New user",
};

export const dynamic = "force-dynamic";

export default async function NewUserPage() {
  await requireRole("ADMIN");
  const categories = await listCategories();

  return (
    <div>
      <PageHeading
        title="New user"
        description="Create an account with an initial password."
      />
      <UserForm action={createUser} categories={categories} mode="create" />
    </div>
  );
}

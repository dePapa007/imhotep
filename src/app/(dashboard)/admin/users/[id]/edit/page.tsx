import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { UserForm } from "@/components/admin/user-form";
import { PageHeading } from "@/components/layout/page-heading";
import { requireRole } from "@/server/auth/dal";
import { updateUser } from "@/server/users/actions";
import { getUserById, listCategories } from "@/server/users/queries";

export const metadata: Metadata = {
  title: "Edit user",
};

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditUserPage({ params }: PageProps) {
  await requireRole("ADMIN");
  const { id } = await params;

  const [user, categories] = await Promise.all([
    getUserById(id),
    listCategories(),
  ]);

  if (!user) notFound();

  const updateUserWithId = updateUser.bind(null, user.id);

  return (
    <div>
      <PageHeading
        title="Edit user"
        description={`Update ${user.name}'s account.`}
      />
      <UserForm
        action={updateUserWithId}
        categories={categories}
        mode="edit"
        defaults={{
          name: user.name,
          email: user.email,
          role: user.role,
          categoryId: user.categoryId,
          active: user.active,
        }}
      />
    </div>
  );
}

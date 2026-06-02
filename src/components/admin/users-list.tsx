import Link from "next/link";

import { UserCard } from "@/components/admin/user-card";
import { UserFilters } from "@/components/admin/user-filters";
import { buttonClasses } from "@/components/ui/button";
import { listUsers, type ListUsersFilters } from "@/server/users/queries";

interface UsersListProps {
  filters: ListUsersFilters;
  lockRole?: boolean;
  emptyMessage?: string;
}

export async function UsersList({
  filters,
  lockRole = false,
  emptyMessage = "No users match your filters.",
}: UsersListProps) {
  const users = await listUsers(filters);

  return (
    <div className="flex flex-col gap-4">
      <Link href="/admin/users/new" className={buttonClasses()}>
        New user
      </Link>

      <UserFilters lockRole={lockRole} />

      {users.length === 0 ? (
        <p className="text-muted-foreground py-8 text-center text-sm">
          {emptyMessage}
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {users.map((user) => (
            <UserCard key={user.id} user={user} />
          ))}
        </div>
      )}
    </div>
  );
}

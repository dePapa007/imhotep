import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { buttonClasses } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { UserListItem } from "@/server/users/queries";

const roleLabel: Record<UserListItem["role"], string> = {
  ADMIN: "Admin",
  TRAINER: "Trainer",
  USER: "Member",
};

export function UserCard({ user }: { user: UserListItem }) {
  return (
    <Card>
      <CardContent className="flex items-start justify-between gap-3 p-4">
        <Link href={`/admin/users/${user.id}`} className="flex-1">
          <p className="font-medium">{user.name}</p>
          <p className="text-muted-foreground text-sm">{user.email}</p>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <Badge variant="primary">{roleLabel[user.role]}</Badge>
            <Badge variant="muted">
              {user.category ? user.category.name : "No category"}
            </Badge>
            <Badge variant={user.active ? "success" : "destructive"}>
              {user.active ? "Active" : "Inactive"}
            </Badge>
          </div>
        </Link>
        <Link
          href={`/admin/users/${user.id}/edit`}
          className={buttonClasses({ variant: "outline", size: "sm" })}
        >
          Edit
        </Link>
      </CardContent>
    </Card>
  );
}

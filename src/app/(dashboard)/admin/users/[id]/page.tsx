import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button, buttonClasses } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeading } from "@/components/layout/page-heading";
import { UserAttendanceHistory } from "@/components/attendance/user-attendance-history";
import { requireRole } from "@/server/auth/dal";
import { listAttendanceHistoryForUser } from "@/server/attendance/queries";
import { toggleUserActive } from "@/server/users/actions";
import { getUserById } from "@/server/users/queries";

export const metadata: Metadata = {
  title: "User detail",
};

export const dynamic = "force-dynamic";

const roleLabel = {
  ADMIN: "Admin",
  TRAINER: "Trainer",
  USER: "Member",
} as const;

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function UserDetailPage({ params }: PageProps) {
  const admin = await requireRole("ADMIN");
  const { id } = await params;
  const [user, attendanceHistory] = await Promise.all([
    getUserById(id),
    listAttendanceHistoryForUser(id),
  ]);

  if (!user) notFound();

  const isSelf = user.id === admin.id;
  const toggle = toggleUserActive.bind(null, user.id);

  return (
    <div>
      <PageHeading title={user.name} description={user.email} />

      <Card>
        <CardContent className="flex flex-wrap gap-1.5 p-4">
          <Badge variant="primary">{roleLabel[user.role]}</Badge>
          <Badge variant="muted">
            {user.category ? user.category.name : "No category"}
          </Badge>
          <Badge variant={user.active ? "success" : "destructive"}>
            {user.active ? "Active" : "Inactive"}
          </Badge>
        </CardContent>
      </Card>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <Link
          href={`/admin/users/${user.id}/edit`}
          className={buttonClasses()}
        >
          Edit user
        </Link>
        {!isSelf ? (
          <form action={toggle} className="w-full sm:w-auto">
            <Button
              type="submit"
              variant={user.active ? "destructive" : "secondary"}
            >
              {user.active ? "Deactivate" : "Activate"}
            </Button>
          </form>
        ) : null}
      </div>

      <div className="mt-6">
        <UserAttendanceHistory items={attendanceHistory} />
      </div>
    </div>
  );
}

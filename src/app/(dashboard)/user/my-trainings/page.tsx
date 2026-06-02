import type { Metadata } from "next";

import { RegisteredSessionsList } from "@/components/user/registered-sessions-list";
import { PageHeading } from "@/components/layout/page-heading";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { requireRole } from "@/server/auth/dal";
import { listRegisteredSessionsForUser } from "@/server/registrations/queries";

export const metadata: Metadata = {
  title: "My trainings",
};

export const dynamic = "force-dynamic";

export default async function UserMyTrainingsPage() {
  const user = await requireRole("USER");

  if (!user.categoryId) {
    return (
      <div>
        <PageHeading
          title="My trainings"
          description="Your upcoming registered sessions."
        />
        <Card>
          <CardHeader>
            <CardTitle>No category assigned</CardTitle>
            <CardDescription>
              Ask an administrator to assign you to a category first.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const sessions = await listRegisteredSessionsForUser(user.id);

  return (
    <div>
      <PageHeading
        title="My trainings"
        description="Sessions you are registered for."
      />
      <RegisteredSessionsList sessions={sessions} />
    </div>
  );
}

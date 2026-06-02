import Link from "next/link";

import { UserTrainingCard } from "@/components/user/user-training-card";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { UserSessionItem } from "@/server/registrations/queries";

export function RegisteredSessionsList({
  sessions,
}: {
  sessions: UserSessionItem[];
}) {
  if (sessions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No upcoming registrations</CardTitle>
          <CardDescription>
            Browse available trainings to register for your next session.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {sessions.map((session) => (
        <UserTrainingCard key={session.id} session={session} />
      ))}
      <Link
        href="/user/browse"
        className="text-primary text-center text-sm font-medium"
      >
        Browse more trainings
      </Link>
    </div>
  );
}

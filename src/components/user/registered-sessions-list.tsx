import Link from "next/link";

import { UserTrainingCard } from "@/components/user/user-training-card";
import { buttonClasses } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import type { UserSessionItem } from "@/server/registrations/queries";

export function RegisteredSessionsList({
  sessions,
}: {
  sessions: UserSessionItem[];
}) {
  if (sessions.length === 0) {
    return (
      <EmptyState
        title="No upcoming registrations"
        description="Browse available trainings to register for your next session."
        action={
          <Link href="/user/browse" className={buttonClasses()}>
            Browse trainings
          </Link>
        }
      />
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

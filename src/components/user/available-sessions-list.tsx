import { UserTrainingCard } from "@/components/user/user-training-card";
import { groupSessionsByDay } from "@/lib/date-groups";
import type { UserSessionItem } from "@/server/registrations/queries";

export function AvailableSessionsList({
  sessions,
}: {
  sessions: UserSessionItem[];
}) {
  const groups = groupSessionsByDay(sessions);

  if (groups.length === 0) {
    return (
      <p className="text-muted-foreground py-8 text-center text-sm">
        No upcoming trainings available in your category.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {groups.map((group) => (
        <section key={group.dateKey}>
          <h2 className="text-muted-foreground mb-3 text-sm font-semibold tracking-wide uppercase">
            {group.label}
          </h2>
          <div className="flex flex-col gap-3">
            {group.sessions.map((session) => (
              <UserTrainingCard key={session.id} session={session} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

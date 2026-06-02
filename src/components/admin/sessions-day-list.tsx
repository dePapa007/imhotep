import { SessionCard } from "@/components/admin/session-card";
import { groupSessionsByDay } from "@/lib/date-groups";
import type { SessionListItem } from "@/server/trainings/queries";

export function SessionsDayList({ sessions }: { sessions: SessionListItem[] }) {
  const groups = groupSessionsByDay(sessions);

  if (groups.length === 0) {
    return (
      <p className="text-muted-foreground py-8 text-center text-sm">
        No trainings match your filters.
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
              <SessionCard
                key={session.id}
                session={session}
                href={`/admin/trainings/${session.id}`}
                compact
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

import { TrainerSessionCard } from "@/components/trainer/trainer-session-card";
import { groupSessionsByDay } from "@/lib/date-groups";
import type { ScheduleFilter, TrainerSessionItem } from "@/server/trainer/queries";

const emptyMessages: Record<ScheduleFilter, string> = {
  upcoming: "No upcoming trainings assigned to you.",
  past: "No past trainings on your schedule.",
  cancelled: "No cancelled trainings assigned to you.",
};

export function TrainerSessionsList({
  sessions,
  filter,
}: {
  sessions: TrainerSessionItem[];
  filter: ScheduleFilter;
}) {
  if (sessions.length === 0) {
    return (
      <p className="text-muted-foreground py-8 text-center text-sm">
        {emptyMessages[filter]}
      </p>
    );
  }

  if (filter === "upcoming") {
    const groups = groupSessionsByDay(sessions);
    return (
      <div className="flex flex-col gap-6">
        {groups.map((group) => (
          <section key={group.dateKey}>
            <h2 className="text-muted-foreground mb-3 text-sm font-semibold tracking-wide uppercase">
              {group.label}
            </h2>
            <div className="flex flex-col gap-3">
              {group.sessions.map((session) => (
                <TrainerSessionCard key={session.id} session={session} />
              ))}
            </div>
          </section>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {sessions.map((session) => (
        <TrainerSessionCard key={session.id} session={session} />
      ))}
    </div>
  );
}

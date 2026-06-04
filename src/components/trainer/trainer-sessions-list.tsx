import { TrainerSessionCard } from "@/components/trainer/trainer-session-card";
import { EmptyState } from "@/components/ui/empty-state";
import { groupSessionsByDay } from "@/lib/date-groups";
import type { ScheduleFilter, TrainerSessionItem } from "@/server/trainer/queries";

const emptyMessages: Record<
  ScheduleFilter,
  { title: string; description: string }
> = {
  upcoming: {
    title: "No upcoming trainings",
    description: "You have no upcoming sessions assigned to you.",
  },
  past: {
    title: "No past trainings",
    description: "Your past assigned sessions will appear here.",
  },
  cancelled: {
    title: "No cancelled trainings",
    description: "Cancelled sessions assigned to you will appear here.",
  },
};

export function TrainerSessionsList({
  sessions,
  filter,
}: {
  sessions: TrainerSessionItem[];
  filter: ScheduleFilter;
}) {
  if (sessions.length === 0) {
    const msg = emptyMessages[filter];
    return <EmptyState title={msg.title} description={msg.description} />;
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

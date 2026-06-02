import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { SessionListItem } from "@/server/trainings/queries";

const dateFormat = new Intl.DateTimeFormat("en-GB", {
  weekday: "short",
  day: "numeric",
  month: "short",
});
const timeFormat = new Intl.DateTimeFormat("en-GB", {
  hour: "2-digit",
  minute: "2-digit",
});

const statusVariant = {
  SCHEDULED: "success",
  CANCELLED: "destructive",
  COMPLETED: "muted",
} as const;

const statusLabel = {
  SCHEDULED: "Scheduled",
  CANCELLED: "Cancelled",
  COMPLETED: "Completed",
} as const;

export function SessionCard({
  session,
  href,
  compact = false,
}: {
  session: SessionListItem;
  href?: string;
  compact?: boolean;
}) {
  const trainerNames = session.trainers
    .map((t) => t.trainer.name)
    .join(", ");
  const capacityLabel = session.capacity
    ? `${session._count.registrations} / ${session.capacity} registered`
    : `${session._count.registrations} registered`;

  const body = compact ? (
    <CardContent className="flex flex-col gap-1 p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-medium">
            {timeFormat.format(session.startsAt)} - {session.title}
          </p>
          <p className="text-muted-foreground text-xs">
            {trainerNames ? `Trainer: ${trainerNames}` : "No trainer assigned"}
          </p>
          <p className="text-muted-foreground text-xs">{capacityLabel}</p>
        </div>
        <Badge variant={statusVariant[session.status]}>
          {statusLabel[session.status]}
        </Badge>
      </div>
    </CardContent>
  ) : (
    <CardContent className="flex flex-col gap-2 p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-muted-foreground text-xs">
            {dateFormat.format(session.startsAt)} -{" "}
            {timeFormat.format(session.startsAt)}-
            {timeFormat.format(session.endsAt)}
          </p>
          <p className="font-medium">{session.title}</p>
        </div>
        <Badge variant={statusVariant[session.status]}>
          {statusLabel[session.status]}
        </Badge>
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        <Badge variant="primary">{session.category.name}</Badge>
        {session.location ? (
          <span className="text-muted-foreground text-xs">
            {session.location}
          </span>
        ) : null}
      </div>
      <p className="text-muted-foreground text-xs">
        {trainerNames ? `Trainers: ${trainerNames}` : "No trainers assigned"}
      </p>
      <p className="text-muted-foreground text-xs">{capacityLabel}</p>
    </CardContent>
  );

  if (href) {
    return (
      <Card>
        <Link href={href}>{body}</Link>
      </Card>
    );
  }
  return <Card>{body}</Card>;
}

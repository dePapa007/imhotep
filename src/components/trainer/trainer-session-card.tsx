import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { TrainerSessionItem } from "@/server/trainer/queries";

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

export function TrainerSessionCard({ session }: { session: TrainerSessionItem }) {
  const capacityLabel = session.capacity
    ? `${session._count.registrations} / ${session.capacity} registered`
    : `${session._count.registrations} registered`;

  return (
    <Card>
      <Link href={`/trainer/trainings/${session.id}`}>
        <CardContent className="flex flex-col gap-2 p-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-medium">{session.title}</p>
              <p className="text-muted-foreground text-sm">
                {dateFormat.format(session.startsAt)}{" "}
                {timeFormat.format(session.startsAt)} -{" "}
                {timeFormat.format(session.endsAt)}
              </p>
              {session.location ? (
                <p className="text-muted-foreground text-sm">
                  {session.location}
                </p>
              ) : null}
              <p className="text-muted-foreground text-xs">{capacityLabel}</p>
            </div>
            <Badge variant={statusVariant[session.status]}>
              {session.status}
            </Badge>
          </div>
          <Badge variant="primary" className="w-fit">
            {session.category.name}
          </Badge>
        </CardContent>
      </Link>
    </Card>
  );
}

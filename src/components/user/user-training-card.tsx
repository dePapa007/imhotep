import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { buttonClasses } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { UserSessionItem } from "@/server/registrations/queries";

const dateFormat = new Intl.DateTimeFormat("en-GB", {
  weekday: "short",
  day: "numeric",
  month: "short",
});
const timeFormat = new Intl.DateTimeFormat("en-GB", {
  hour: "2-digit",
  minute: "2-digit",
});

export function UserTrainingCard({ session }: { session: UserSessionItem }) {
  const capacityLabel = session.capacity
    ? `${session._count.registrations} / ${session.capacity} registered`
    : `${session._count.registrations} registered`;

  return (
    <Card>
      <CardContent className="flex flex-col gap-2 p-4">
        <Link href={`/user/trainings/${session.id}`} className="flex flex-col gap-1">
          <p className="font-medium">{session.title}</p>
          <p className="text-muted-foreground text-sm">
            {dateFormat.format(session.startsAt)}{" "}
            {timeFormat.format(session.startsAt)} -{" "}
            {timeFormat.format(session.endsAt)}
          </p>
          {session.location ? (
            <p className="text-muted-foreground text-sm">
              Location: {session.location}
            </p>
          ) : null}
          <p className="text-muted-foreground text-xs">{capacityLabel}</p>
        </Link>
        <div className="flex items-center gap-2">
          {session.isRegistered ? (
            <>
              <Badge variant="success">Registered</Badge>
              <Link
                href={`/user/trainings/${session.id}`}
                className={buttonClasses({ variant: "outline", size: "sm" })}
              >
                View
              </Link>
            </>
          ) : (
            <Link
              href={`/user/trainings/${session.id}`}
              className={buttonClasses({ size: "sm" })}
            >
              Register
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

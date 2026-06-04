import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { createTranslator } from "@/i18n/get-messages";
import { formatDateShort, formatTime } from "@/i18n/format";
import type { Locale } from "@/i18n/locales";
import type { SessionListItem } from "@/server/trainings/queries";

const statusVariant = {
  SCHEDULED: "success",
  CANCELLED: "destructive",
  COMPLETED: "muted",
} as const;

export function SessionCard({
  session,
  href,
  compact = false,
  locale,
}: {
  session: SessionListItem;
  href?: string;
  compact?: boolean;
  locale: Locale;
}) {
  const t = createTranslator(locale);
  const statusLabel = {
    SCHEDULED: t("admin.statusScheduled"),
    CANCELLED: t("admin.statusCancelled"),
    COMPLETED: t("admin.statusCompleted"),
  } as const;

  const trainerNames = session.trainers
    .map((tr) => tr.trainer.name)
    .join(", ");
  const capacityLabel = session.capacity
    ? t("session.registeredCapacity", {
        count: session._count.registrations,
        capacity: session.capacity,
      })
    : t("session.registered", { count: session._count.registrations });

  const body = compact ? (
    <CardContent className="flex flex-col gap-1 p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-medium">
            {formatTime(session.startsAt, locale)} - {session.title}
          </p>
          <p className="text-muted-foreground text-xs">
            {trainerNames
              ? `${t("session.trainer")}: ${trainerNames}`
              : t("session.noTrainerAssigned")}
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
            {formatDateShort(session.startsAt, locale)} -{" "}
            {formatTime(session.startsAt, locale)}-
            {formatTime(session.endsAt, locale)}
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
        {trainerNames
          ? `${t("session.trainers")}: ${trainerNames}`
          : t("session.noTrainerAssigned")}
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

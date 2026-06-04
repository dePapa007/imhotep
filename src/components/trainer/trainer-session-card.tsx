import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { createTranslator } from "@/i18n/get-messages";
import { formatDateShort, formatTime } from "@/i18n/format";
import type { Locale } from "@/i18n/locales";
import type { TrainerSessionItem } from "@/server/trainer/queries";

const statusVariant = {
  SCHEDULED: "success",
  CANCELLED: "destructive",
  COMPLETED: "muted",
} as const;

export function TrainerSessionCard({
  session,
  locale,
}: {
  session: TrainerSessionItem;
  locale: Locale;
}) {
  const t = createTranslator(locale);
  const statusLabel = {
    SCHEDULED: t("admin.statusScheduled"),
    CANCELLED: t("admin.statusCancelled"),
    COMPLETED: t("admin.statusCompleted"),
  } as const;
  const capacityLabel = session.capacity
    ? t("session.registeredCapacity", {
        count: session._count.registrations,
        capacity: session.capacity,
      })
    : t("session.registered", { count: session._count.registrations });

  return (
    <Card>
      <Link href={`/trainer/trainings/${session.id}`}>
        <CardContent className="flex flex-col gap-2 p-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-medium">{session.title}</p>
              <p className="text-muted-foreground text-sm">
                {formatDateShort(session.startsAt, locale)}{" "}
                {formatTime(session.startsAt, locale)} -{" "}
                {formatTime(session.endsAt, locale)}
              </p>
              {session.location ? (
                <p className="text-muted-foreground text-sm">
                  {session.location}
                </p>
              ) : null}
              <p className="text-muted-foreground text-xs">{capacityLabel}</p>
            </div>
            <Badge variant={statusVariant[session.status]}>
              {statusLabel[session.status]}
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

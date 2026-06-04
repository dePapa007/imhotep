import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { buttonClasses } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { createTranslator } from "@/i18n/get-messages";
import { formatDateShort, formatTime } from "@/i18n/format";
import type { Locale } from "@/i18n/locales";
import type { UserSessionItem } from "@/server/registrations/queries";

export function UserTrainingCard({
  session,
  locale,
}: {
  session: UserSessionItem;
  locale: Locale;
}) {
  const t = createTranslator(locale);
  const capacityLabel = session.capacity
    ? t("session.registeredCapacity", {
        count: session._count.registrations,
        capacity: session.capacity,
      })
    : t("session.registered", { count: session._count.registrations });

  return (
    <Card>
      <CardContent className="flex flex-col gap-2 p-4">
        <Link href={`/user/trainings/${session.id}`} className="flex flex-col gap-1">
          <p className="font-medium">{session.title}</p>
          <p className="text-muted-foreground text-sm">
            {formatDateShort(session.startsAt, locale)}{" "}
            {formatTime(session.startsAt, locale)} -{" "}
            {formatTime(session.endsAt, locale)}
          </p>
          {session.location ? (
            <p className="text-muted-foreground text-sm">
              {t("common.locationLabel")}: {session.location}
            </p>
          ) : null}
          <p className="text-muted-foreground text-xs">{capacityLabel}</p>
        </Link>
        <div className="flex items-center gap-2">
          {session.isRegistered ? (
            <>
              <Badge variant="success">{t("user.registered")}</Badge>
              <Link
                href={`/user/trainings/${session.id}`}
                className={buttonClasses({ variant: "outline", size: "sm" })}
              >
                {t("common.view")}
              </Link>
            </>
          ) : (
            <Link
              href={`/user/trainings/${session.id}`}
              className={buttonClasses({ size: "sm" })}
            >
              {t("user.register")}
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

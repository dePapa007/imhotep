import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createTranslator } from "@/i18n/get-messages";
import { formatDateTimeMedium } from "@/i18n/format";
import type { Locale } from "@/i18n/locales";
import type { AttendanceHistoryItem } from "@/server/attendance/queries";
import type { AttendanceStatus } from "@prisma/client";

const statusBadgeVariant = {
  UNMARKED: "muted",
  PRESENT: "success",
  ABSENT: "destructive",
} as const;

export function UserAttendanceHistory({
  items,
  locale,
}: {
  items: AttendanceHistoryItem[];
  locale: Locale;
}) {
  const t = createTranslator(locale);
  const statusLabel = {
    UNMARKED: t("admin.attendanceUnmarked"),
    PRESENT: t("admin.attendancePresent"),
    ABSENT: t("admin.attendanceAbsent"),
  } as Record<AttendanceStatus, string>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("admin.attendanceHistory")}</CardTitle>
        <CardDescription>{t("admin.attendanceHistoryDesc")}</CardDescription>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            {t("admin.noPastTrainingsMember")}
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {items.map((item) => (
              <li
                key={item.id}
                className="border-border flex flex-col gap-1 border-b pb-3 last:border-0 last:pb-0"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium">
                      {item.trainingSession.title}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {formatDateTimeMedium(
                        item.trainingSession.startsAt,
                        locale,
                      )}
                    </p>
                  </div>
                  <Badge variant={statusBadgeVariant[item.attendanceStatus]}>
                    {statusLabel[item.attendanceStatus]}
                  </Badge>
                </div>
                {item.attendanceNotes ? (
                  <p className="text-muted-foreground text-xs">
                    {item.attendanceNotes}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

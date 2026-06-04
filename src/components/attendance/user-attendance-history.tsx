import { attendanceStatusLabel } from "@/lib/attendance";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { AttendanceHistoryItem } from "@/server/attendance/queries";

const dateTimeFormat = new Intl.DateTimeFormat("en-GB", {
  weekday: "short",
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

const statusBadgeVariant = {
  UNMARKED: "muted",
  PRESENT: "success",
  ABSENT: "destructive",
} as const;

export function UserAttendanceHistory({
  items,
}: {
  items: AttendanceHistoryItem[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Attendance history</CardTitle>
        <CardDescription>
          Past trainings this member was registered for.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            No past trainings yet.
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
                      {dateTimeFormat.format(item.trainingSession.startsAt)}
                    </p>
                  </div>
                  <Badge
                    variant={statusBadgeVariant[item.attendanceStatus]}
                  >
                    {attendanceStatusLabel[item.attendanceStatus]}
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

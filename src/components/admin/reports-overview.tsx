import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type {
  CategoryActivityRow,
  TrainerWorkloadRow,
  TrainingRegistrationReportRow,
  UserParticipationRow,
} from "@/server/reports/queries";

const dateFormat = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

function fillPercent(registered: number, capacity: number | null): string | null {
  if (!capacity || capacity <= 0) return null;
  return `${Math.round((registered / capacity) * 100)}% full`;
}

export function ReportsOverview({
  trainings,
  categories,
  trainers,
  participation,
}: {
  trainings: TrainingRegistrationReportRow[];
  categories: CategoryActivityRow[];
  trainers: TrainerWorkloadRow[];
  participation: UserParticipationRow[];
}) {
  return (
    <div className="flex flex-col gap-6">
      <ReportSection title="Registrations per training" empty={trainings.length === 0}>
        {trainings.slice(0, 15).map((row) => {
          const fill = fillPercent(row.registered, row.capacity);
          return (
            <Card key={row.id}>
              <CardContent className="flex flex-col gap-1 p-4">
                <p className="font-medium">{row.title}</p>
                <p className="text-muted-foreground text-xs">
                  {dateFormat.format(row.startsAt)} · {row.categoryName}
                </p>
                <p className="text-muted-foreground text-xs">
                  {row.registered} registered
                  {row.capacity ? ` / ${row.capacity}` : ""}
                  {fill ? ` · ${fill}` : ""}
                </p>
                {row.present + row.absent > 0 ? (
                  <p className="text-muted-foreground text-xs">
                    Attendance: {row.present} present, {row.absent} absent
                  </p>
                ) : null}
              </CardContent>
            </Card>
          );
        })}
        {trainings.length > 15 ? (
          <p className="text-muted-foreground text-xs">
            Showing 15 of {trainings.length}. Export CSV for the full list.
          </p>
        ) : null}
      </ReportSection>

      <ReportSection title="Category activity" empty={categories.length === 0}>
        {categories.map((row) => (
          <Card key={row.categoryId}>
            <CardContent className="flex items-center justify-between gap-2 p-4">
              <p className="font-medium">{row.categoryName}</p>
              <div className="flex gap-1.5">
                <Badge variant="primary">{row.sessionCount} sessions</Badge>
                <Badge variant="muted">{row.registrationCount} regs</Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </ReportSection>

      <ReportSection title="Trainer workload" empty={trainers.length === 0}>
        {trainers.map((row) => (
          <Card key={row.trainerId}>
            <CardContent className="flex items-center justify-between gap-2 p-4">
              <p className="font-medium">{row.trainerName}</p>
              <Badge variant="primary">
                {row.sessionCount} session{row.sessionCount === 1 ? "" : "s"}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </ReportSection>

      <ReportSection
        title="Member participation"
        empty={participation.length === 0}
      >
        {participation.slice(0, 20).map((row) => (
          <Card key={row.userId}>
            <CardContent className="flex flex-col gap-1 p-4">
              <p className="font-medium">{row.userName}</p>
              <p className="text-muted-foreground text-xs">{row.email}</p>
              <p className="text-muted-foreground text-xs">
                {row.registrations} registration
                {row.registrations === 1 ? "" : "s"}
                {row.attendanceRate !== null
                  ? ` · ${row.attendanceRate}% attendance`
                  : ""}
              </p>
            </CardContent>
          </Card>
        ))}
        {participation.length > 20 ? (
          <p className="text-muted-foreground text-xs">
            Showing 20 of {participation.length}. Export users CSV for all rows.
          </p>
        ) : null}
      </ReportSection>
    </div>
  );
}

function ReportSection({
  title,
  empty,
  children,
}: {
  title: string;
  empty: boolean;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-sm font-semibold">{title}</h2>
      {empty ? (
        <p className="text-muted-foreground text-sm">No data in this period.</p>
      ) : (
        <div className="flex flex-col gap-2">{children}</div>
      )}
    </section>
  );
}

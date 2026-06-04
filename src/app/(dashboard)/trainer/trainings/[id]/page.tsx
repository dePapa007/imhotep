import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AttendanceList } from "@/components/attendance/attendance-list";
import { TrainerRegisteredList } from "@/components/trainer/trainer-registered-list";
import {
  canEditAttendance,
  showAttendanceSection,
} from "@/lib/attendance";
import { saveSessionAttendanceFromForm } from "@/server/attendance/actions";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeading } from "@/components/layout/page-heading";
import { createTranslator } from "@/i18n/get-messages";
import { formatDateTime } from "@/i18n/format";
import { requireRole } from "@/server/auth/dal";
import { getAssignedSessionForTrainer } from "@/server/trainer/queries";

export const dynamic = "force-dynamic";

const statusVariant = {
  SCHEDULED: "success",
  CANCELLED: "destructive",
  COMPLETED: "muted",
} as const;

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata(): Promise<Metadata> {
  const user = await requireRole("TRAINER");
  const t = createTranslator(user.preferredLocale);
  return { title: t("trainer.trainingDetail") };
}

export default async function TrainerTrainingDetailPage({ params }: PageProps) {
  const user = await requireRole("TRAINER");
  const t = createTranslator(user.preferredLocale);
  const locale = user.preferredLocale;
  const { id } = await params;
  const session = await getAssignedSessionForTrainer(id, user.id);

  if (!session) notFound();

  const statusLabel = {
    SCHEDULED: t("admin.statusScheduled"),
    CANCELLED: t("admin.statusCancelled"),
    COMPLETED: t("admin.statusCompleted"),
  } as const;

  const coTrainers = session.trainers
    .filter((tr) => tr.trainer.id !== user.id)
    .map((tr) => tr.trainer.name)
    .join(", ");

  return (
    <div>
      <PageHeading
        title={session.title}
        description={formatDateTime(session.startsAt, locale)}
      />

      <Card>
        <CardContent className="flex flex-col gap-3 p-4">
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge variant={statusVariant[session.status]}>
              {statusLabel[session.status]}
            </Badge>
            <Badge variant="primary">{session.category.name}</Badge>
          </div>
          {session.description ? (
            <p className="text-sm">{session.description}</p>
          ) : null}
          <dl className="text-muted-foreground grid grid-cols-1 gap-1 text-sm">
            <div>
              <span className="font-medium">{t("admin.ends")}: </span>
              {formatDateTime(session.endsAt, locale)}
            </div>
            {session.location ? (
              <div>
                <span className="font-medium">{t("common.locationLabel")}: </span>
                {session.location}
              </div>
            ) : null}
            {coTrainers ? (
              <div>
                <span className="font-medium">{t("admin.coTrainers")}: </span>
                {coTrainers}
              </div>
            ) : null}
            <div>
              <span className="font-medium">{t("admin.spotsLabel")}: </span>
              {session.capacity
                ? t("session.registeredCapacity", {
                    count: session._count.registrations,
                    capacity: session.capacity,
                  })
                : t("session.registered", {
                    count: session._count.registrations,
                  })}
            </div>
          </dl>
        </CardContent>
      </Card>

      <div className="mt-6 flex flex-col gap-4">
        <TrainerRegisteredList session={session} locale={locale} />
        {showAttendanceSection(session) ? (
          <AttendanceList
            sessionId={session.id}
            registrations={session.registrations}
            canEdit={canEditAttendance(session)}
            lockedMessage={
              canEditAttendance(session)
                ? null
                : t("admin.attendanceAfterStart")
            }
            saveAction={saveSessionAttendanceFromForm}
          />
        ) : null}
      </div>
    </div>
  );
}

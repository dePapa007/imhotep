import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AttendanceList } from "@/components/attendance/attendance-list";
import { AddRegistrationForm } from "@/components/admin/add-registration-form";
import { RegistrationList } from "@/components/admin/registration-list";
import {
  canEditAttendance,
  showAttendanceSection,
} from "@/lib/attendance";
import { saveSessionAttendanceFromForm } from "@/server/attendance/actions";
import { TrainerAssignment } from "@/components/admin/trainer-assignment";
import { Badge } from "@/components/ui/badge";
import { Button, buttonClasses } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeading } from "@/components/layout/page-heading";
import { createTranslator } from "@/i18n/get-messages";
import { formatDateTime } from "@/i18n/format";
import { requireRole } from "@/server/auth/dal";
import { cancelSession, restoreSession } from "@/server/trainings/actions";
import {
  getSessionWithRegistrations,
  listActiveTrainers,
  listEligibleUsersForSession,
} from "@/server/trainings/queries";

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
  const user = await requireRole("ADMIN");
  const t = createTranslator(user.preferredLocale);
  return { title: t("admin.trainingDetail") };
}

export default async function TrainingDetailPage({ params }: PageProps) {
  const admin = await requireRole("ADMIN");
  const t = createTranslator(admin.preferredLocale);
  const locale = admin.preferredLocale;
  const { id } = await params;

  const [session, eligibleUsers, trainers] = await Promise.all([
    getSessionWithRegistrations(id),
    listEligibleUsersForSession(id),
    listActiveTrainers(),
  ]);

  if (!session) notFound();

  const statusLabel = {
    SCHEDULED: t("admin.statusScheduled"),
    CANCELLED: t("admin.statusCancelled"),
    COMPLETED: t("admin.statusCompleted"),
  } as const;

  const isCancelled = session.status === "CANCELLED";
  const atCapacity =
    session.capacity != null &&
    session.registrations.length >= session.capacity;
  const canAddUsers = session.status === "SCHEDULED" && !atCapacity;

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
            {session.templateId ? (
              <Badge variant="muted">{t("admin.recurring")}</Badge>
            ) : (
              <Badge variant="muted">{t("admin.oneTime")}</Badge>
            )}
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
            <div>
              <span className="font-medium">{t("forms.capacity")}: </span>
              {session.capacity ?? t("admin.unlimited")}
            </div>
            {session.registrationDeadline ? (
              <div>
                <span className="font-medium">
                  {t("admin.registrationClosesLabel")}:{" "}
                </span>
                {formatDateTime(session.registrationDeadline, locale)}
              </div>
            ) : null}
          </dl>
        </CardContent>
      </Card>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <Link
          href={`/admin/trainings/${session.id}/edit`}
          className={buttonClasses()}
        >
          {t("admin.editTraining")}
        </Link>
        {isCancelled ? (
          <form action={restoreSession.bind(null, session.id)}>
            <Button type="submit" variant="secondary">
              {t("admin.restoreTraining")}
            </Button>
          </form>
        ) : (
          <form action={cancelSession.bind(null, session.id)}>
            <Button type="submit" variant="destructive">
              {t("admin.cancelTraining")}
            </Button>
          </form>
        )}
      </div>

      <div className="mt-6 flex flex-col gap-4">
        <TrainerAssignment
          sessionId={session.id}
          assigned={session.trainers}
          availableTrainers={trainers}
        />
        <RegistrationList session={session} locale={locale} />
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
        <AddRegistrationForm
          sessionId={session.id}
          eligibleUsers={eligibleUsers}
          disabled={!canAddUsers}
        />
      </div>
    </div>
  );
}

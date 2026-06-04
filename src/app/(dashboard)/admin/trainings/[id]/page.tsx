import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AttendanceList } from "@/components/attendance/attendance-list";
import { AddRegistrationForm } from "@/components/admin/add-registration-form";
import { RegistrationList } from "@/components/admin/registration-list";
import {
  attendanceSectionMessage,
  canEditAttendance,
  showAttendanceSection,
} from "@/lib/attendance";
import { saveSessionAttendanceFromForm } from "@/server/attendance/actions";
import { TrainerAssignment } from "@/components/admin/trainer-assignment";
import { Badge } from "@/components/ui/badge";
import { Button, buttonClasses } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeading } from "@/components/layout/page-heading";
import { requireRole } from "@/server/auth/dal";
import { cancelSession, restoreSession } from "@/server/trainings/actions";
import {
  getSessionWithRegistrations,
  listActiveTrainers,
  listEligibleUsersForSession,
} from "@/server/trainings/queries";

export const metadata: Metadata = {
  title: "Training detail",
};

export const dynamic = "force-dynamic";

const dateTimeFormat = new Intl.DateTimeFormat("en-GB", {
  weekday: "long",
  day: "numeric",
  month: "long",
  hour: "2-digit",
  minute: "2-digit",
});

const statusVariant = {
  SCHEDULED: "success",
  CANCELLED: "destructive",
  COMPLETED: "muted",
} as const;

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function TrainingDetailPage({ params }: PageProps) {
  await requireRole("ADMIN");
  const { id } = await params;

  const [session, eligibleUsers, trainers] = await Promise.all([
    getSessionWithRegistrations(id),
    listEligibleUsersForSession(id),
    listActiveTrainers(),
  ]);

  if (!session) notFound();

  const isCancelled = session.status === "CANCELLED";
  const atCapacity =
    session.capacity != null &&
    session.registrations.length >= session.capacity;
  const canAddUsers = session.status === "SCHEDULED" && !atCapacity;

  return (
    <div>
      <PageHeading
        title={session.title}
        description={dateTimeFormat.format(session.startsAt)}
      />

      <Card>
        <CardContent className="flex flex-col gap-3 p-4">
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge variant={statusVariant[session.status]}>
              {session.status}
            </Badge>
            <Badge variant="primary">{session.category.name}</Badge>
            {session.templateId ? (
              <Badge variant="muted">Recurring</Badge>
            ) : (
              <Badge variant="muted">One-time</Badge>
            )}
          </div>
          {session.description ? (
            <p className="text-sm">{session.description}</p>
          ) : null}
          <dl className="text-muted-foreground grid grid-cols-1 gap-1 text-sm">
            <div>
              <span className="font-medium">Ends: </span>
              {dateTimeFormat.format(session.endsAt)}
            </div>
            {session.location ? (
              <div>
                <span className="font-medium">Location: </span>
                {session.location}
              </div>
            ) : null}
            <div>
              <span className="font-medium">Capacity: </span>
              {session.capacity ?? "Unlimited"}
            </div>
            {session.registrationDeadline ? (
              <div>
                <span className="font-medium">Registration closes: </span>
                {dateTimeFormat.format(session.registrationDeadline)}
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
          Edit training
        </Link>
        {isCancelled ? (
          <form action={restoreSession.bind(null, session.id)}>
            <Button type="submit" variant="secondary">
              Restore
            </Button>
          </form>
        ) : (
          <form action={cancelSession.bind(null, session.id)}>
            <Button type="submit" variant="destructive">
              Cancel training
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
        <RegistrationList session={session} />
        {showAttendanceSection(session) ? (
          <AttendanceList
            sessionId={session.id}
            registrations={session.registrations}
            canEdit={canEditAttendance(session)}
            lockedMessage={attendanceSectionMessage(session)}
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

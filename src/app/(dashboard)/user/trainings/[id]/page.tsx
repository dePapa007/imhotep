import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { RegisterButton } from "@/components/user/register-button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeading } from "@/components/layout/page-heading";
import { createTranslator } from "@/i18n/get-messages";
import { formatDateTime } from "@/i18n/format";
import { requireRole } from "@/server/auth/dal";
import { getSessionForUser } from "@/server/registrations/queries";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata(): Promise<Metadata> {
  const user = await requireRole("USER");
  const t = createTranslator(user.preferredLocale);
  return { title: t("user.trainingDetail") };
}

export default async function UserTrainingDetailPage({ params }: PageProps) {
  const user = await requireRole("USER");
  const t = createTranslator(user.preferredLocale);
  const locale = user.preferredLocale;
  const { id } = await params;
  const session = await getSessionForUser(id, user.id);

  if (!session) notFound();

  const trainerNames = session.trainers
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
            <Badge variant="primary">{session.category.name}</Badge>
            {session.isRegistered ? (
              <Badge variant="success">{t("user.registered")}</Badge>
            ) : null}
            {session.isRegistered &&
            session.attendanceStatus === "PRESENT" ? (
              <Badge variant="success">{t("user.youAttended")}</Badge>
            ) : null}
            {session.isRegistered && session.attendanceStatus === "ABSENT" ? (
              <Badge variant="destructive">{t("user.markedAbsent")}</Badge>
            ) : null}
          </div>
          {session.isRegistered && session.attendanceNotes ? (
            <p className="text-muted-foreground text-sm">
              <span className="font-medium">
                {t("admin.attendanceNoteLabel")}:{" "}
              </span>
              {session.attendanceNotes}
            </p>
          ) : null}
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
              <span className="font-medium">{t("session.trainers")}: </span>
              {trainerNames || t("admin.noneAssigned")}
            </div>
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

      <div className="mt-6">
        <RegisterButton
          sessionId={session.id}
          isRegistered={session.isRegistered}
          canRegister={session.canRegister}
          canCancel={session.canCancel}
          cannotRegisterReason={session.cannotRegisterReason}
        />
      </div>
    </div>
  );
}

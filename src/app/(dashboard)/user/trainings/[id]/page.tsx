import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { RegisterButton } from "@/components/user/register-button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeading } from "@/components/layout/page-heading";
import { requireRole } from "@/server/auth/dal";
import { getSessionForUser } from "@/server/registrations/queries";

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

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function UserTrainingDetailPage({ params }: PageProps) {
  const user = await requireRole("USER");
  const { id } = await params;
  const session = await getSessionForUser(id, user.id);

  if (!session) notFound();

  const trainerNames = session.trainers
    .map((t) => t.trainer.name)
    .join(", ");

  return (
    <div>
      <PageHeading
        title={session.title}
        description={dateTimeFormat.format(session.startsAt)}
      />

      <Card>
        <CardContent className="flex flex-col gap-3 p-4">
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge variant="primary">{session.category.name}</Badge>
            {session.isRegistered ? (
              <Badge variant="success">Registered</Badge>
            ) : null}
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
              <span className="font-medium">Trainers: </span>
              {trainerNames || "None assigned"}
            </div>
            <div>
              <span className="font-medium">Spots: </span>
              {session.capacity
                ? `${session._count.registrations} / ${session.capacity} registered`
                : `${session._count.registrations} registered`}
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

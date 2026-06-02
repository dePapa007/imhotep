import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { TrainerRegisteredList } from "@/components/trainer/trainer-registered-list";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeading } from "@/components/layout/page-heading";
import { requireRole } from "@/server/auth/dal";
import { getAssignedSessionForTrainer } from "@/server/trainer/queries";

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

export default async function TrainerTrainingDetailPage({ params }: PageProps) {
  const user = await requireRole("TRAINER");
  const { id } = await params;
  const session = await getAssignedSessionForTrainer(id, user.id);

  if (!session) notFound();

  const coTrainers = session.trainers
    .filter((t) => t.trainer.id !== user.id)
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
            <Badge variant={statusVariant[session.status]}>
              {session.status}
            </Badge>
            <Badge variant="primary">{session.category.name}</Badge>
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
            {coTrainers ? (
              <div>
                <span className="font-medium">Co-trainers: </span>
                {coTrainers}
              </div>
            ) : null}
            <div>
              <span className="font-medium">Spots: </span>
              {session.capacity
                ? `${session._count.registrations} / ${session.capacity} registered`
                : `${session._count.registrations} registered`}
            </div>
          </dl>
        </CardContent>
      </Card>

      <div className="mt-6">
        <TrainerRegisteredList session={session} />
      </div>
    </div>
  );
}

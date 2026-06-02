import type { Metadata } from "next";
import Link from "next/link";

import { TrainerSessionCard } from "@/components/trainer/trainer-session-card";
import { PageHeading } from "@/components/layout/page-heading";
import { buttonClasses } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { requireRole } from "@/server/auth/dal";
import {
  getNextAssignedSession,
  listAssignedSessions,
} from "@/server/trainer/queries";

export const metadata: Metadata = {
  title: "Trainer",
};

export const dynamic = "force-dynamic";

const dateTimeFormat = new Intl.DateTimeFormat("en-GB", {
  weekday: "short",
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

export default async function TrainerDashboardPage() {
  const user = await requireRole("TRAINER");

  const [nextSession, upcoming] = await Promise.all([
    getNextAssignedSession(user.id),
    listAssignedSessions(user.id, "upcoming"),
  ]);
  const preview = upcoming.slice(0, 3);

  return (
    <div>
      <PageHeading
        title={`Hi, ${user.name.split(" ")[0]}`}
        description="Your assigned trainings at a glance."
      />

      <section className="mb-6">
        <h2 className="mb-3 text-sm font-semibold">Next training</h2>
        {nextSession ? (
          <Card>
            <CardHeader>
              <CardTitle>{nextSession.title}</CardTitle>
              <CardDescription>
                {dateTimeFormat.format(nextSession.startsAt)}
                {nextSession.location ? ` · ${nextSession.location}` : ""}
              </CardDescription>
            </CardHeader>
            <div className="px-4 pb-4">
              <Link
                href={`/trainer/trainings/${nextSession.id}`}
                className={buttonClasses({ variant: "outline", size: "sm" })}
              >
                View details
              </Link>
            </div>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>No upcoming trainings</CardTitle>
              <CardDescription>
                You are not assigned to any upcoming sessions yet.
              </CardDescription>
            </CardHeader>
          </Card>
        )}
      </section>

      <Link href="/trainer/schedule" className={`${buttonClasses()} mb-6`}>
        View full schedule
      </Link>

      {preview.length > 0 ? (
        <section>
          <h2 className="mb-3 text-sm font-semibold">Coming up</h2>
          <div className="flex flex-col gap-3">
            {preview.map((session) => (
              <TrainerSessionCard key={session.id} session={session} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

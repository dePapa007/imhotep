import type { Metadata } from "next";
import Link from "next/link";

import { UserTrainingCard } from "@/components/user/user-training-card";
import { PageHeading } from "@/components/layout/page-heading";
import { buttonClasses } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { requireRole } from "@/server/auth/dal";
import {
  getNextRegisteredSession,
  listAvailableSessionsForUser,
} from "@/server/registrations/queries";

export const metadata: Metadata = {
  title: "Home",
};

export const dynamic = "force-dynamic";

const dateTimeFormat = new Intl.DateTimeFormat("en-GB", {
  weekday: "short",
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

export default async function UserHomePage() {
  const user = await requireRole("USER");

  if (!user.categoryId) {
    return (
      <div>
        <PageHeading
          title="Welcome"
          description="Your academy home for trainings and registrations."
        />
        <EmptyState
          title="No category assigned"
          description="Ask an administrator to assign you to a category to see eligible trainings."
        />
      </div>
    );
  }

  const [nextRegistered, available] = await Promise.all([
    getNextRegisteredSession(user.id),
    listAvailableSessionsForUser(user.id),
  ]);
  const preview = available.slice(0, 3);

  return (
    <div>
      <PageHeading
        title={`Hi, ${user.name.split(" ")[0]}`}
        description="Your upcoming trainings at a glance."
      />

      <section className="mb-6">
        <h2 className="mb-3 text-sm font-semibold">Next registered training</h2>
        {nextRegistered ? (
          <Card>
            <CardHeader>
              <CardTitle>{nextRegistered.title}</CardTitle>
              <CardDescription>
                {dateTimeFormat.format(nextRegistered.startsAt)}
              </CardDescription>
            </CardHeader>
            <div className="px-4 pb-4">
              <Link
                href={`/user/trainings/${nextRegistered.id}`}
                className={buttonClasses({ variant: "outline", size: "sm" })}
              >
                View details
              </Link>
            </div>
          </Card>
        ) : (
          <EmptyState
            title="No registrations yet"
            description="Browse available trainings to register for your next session."
            action={
              <Link href="/user/browse" className={buttonClasses()}>
                Browse trainings
              </Link>
            }
          />
        )}
      </section>

      <div className="mb-6 grid grid-cols-2 gap-3">
        <Link href="/user/browse" className={buttonClasses()}>
          Browse trainings
        </Link>
        <Link
          href="/user/my-trainings"
          className={buttonClasses({ variant: "outline" })}
        >
          My trainings
        </Link>
      </div>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold">Available trainings</h2>
          <Link href="/user/browse" className="text-primary text-xs font-medium">
            See all
          </Link>
        </div>
        {preview.length === 0 ? (
          <EmptyState
            title="Nothing available right now"
            description="No upcoming trainings in your category at the moment."
          />
        ) : (
          <div className="flex flex-col gap-3">
            {preview.map((session) => (
              <UserTrainingCard key={session.id} session={session} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

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
import { createTranslator } from "@/i18n/get-messages";
import { formatDateTimeMedium } from "@/i18n/format";
import { requireRole } from "@/server/auth/dal";
import {
  getNextAssignedSession,
  listAssignedSessions,
} from "@/server/trainer/queries";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const user = await requireRole("TRAINER");
  const t = createTranslator(user.preferredLocale);
  return { title: t("trainer.homeTitle") };
}

export default async function TrainerDashboardPage() {
  const user = await requireRole("TRAINER");
  const t = createTranslator(user.preferredLocale);
  const locale = user.preferredLocale;

  const [nextSession, upcoming] = await Promise.all([
    getNextAssignedSession(user.id),
    listAssignedSessions(user.id, "upcoming"),
  ]);
  const preview = upcoming.slice(0, 3);

  return (
    <div>
      <PageHeading
        title={t("user.hi", { name: user.name.split(" ")[0]! })}
        description={t("trainer.homeSubtitle")}
      />

      <section className="mb-6">
        <h2 className="mb-3 text-sm font-semibold">{t("trainer.nextTraining")}</h2>
        {nextSession ? (
          <Card>
            <CardHeader>
              <CardTitle>{nextSession.title}</CardTitle>
              <CardDescription>
                {formatDateTimeMedium(nextSession.startsAt, locale)}
                {nextSession.location ? ` · ${nextSession.location}` : ""}
              </CardDescription>
            </CardHeader>
            <div className="px-4 pb-4">
              <Link
                href={`/trainer/trainings/${nextSession.id}`}
                className={buttonClasses({ variant: "outline", size: "sm" })}
              >
                {t("user.viewDetails")}
              </Link>
            </div>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>{t("trainer.noUpcomingTitle")}</CardTitle>
              <CardDescription>{t("trainer.noUpcomingDesc")}</CardDescription>
            </CardHeader>
          </Card>
        )}
      </section>

      <Link href="/trainer/schedule" className={`${buttonClasses()} mb-6`}>
        {t("trainer.viewFullSchedule")}
      </Link>

      {preview.length > 0 ? (
        <section>
          <h2 className="mb-3 text-sm font-semibold">{t("trainer.comingUp")}</h2>
          <div className="flex flex-col gap-3">
            {preview.map((session) => (
              <TrainerSessionCard
                key={session.id}
                session={session}
                locale={locale}
              />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

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
import { createTranslator } from "@/i18n/get-messages";
import { formatDateTimeMedium } from "@/i18n/format";
import { requireRole } from "@/server/auth/dal";
import {
  getNextRegisteredSession,
  listAvailableSessionsForUser,
} from "@/server/registrations/queries";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const user = await requireRole("USER");
  const t = createTranslator(user.preferredLocale);
  return { title: t("user.homeTitle") };
}

export default async function UserHomePage() {
  const user = await requireRole("USER");
  const t = createTranslator(user.preferredLocale);
  const locale = user.preferredLocale;

  if (!user.categoryId) {
    return (
      <div>
        <PageHeading
          title={t("user.welcomeTitle")}
          description={t("user.homeDescription")}
        />
        <EmptyState
          title={t("user.noCategoryTitle")}
          description={t("user.noCategoryDesc")}
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
        title={t("user.hi", { name: user.name.split(" ")[0]! })}
        description={t("user.homeSubtitle")}
      />

      <section className="mb-6">
        <h2 className="mb-3 text-sm font-semibold">{t("user.nextTraining")}</h2>
        {nextRegistered ? (
          <Card>
            <CardHeader>
              <CardTitle>{nextRegistered.title}</CardTitle>
              <CardDescription>
                {formatDateTimeMedium(nextRegistered.startsAt, locale)}
              </CardDescription>
            </CardHeader>
            <div className="px-4 pb-4">
              <Link
                href={`/user/trainings/${nextRegistered.id}`}
                className={buttonClasses({ variant: "outline", size: "sm" })}
              >
                {t("user.viewDetails")}
              </Link>
            </div>
          </Card>
        ) : (
          <EmptyState
            title={t("user.noRegistrationsTitle")}
            description={t("user.noRegistrationsDesc")}
            action={
              <Link href="/user/browse" className={buttonClasses()}>
                {t("user.browseTrainings")}
              </Link>
            }
          />
        )}
      </section>

      <div className="mb-6 grid grid-cols-2 gap-3">
        <Link href="/user/browse" className={buttonClasses()}>
          {t("user.browseTrainings")}
        </Link>
        <Link
          href="/user/my-trainings"
          className={buttonClasses({ variant: "outline" })}
        >
          {t("user.myTrainings")}
        </Link>
      </div>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold">{t("user.availableTrainings")}</h2>
          <Link href="/user/browse" className="text-primary text-xs font-medium">
            {t("common.seeAll")}
          </Link>
        </div>
        {preview.length === 0 ? (
          <EmptyState
            title={t("user.nothingAvailableTitle")}
            description={t("user.nothingAvailableDesc")}
          />
        ) : (
          <div className="flex flex-col gap-3">
            {preview.map((session) => (
              <UserTrainingCard
                key={session.id}
                session={session}
                locale={locale}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

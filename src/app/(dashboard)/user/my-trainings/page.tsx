import type { Metadata } from "next";

import { RegisteredSessionsList } from "@/components/user/registered-sessions-list";
import { PageHeading } from "@/components/layout/page-heading";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createTranslator } from "@/i18n/get-messages";
import { requireRole } from "@/server/auth/dal";
import { listRegisteredSessionsForUser } from "@/server/registrations/queries";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const user = await requireRole("USER");
  const t = createTranslator(user.preferredLocale);
  return { title: t("user.myTrainingsTitle") };
}

export default async function UserMyTrainingsPage() {
  const user = await requireRole("USER");
  const t = createTranslator(user.preferredLocale);

  if (!user.categoryId) {
    return (
      <div>
        <PageHeading
          title={t("user.myTrainingsTitle")}
          description={t("user.myTrainingsDescription")}
        />
        <Card>
          <CardHeader>
            <CardTitle>{t("user.noCategoryTitle")}</CardTitle>
            <CardDescription>{t("user.noCategoryDesc")}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const sessions = await listRegisteredSessionsForUser(user.id);

  return (
    <div>
      <PageHeading
        title={t("user.myTrainingsTitle")}
        description={t("user.myTrainingsDescription")}
      />
      <RegisteredSessionsList
        sessions={sessions}
        locale={user.preferredLocale}
      />
    </div>
  );
}

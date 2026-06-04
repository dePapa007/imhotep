import type { Metadata } from "next";

import { PageHeading } from "@/components/layout/page-heading";
import { ProfileSettings } from "@/components/profile/profile-settings";
import { createTranslator } from "@/i18n/get-messages";
import { requireRole } from "@/server/auth/dal";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const user = await requireRole("ADMIN");
  const t = createTranslator(user.preferredLocale);
  return { title: t("profile.title") };
}

export default async function AdminProfilePage() {
  const user = await requireRole("ADMIN");
  const t = createTranslator(user.preferredLocale);

  return (
    <div>
      <PageHeading title={t("profile.title")} description={t("profile.description")} />
      <ProfileSettings
        name={user.name}
        email={user.email}
        roleLabel={t(`roles.${user.role}`)}
        currentLocale={user.preferredLocale}
      />
    </div>
  );
}

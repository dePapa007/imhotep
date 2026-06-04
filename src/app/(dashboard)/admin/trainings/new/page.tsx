import type { Metadata } from "next";

import { TrainingForm } from "@/components/admin/training-form";
import { PageHeading } from "@/components/layout/page-heading";
import { createTranslator } from "@/i18n/get-messages";
import { requireRole } from "@/server/auth/dal";
import { createTraining } from "@/server/trainings/actions";
import { listActiveTrainers } from "@/server/trainings/queries";
import { listCategories } from "@/server/users/queries";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const user = await requireRole("ADMIN");
  const t = createTranslator(user.preferredLocale);
  return { title: t("admin.newTraining") };
}

export default async function NewTrainingPage() {
  const user = await requireRole("ADMIN");
  const t = createTranslator(user.preferredLocale);
  const [categories, trainers] = await Promise.all([
    listCategories(),
    listActiveTrainers(),
  ]);

  return (
    <div>
      <PageHeading
        title={t("admin.newTraining")}
        description={t("admin.newTrainingDescription")}
      />
      <TrainingForm
        action={createTraining}
        mode="create"
        categories={categories}
        trainers={trainers}
      />
    </div>
  );
}

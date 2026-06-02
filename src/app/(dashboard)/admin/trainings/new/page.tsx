import type { Metadata } from "next";

import { TrainingForm } from "@/components/admin/training-form";
import { PageHeading } from "@/components/layout/page-heading";
import { requireRole } from "@/server/auth/dal";
import { createTraining } from "@/server/trainings/actions";
import { listActiveTrainers } from "@/server/trainings/queries";
import { listCategories } from "@/server/users/queries";

export const metadata: Metadata = {
  title: "New training",
};

export const dynamic = "force-dynamic";

export default async function NewTrainingPage() {
  await requireRole("ADMIN");
  const [categories, trainers] = await Promise.all([
    listCategories(),
    listActiveTrainers(),
  ]);

  return (
    <div>
      <PageHeading
        title="New training"
        description="Schedule a one-time or recurring training."
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

import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { TrainingForm } from "@/components/admin/training-form";
import { PageHeading } from "@/components/layout/page-heading";
import { createTranslator } from "@/i18n/get-messages";
import { requireRole } from "@/server/auth/dal";
import { updateSession } from "@/server/trainings/actions";
import {
  getSessionById,
  listActiveTrainers,
} from "@/server/trainings/queries";
import { listCategories } from "@/server/users/queries";

export const dynamic = "force-dynamic";

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

function toDateInput(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function toTimeInput(date: Date): string {
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata(): Promise<Metadata> {
  const user = await requireRole("ADMIN");
  const t = createTranslator(user.preferredLocale);
  return { title: t("admin.editTraining") };
}

export default async function EditTrainingPage({ params }: PageProps) {
  const user = await requireRole("ADMIN");
  const t = createTranslator(user.preferredLocale);
  const { id } = await params;

  const [session, categories, trainers] = await Promise.all([
    getSessionById(id),
    listCategories(),
    listActiveTrainers(),
  ]);

  if (!session) notFound();

  const deadlineHours = session.registrationDeadline
    ? Math.round(
        (session.startsAt.getTime() - session.registrationDeadline.getTime()) /
          (60 * 60 * 1000),
      )
    : null;

  const updateSessionWithId = updateSession.bind(null, session.id);

  return (
    <div>
      <PageHeading
        title={t("admin.editTraining")}
        description={t("admin.editTrainingDescription")}
      />
      <TrainingForm
        action={updateSessionWithId}
        mode="edit"
        categories={categories}
        trainers={trainers}
        defaults={{
          title: session.title,
          description: session.description,
          categoryId: session.categoryId,
          location: session.location,
          date: toDateInput(session.startsAt),
          startTime: toTimeInput(session.startsAt),
          endTime: toTimeInput(session.endsAt),
          capacity: session.capacity,
          registrationDeadlineHours: deadlineHours,
          trainerIds: session.trainers.map((tr) => tr.trainer.id),
        }}
      />
    </div>
  );
}

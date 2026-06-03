"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { combineDateTime, generateOccurrences } from "@/lib/recurrence";
import { checkRegistrationEligibility } from "@/lib/registration-eligibility";
import {
  createTrainingSchema,
  updateSessionSchema,
  type TrainingFormState,
} from "@/lib/validators/training";
import { requireRole } from "@/server/auth/dal";
import {
  notifyRegistrationConfirmation,
  notifySessionCancelled,
  notifyTrainerAssigned,
  notifyTrainerAssignments,
} from "@/server/notifications/dispatch";

function formArray(formData: FormData, key: string): string[] {
  return formData.getAll(key).map(String);
}

export async function createTraining(
  _prevState: TrainingFormState,
  formData: FormData,
): Promise<TrainingFormState> {
  await requireRole("ADMIN");

  const parsed = createTrainingSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    categoryId: formData.get("categoryId"),
    location: formData.get("location"),
    startDate: formData.get("startDate"),
    endDate: formData.get("endDate"),
    startTime: formData.get("startTime"),
    endTime: formData.get("endTime"),
    recurrenceType: formData.get("recurrenceType"),
    capacity: formData.get("capacity"),
    registrationDeadlineHours: formData.get("registrationDeadlineHours"),
    trainerIds: formArray(formData, "trainerIds"),
  });

  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  const data = parsed.data;

  const category = await prisma.category.findUnique({
    where: { id: data.categoryId },
    select: { id: true },
  });
  if (!category) {
    return { fieldErrors: { categoryId: ["Select a valid category"] } };
  }

  const occurrences = generateOccurrences({
    startDate: data.startDate,
    endDate: data.endDate,
    startTime: data.startTime,
    endTime: data.endTime,
    recurrenceType: data.recurrenceType,
    registrationDeadlineHours: data.registrationDeadlineHours,
  });

  const trainerAssignments: { sessionId: string; trainerId: string }[] = [];

  await prisma.$transaction(async (tx) => {
    let templateId: string | null = null;

    if (data.recurrenceType !== "NONE") {
      const template = await tx.trainingTemplate.create({
        data: {
          title: data.title,
          description: data.description,
          categoryId: data.categoryId,
          location: data.location,
          recurrenceType: data.recurrenceType,
          startDate: combineDateTime(data.startDate, data.startTime),
          endDate: data.endDate
            ? combineDateTime(data.endDate, data.endTime)
            : null,
          startTime: data.startTime,
          endTime: data.endTime,
          capacity: data.capacity ?? null,
        },
        select: { id: true },
      });
      templateId = template.id;
    }

    for (const occurrence of occurrences) {
      const session = await tx.trainingSession.create({
        data: {
          templateId,
          title: data.title,
          description: data.description,
          categoryId: data.categoryId,
          location: data.location,
          startsAt: occurrence.startsAt,
          endsAt: occurrence.endsAt,
          capacity: data.capacity ?? null,
          registrationDeadline: occurrence.registrationDeadline,
          trainers: {
            create: data.trainerIds.map((trainerId) => ({ trainerId })),
          },
        },
        select: { id: true },
      });

      for (const trainerId of data.trainerIds) {
        trainerAssignments.push({ sessionId: session.id, trainerId });
      }
    }
  });

  if (trainerAssignments.length > 0) {
    notifyTrainerAssignments(trainerAssignments);
  }

  revalidatePath("/admin/trainings");
  redirect("/admin/trainings");
}

export async function updateSession(
  id: string,
  _prevState: TrainingFormState,
  formData: FormData,
): Promise<TrainingFormState> {
  await requireRole("ADMIN");

  const parsed = updateSessionSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    categoryId: formData.get("categoryId"),
    location: formData.get("location"),
    date: formData.get("date"),
    startTime: formData.get("startTime"),
    endTime: formData.get("endTime"),
    capacity: formData.get("capacity"),
    registrationDeadlineHours: formData.get("registrationDeadlineHours"),
    trainerIds: formArray(formData, "trainerIds"),
  });

  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  const data = parsed.data;

  const category = await prisma.category.findUnique({
    where: { id: data.categoryId },
    select: { id: true },
  });
  if (!category) {
    return { fieldErrors: { categoryId: ["Select a valid category"] } };
  }

  const startsAt = combineDateTime(data.date, data.startTime);
  const endsAt = combineDateTime(data.date, data.endTime);
  const registrationDeadline =
    data.registrationDeadlineHours != null
      ? new Date(
          startsAt.getTime() - data.registrationDeadlineHours * 60 * 60 * 1000,
        )
      : null;

  const existingTrainers = await prisma.trainingTrainer.findMany({
    where: { trainingSessionId: id },
    select: { trainerId: true },
  });
  const previousTrainerIds = new Set(
    existingTrainers.map((row) => row.trainerId),
  );

  await prisma.$transaction(async (tx) => {
    await tx.trainingTrainer.deleteMany({ where: { trainingSessionId: id } });
    await tx.trainingSession.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        categoryId: data.categoryId,
        location: data.location,
        startsAt,
        endsAt,
        capacity: data.capacity ?? null,
        registrationDeadline,
        trainers: {
          create: data.trainerIds.map((trainerId) => ({ trainerId })),
        },
      },
    });
  });

  const addedTrainerIds = data.trainerIds.filter(
    (trainerId) => !previousTrainerIds.has(trainerId),
  );
  notifyTrainerAssignments(
    addedTrainerIds.map((trainerId) => ({ sessionId: id, trainerId })),
  );

  revalidatePath("/admin/trainings");
  revalidatePath(`/admin/trainings/${id}`);
  redirect(`/admin/trainings/${id}`);
}

export async function cancelSession(id: string): Promise<void> {
  await requireRole("ADMIN");
  await prisma.trainingSession.update({
    where: { id },
    data: { status: "CANCELLED" },
  });
  notifySessionCancelled(id);
  revalidatePath("/admin/trainings");
  revalidatePath(`/admin/trainings/${id}`);
}

export async function restoreSession(id: string): Promise<void> {
  await requireRole("ADMIN");
  await prisma.trainingSession.update({
    where: { id },
    data: { status: "SCHEDULED" },
  });
  revalidatePath("/admin/trainings");
  revalidatePath(`/admin/trainings/${id}`);
}

export interface ActionResult {
  error?: string;
}

export async function addRegistration(
  sessionId: string,
  userId: string,
): Promise<ActionResult> {
  await requireRole("ADMIN");

  const session = await prisma.trainingSession.findUnique({
    where: { id: sessionId },
    select: {
      categoryId: true,
      status: true,
      startsAt: true,
      capacity: true,
      registrationDeadline: true,
      _count: {
        select: {
          registrations: { where: { status: "REGISTERED" } },
        },
      },
    },
  });
  if (!session) return { error: "Training not found." };

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true, active: true, categoryId: true },
  });
  if (!user || user.role !== "USER") {
    return { error: "Select a valid active member." };
  }

  const existing = await prisma.trainingRegistration.findUnique({
    where: {
      trainingSessionId_userId: { trainingSessionId: sessionId, userId },
    },
    select: { status: true },
  });

  const eligibility = checkRegistrationEligibility({
    session: {
      ...session,
      registeredCount: session._count.registrations,
    },
    user,
    existingStatus: existing?.status,
    bypassDeadline: true,
  });
  if (!eligibility.ok) return { error: eligibility.reason };

  if (existing) {
    await prisma.trainingRegistration.update({
      where: {
        trainingSessionId_userId: { trainingSessionId: sessionId, userId },
      },
      data: { status: "REGISTERED", registeredAt: new Date() },
    });
  } else {
    await prisma.trainingRegistration.create({
      data: { trainingSessionId: sessionId, userId, status: "REGISTERED" },
    });
  }

  revalidatePath("/admin/trainings");
  revalidatePath(`/admin/trainings/${sessionId}`);
  notifyRegistrationConfirmation(
    sessionId,
    userId,
    session._count.registrations,
    session.capacity,
  );
  return {};
}

export async function removeRegistration(
  sessionId: string,
  userId: string,
): Promise<void> {
  await requireRole("ADMIN");

  await prisma.trainingRegistration.updateMany({
    where: {
      trainingSessionId: sessionId,
      userId,
      status: "REGISTERED",
    },
    data: { status: "CANCELLED" },
  });

  revalidatePath("/admin/trainings");
  revalidatePath(`/admin/trainings/${sessionId}`);
}

export async function addTrainerToSession(
  sessionId: string,
  trainerId: string,
): Promise<ActionResult> {
  await requireRole("ADMIN");

  const trainer = await prisma.user.findUnique({
    where: { id: trainerId },
    select: { id: true, role: true, active: true },
  });
  if (!trainer || !trainer.active || trainer.role !== "TRAINER") {
    return { error: "Select a valid active trainer." };
  }

  const existing = await prisma.trainingTrainer.findUnique({
    where: {
      trainingSessionId_trainerId: { trainingSessionId: sessionId, trainerId },
    },
  });
  if (existing) return { error: "Trainer is already assigned." };

  await prisma.trainingTrainer.create({
    data: { trainingSessionId: sessionId, trainerId },
  });

  notifyTrainerAssigned(sessionId, trainerId);

  revalidatePath("/admin/trainings");
  revalidatePath(`/admin/trainings/${sessionId}`);
  return {};
}

export async function removeTrainerFromSession(
  sessionId: string,
  trainerId: string,
): Promise<void> {
  await requireRole("ADMIN");

  await prisma.trainingTrainer.deleteMany({
    where: { trainingSessionId: sessionId, trainerId },
  });

  revalidatePath("/admin/trainings");
  revalidatePath(`/admin/trainings/${sessionId}`);
}

export async function addRegistrationFromForm(
  sessionId: string,
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const userId = formData.get("userId");
  if (typeof userId !== "string" || !userId) {
    return { error: "Select a member." };
  }
  return addRegistration(sessionId, userId);
}

export async function addTrainerFromForm(
  sessionId: string,
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const trainerId = formData.get("trainerId");
  if (typeof trainerId !== "string" || !trainerId) {
    return { error: "Select a trainer." };
  }
  return addTrainerToSession(sessionId, trainerId);
}

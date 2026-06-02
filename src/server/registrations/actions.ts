"use server";

import { revalidatePath } from "next/cache";

import {
  checkCancellationEligibility,
  checkRegistrationEligibility,
} from "@/lib/registration-eligibility";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/server/auth/dal";

export interface ActionResult {
  error?: string;
}

function revalidateUserPaths(sessionId: string) {
  revalidatePath("/user");
  revalidatePath("/user/browse");
  revalidatePath("/user/my-trainings");
  revalidatePath(`/user/trainings/${sessionId}`);
}

export async function registerForSession(
  sessionId: string,
): Promise<ActionResult> {
  const user = await requireRole("USER");

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

  const existing = await prisma.trainingRegistration.findUnique({
    where: {
      trainingSessionId_userId: {
        trainingSessionId: sessionId,
        userId: user.id,
      },
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
  });
  if (!eligibility.ok) return { error: eligibility.reason };

  if (existing) {
    await prisma.trainingRegistration.update({
      where: {
        trainingSessionId_userId: {
          trainingSessionId: sessionId,
          userId: user.id,
        },
      },
      data: { status: "REGISTERED", registeredAt: new Date() },
    });
  } else {
    await prisma.trainingRegistration.create({
      data: {
        trainingSessionId: sessionId,
        userId: user.id,
        status: "REGISTERED",
      },
    });
  }

  revalidateUserPaths(sessionId);
  return {};
}

export async function cancelMyRegistration(
  sessionId: string,
): Promise<ActionResult> {
  const user = await requireRole("USER");

  const session = await prisma.trainingSession.findUnique({
    where: { id: sessionId },
    select: { startsAt: true, categoryId: true },
  });
  if (!session || session.categoryId !== user.categoryId) {
    return { error: "Training not found." };
  }

  const existing = await prisma.trainingRegistration.findUnique({
    where: {
      trainingSessionId_userId: {
        trainingSessionId: sessionId,
        userId: user.id,
      },
    },
    select: { status: true },
  });

  const eligibility = checkCancellationEligibility({
    existingStatus: existing?.status,
    sessionStartsAt: session.startsAt,
  });
  if (!eligibility.ok) return { error: eligibility.reason };

  await prisma.trainingRegistration.update({
    where: {
      trainingSessionId_userId: {
        trainingSessionId: sessionId,
        userId: user.id,
      },
    },
    data: { status: "CANCELLED" },
  });

  revalidateUserPaths(sessionId);
  return {};
}

export async function registerForSessionFromForm(
  sessionId: string,
  _prev: ActionResult,
  _formData: FormData,
): Promise<ActionResult> {
  void _prev;
  void _formData;
  return registerForSession(sessionId);
}

export async function cancelMyRegistrationFromForm(
  sessionId: string,
  _prev: ActionResult,
  _formData: FormData,
): Promise<ActionResult> {
  void _prev;
  void _formData;
  return cancelMyRegistration(sessionId);
}

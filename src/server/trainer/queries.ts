import "server-only";

import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

export type ScheduleFilter = "upcoming" | "past" | "cancelled";

export const SCHEDULE_FILTERS: ScheduleFilter[] = [
  "upcoming",
  "past",
  "cancelled",
];

const sessionSelect = {
  id: true,
  title: true,
  description: true,
  location: true,
  startsAt: true,
  endsAt: true,
  capacity: true,
  registrationDeadline: true,
  status: true,
  category: { select: { id: true, name: true } },
  trainers: {
    select: { trainer: { select: { id: true, name: true } } },
  },
  _count: {
    select: {
      registrations: { where: { status: "REGISTERED" } },
    },
  },
} satisfies Prisma.TrainingSessionSelect;

export type TrainerSessionItem = Prisma.TrainingSessionGetPayload<{
  select: typeof sessionSelect;
}>;

function assignedWhere(
  trainerId: string,
  filter: ScheduleFilter,
): Prisma.TrainingSessionWhereInput {
  const now = new Date();
  const base: Prisma.TrainingSessionWhereInput = {
    trainers: { some: { trainerId } },
  };

  switch (filter) {
    case "upcoming":
      return {
        ...base,
        status: "SCHEDULED",
        startsAt: { gte: now },
      };
    case "past":
      return {
        ...base,
        startsAt: { lt: now },
      };
    case "cancelled":
      return {
        ...base,
        status: "CANCELLED",
      };
  }
}

export async function listAssignedSessions(
  trainerId: string,
  filter: ScheduleFilter = "upcoming",
) {
  return prisma.trainingSession.findMany({
    where: assignedWhere(trainerId, filter),
    select: sessionSelect,
    orderBy: { startsAt: filter === "past" ? "desc" : "asc" },
  });
}

export async function getNextAssignedSession(trainerId: string) {
  const sessions = await listAssignedSessions(trainerId, "upcoming");
  return sessions[0] ?? null;
}

export async function getAssignedSessionForTrainer(
  sessionId: string,
  trainerId: string,
) {
  const assignment = await prisma.trainingTrainer.findUnique({
    where: {
      trainingSessionId_trainerId: {
        trainingSessionId: sessionId,
        trainerId,
      },
    },
    select: { id: true },
  });
  if (!assignment) return null;

  return prisma.trainingSession.findUnique({
    where: { id: sessionId },
    select: {
      ...sessionSelect,
      registrations: {
        where: { status: "REGISTERED" },
        select: {
          id: true,
          status: true,
          registeredAt: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              category: { select: { name: true } },
            },
          },
        },
        orderBy: { registeredAt: "asc" },
      },
    },
  });
}

export type TrainerSessionDetail = NonNullable<
  Awaited<ReturnType<typeof getAssignedSessionForTrainer>>
>;

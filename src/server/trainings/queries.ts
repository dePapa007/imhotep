import "server-only";

import type { Prisma, SessionStatus } from "@prisma/client";

import { prisma } from "@/lib/prisma";

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
  _count: { select: { registrations: true } },
} satisfies Prisma.TrainingSessionSelect;

export interface ListSessionsFilters {
  from?: Date;
  to?: Date;
  categoryId?: string;
  status?: SessionStatus;
  trainerId?: string;
}

export async function listSessions(filters: ListSessionsFilters = {}) {
  const where: Prisma.TrainingSessionWhereInput = {};

  if (filters.categoryId) where.categoryId = filters.categoryId;
  if (filters.status) where.status = filters.status;
  if (filters.trainerId) {
    where.trainers = { some: { trainerId: filters.trainerId } };
  }
  if (filters.from || filters.to) {
    where.startsAt = {};
    if (filters.from) where.startsAt.gte = filters.from;
    if (filters.to) where.startsAt.lte = filters.to;
  }

  return prisma.trainingSession.findMany({
    where,
    select: sessionSelect,
    orderBy: { startsAt: "asc" },
  });
}

export type SessionListItem = Awaited<ReturnType<typeof listSessions>>[number];

/** Upcoming sessions a trainer is assigned to. */
export async function listSessionsForTrainer(trainerId: string) {
  return prisma.trainingSession.findMany({
    where: {
      trainers: { some: { trainerId } },
      startsAt: { gte: new Date() },
    },
    select: sessionSelect,
    orderBy: { startsAt: "asc" },
  });
}

/** Upcoming, scheduled sessions in a user's category. */
export async function listSessionsForUser(categoryId: string) {
  return prisma.trainingSession.findMany({
    where: {
      categoryId,
      status: "SCHEDULED",
      startsAt: { gte: new Date() },
    },
    select: sessionSelect,
    orderBy: { startsAt: "asc" },
  });
}

export async function getSessionById(id: string) {
  return prisma.trainingSession.findUnique({
    where: { id },
    select: {
      ...sessionSelect,
      categoryId: true,
      templateId: true,
    },
  });
}

export type SessionDetail = NonNullable<
  Awaited<ReturnType<typeof getSessionById>>
>;

export async function getSessionWithRegistrations(id: string) {
  return prisma.trainingSession.findUnique({
    where: { id },
    select: {
      ...sessionSelect,
      categoryId: true,
      templateId: true,
      registrations: {
        where: { status: "REGISTERED" },
        select: {
          id: true,
          userId: true,
          registeredAt: true,
          attendanceStatus: true,
          attendanceNotes: true,
          attendanceMarkedAt: true,
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
      trainers: {
        select: {
          id: true,
          trainerId: true,
          trainer: { select: { id: true, name: true } },
        },
      },
    },
  });
}

export type SessionWithRegistrations = NonNullable<
  Awaited<ReturnType<typeof getSessionWithRegistrations>>
>;

export async function listEligibleUsersForSession(sessionId: string) {
  const session = await prisma.trainingSession.findUnique({
    where: { id: sessionId },
    select: {
      categoryId: true,
      capacity: true,
      status: true,
      _count: {
        select: {
          registrations: { where: { status: "REGISTERED" } },
        },
      },
    },
  });
  if (!session || session.status !== "SCHEDULED") return [];

  const registeredIds = await prisma.trainingRegistration.findMany({
    where: { trainingSessionId: sessionId, status: "REGISTERED" },
    select: { userId: true },
  });
  const exclude = registeredIds.map((r) => r.userId);

  const atCapacity =
    session.capacity != null &&
    session._count.registrations >= session.capacity;

  if (atCapacity) return [];

  return prisma.user.findMany({
    where: {
      role: "USER",
      active: true,
      categoryId: session.categoryId,
      id: { notIn: exclude },
    },
    select: { id: true, name: true, email: true },
    orderBy: { name: "asc" },
  });
}

export type EligibleUser = Awaited<
  ReturnType<typeof listEligibleUsersForSession>
>[number];

/** Active trainers for the assignment checkbox list. */
export async function listActiveTrainers() {
  return prisma.user.findMany({
    where: { role: "TRAINER", active: true },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
}

export type TrainerOption = Awaited<
  ReturnType<typeof listActiveTrainers>
>[number];

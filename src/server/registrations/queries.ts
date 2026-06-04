import "server-only";

import type { Prisma } from "@prisma/client";

import {
  checkCancellationEligibility,
  checkRegistrationEligibility,
} from "@/lib/registration-eligibility";
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
  categoryId: true,
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

type SessionRow = Prisma.TrainingSessionGetPayload<{
  select: typeof sessionSelect;
}>;

export type UserSessionItem = SessionRow & { isRegistered: boolean };

async function getUserContext(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, active: true, categoryId: true },
  });
}

async function registrationMap(userId: string, sessionIds: string[]) {
  if (sessionIds.length === 0) return new Map<string, boolean>();

  const registrations = await prisma.trainingRegistration.findMany({
    where: {
      userId,
      trainingSessionId: { in: sessionIds },
      status: "REGISTERED",
    },
    select: { trainingSessionId: true },
  });

  return new Map(
    registrations.map((r) => [r.trainingSessionId, true] as const),
  );
}

function annotateSessions(
  sessions: SessionRow[],
  registered: Map<string, boolean>,
): UserSessionItem[] {
  return sessions.map((session) => ({
    ...session,
    isRegistered: registered.get(session.id) ?? false,
  }));
}

export interface ListAvailableFilters {
  from?: Date;
  to?: Date;
}

export async function listAvailableSessionsForUser(
  userId: string,
  filters: ListAvailableFilters = {},
) {
  const user = await getUserContext(userId);
  if (!user?.categoryId) return [];

  const now = new Date();
  const from =
    filters.from && filters.from.getTime() > now.getTime()
      ? filters.from
      : now;

  const where: Prisma.TrainingSessionWhereInput = {
    categoryId: user.categoryId,
    status: "SCHEDULED",
    startsAt: { gte: from, ...(filters.to ? { lte: filters.to } : {}) },
  };

  const sessions = await prisma.trainingSession.findMany({
    where,
    select: sessionSelect,
    orderBy: { startsAt: "asc" },
  });

  const registered = await registrationMap(
    userId,
    sessions.map((s) => s.id),
  );
  return annotateSessions(sessions, registered);
}

export async function listRegisteredSessionsForUser(userId: string) {
  const registrations = await prisma.trainingRegistration.findMany({
    where: {
      userId,
      status: "REGISTERED",
      trainingSession: { startsAt: { gte: new Date() } },
    },
    select: {
      trainingSession: { select: sessionSelect },
    },
    orderBy: { trainingSession: { startsAt: "asc" } },
  });

  return registrations.map((r) => ({
    ...r.trainingSession,
    isRegistered: true,
  }));
}

export async function getNextRegisteredSession(userId: string) {
  const sessions = await listRegisteredSessionsForUser(userId);
  return sessions[0] ?? null;
}

export async function getSessionForUser(sessionId: string, userId: string) {
  const user = await getUserContext(userId);
  if (!user?.categoryId) return null;

  const session = await prisma.trainingSession.findUnique({
    where: { id: sessionId },
    select: {
      ...sessionSelect,
      _count: {
        select: {
          registrations: { where: { status: "REGISTERED" } },
        },
      },
    },
  });
  if (!session || session.categoryId !== user.categoryId) return null;

  const registration = await prisma.trainingRegistration.findUnique({
    where: {
      trainingSessionId_userId: { trainingSessionId: sessionId, userId },
    },
    select: {
      status: true,
      attendanceStatus: true,
      attendanceNotes: true,
    },
  });

  const isRegistered = registration?.status === "REGISTERED";
  const eligibility = checkRegistrationEligibility({
    session: {
      status: session.status,
      categoryId: session.categoryId,
      startsAt: session.startsAt,
      capacity: session.capacity,
      registrationDeadline: session.registrationDeadline,
      registeredCount: session._count.registrations,
    },
    user,
    existingStatus: registration?.status,
  });

  const canCancel = checkCancellationEligibility({
    existingStatus: registration?.status,
    sessionStartsAt: session.startsAt,
  }).ok;

  return {
    ...session,
    isRegistered,
    canRegister: eligibility.ok,
    cannotRegisterReason: eligibility.ok ? null : eligibility.reason,
    canCancel,
    attendanceStatus: registration?.attendanceStatus ?? "UNMARKED",
    attendanceNotes: registration?.attendanceNotes ?? null,
  };
}

export type UserSessionDetail = NonNullable<
  Awaited<ReturnType<typeof getSessionForUser>>
>;

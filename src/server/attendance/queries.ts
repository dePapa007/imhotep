import "server-only";

import type { Role } from "@prisma/client";

import { prisma } from "@/lib/prisma";

export const registrationAttendanceSelect = {
  id: true,
  attendanceStatus: true,
  attendanceNotes: true,
  attendanceMarkedAt: true,
  userId: true,
  user: {
    select: {
      id: true,
      name: true,
      email: true,
      category: { select: { name: true } },
    },
  },
} as const;

export async function getSessionForAttendanceManagement(
  sessionId: string,
  userId: string,
  role: Role,
) {
  const session = await prisma.trainingSession.findUnique({
    where: { id: sessionId },
    select: { id: true, status: true },
  });
  if (!session || session.status === "CANCELLED") return null;

  if (role === "ADMIN") return session;

  if (role === "TRAINER") {
    const assignment = await prisma.trainingTrainer.findUnique({
      where: {
        trainingSessionId_trainerId: {
          trainingSessionId: sessionId,
          trainerId: userId,
        },
      },
      select: { id: true },
    });
    return assignment ? session : null;
  }

  return null;
}

export async function listAttendanceHistoryForUser(userId: string) {
  return prisma.trainingRegistration.findMany({
    where: {
      userId,
      status: "REGISTERED",
      trainingSession: {
        status: { not: "CANCELLED" },
        startsAt: { lt: new Date() },
      },
    },
    select: {
      id: true,
      attendanceStatus: true,
      attendanceNotes: true,
      attendanceMarkedAt: true,
      trainingSession: {
        select: {
          id: true,
          title: true,
          startsAt: true,
          status: true,
        },
      },
    },
    orderBy: { trainingSession: { startsAt: "desc" } },
    take: 50,
  });
}

export type AttendanceHistoryItem = Awaited<
  ReturnType<typeof listAttendanceHistoryForUser>
>[number];

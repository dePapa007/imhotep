import "server-only";

import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import {
  sessionStartsInRange,
  type ReportRangeBounds,
} from "@/lib/report-range";

function sessionWhere(bounds: ReportRangeBounds): Prisma.TrainingSessionWhereInput {
  const startsAt = sessionStartsInRange(bounds);
  return startsAt ? { startsAt } : {};
}

function registrationWhere(
  bounds: ReportRangeBounds,
): Prisma.TrainingRegistrationWhereInput {
  return {
    status: "REGISTERED",
    trainingSession: sessionWhere(bounds),
  };
}

export interface DashboardMetrics {
  sessionCount: number;
  registrationCount: number;
  attendanceRate: number | null;
  activeParticipants: number;
}

export async function getDashboardMetrics(
  bounds: ReportRangeBounds,
): Promise<DashboardMetrics> {
  const sessionFilter = sessionWhere(bounds);
  const regFilter = registrationWhere(bounds);

  const [sessionCount, registrationCount, activeParticipants, attendance] =
    await Promise.all([
      prisma.trainingSession.count({ where: sessionFilter }),
      prisma.trainingRegistration.count({ where: regFilter }),
      prisma.trainingRegistration
        .groupBy({
          by: ["userId"],
          where: regFilter,
        })
        .then((rows) => rows.length),
      prisma.trainingRegistration.groupBy({
        by: ["attendanceStatus"],
        where: {
          ...regFilter,
          trainingSession: {
            ...sessionFilter,
            status: { not: "CANCELLED" },
            startsAt: { lt: new Date() },
          },
          attendanceStatus: { in: ["PRESENT", "ABSENT"] },
        },
        _count: { _all: true },
      }),
    ]);

  const present =
    attendance.find((a) => a.attendanceStatus === "PRESENT")?._count._all ?? 0;
  const absent =
    attendance.find((a) => a.attendanceStatus === "ABSENT")?._count._all ?? 0;
  const marked = present + absent;
  const attendanceRate =
    marked > 0 ? Math.round((present / marked) * 100) : null;

  return {
    sessionCount,
    registrationCount,
    attendanceRate,
    activeParticipants,
  };
}

export interface TrainingRegistrationReportRow {
  id: string;
  title: string;
  startsAt: Date;
  status: string;
  categoryName: string;
  capacity: number | null;
  registered: number;
  present: number;
  absent: number;
  unmarked: number;
}

export async function listRegistrationsPerTraining(
  bounds: ReportRangeBounds,
): Promise<TrainingRegistrationReportRow[]> {
  const sessions = await prisma.trainingSession.findMany({
    where: sessionWhere(bounds),
    select: {
      id: true,
      title: true,
      startsAt: true,
      status: true,
      capacity: true,
      category: { select: { name: true } },
      registrations: {
        where: { status: "REGISTERED" },
        select: { attendanceStatus: true },
      },
    },
    orderBy: { startsAt: "desc" },
  });

  return sessions.map((s) => {
    let present = 0;
    let absent = 0;
    let unmarked = 0;
    for (const r of s.registrations) {
      if (r.attendanceStatus === "PRESENT") present++;
      else if (r.attendanceStatus === "ABSENT") absent++;
      else unmarked++;
    }
    return {
      id: s.id,
      title: s.title,
      startsAt: s.startsAt,
      status: s.status,
      categoryName: s.category.name,
      capacity: s.capacity,
      registered: s.registrations.length,
      present,
      absent,
      unmarked,
    };
  });
}

export interface CategoryActivityRow {
  categoryId: string;
  categoryName: string;
  sessionCount: number;
  registrationCount: number;
}

export async function listCategoryActivity(
  bounds: ReportRangeBounds,
): Promise<CategoryActivityRow[]> {
  const sessions = await prisma.trainingSession.groupBy({
    by: ["categoryId"],
    where: sessionWhere(bounds),
    _count: { _all: true },
  });

  if (sessions.length === 0) return [];

  const categoryIds = sessions.map((s) => s.categoryId);
  const categories = await prisma.category.findMany({
    where: { id: { in: categoryIds } },
    select: { id: true, name: true },
  });
  const nameById = new Map(categories.map((c) => [c.id, c.name]));

  const registrations = await prisma.trainingRegistration.groupBy({
    by: ["trainingSessionId"],
    where: registrationWhere(bounds),
    _count: { _all: true },
  });

  const sessionCategory = await prisma.trainingSession.findMany({
    where: { id: { in: registrations.map((r) => r.trainingSessionId) } },
    select: { id: true, categoryId: true },
  });
  const categoryBySession = new Map(
    sessionCategory.map((s) => [s.id, s.categoryId]),
  );

  const regCountByCategory = new Map<string, number>();
  for (const row of registrations) {
    const categoryId = categoryBySession.get(row.trainingSessionId);
    if (!categoryId) continue;
    regCountByCategory.set(
      categoryId,
      (regCountByCategory.get(categoryId) ?? 0) + row._count._all,
    );
  }

  return sessions
    .map((s) => ({
      categoryId: s.categoryId,
      categoryName: nameById.get(s.categoryId) ?? "Unknown",
      sessionCount: s._count._all,
      registrationCount: regCountByCategory.get(s.categoryId) ?? 0,
    }))
    .sort((a, b) => b.sessionCount - a.sessionCount);
}

export interface TrainerWorkloadRow {
  trainerId: string;
  trainerName: string;
  sessionCount: number;
}

export async function listTrainerWorkload(
  bounds: ReportRangeBounds,
): Promise<TrainerWorkloadRow[]> {
  const assignments = await prisma.trainingTrainer.groupBy({
    by: ["trainerId"],
    where: {
      trainingSession: sessionWhere(bounds),
    },
    _count: { _all: true },
  });

  if (assignments.length === 0) return [];

  const trainers = await prisma.user.findMany({
    where: { id: { in: assignments.map((a) => a.trainerId) } },
    select: { id: true, name: true },
  });
  const nameById = new Map(trainers.map((t) => [t.id, t.name]));

  return assignments
    .map((a) => ({
      trainerId: a.trainerId,
      trainerName: nameById.get(a.trainerId) ?? "Unknown",
      sessionCount: a._count._all,
    }))
    .sort((a, b) => b.sessionCount - a.sessionCount);
}

export interface UserParticipationRow {
  userId: string;
  userName: string;
  email: string;
  categoryName: string | null;
  registrations: number;
  present: number;
  absent: number;
  attendanceRate: number | null;
}

export async function listUserParticipation(
  bounds: ReportRangeBounds,
): Promise<UserParticipationRow[]> {
  const registrations = await prisma.trainingRegistration.findMany({
    where: registrationWhere(bounds),
    select: {
      attendanceStatus: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          category: { select: { name: true } },
        },
      },
    },
  });

  const byUser = new Map<
    string,
    {
      user: (typeof registrations)[number]["user"];
      registrations: number;
      present: number;
      absent: number;
    }
  >();

  for (const reg of registrations) {
    const existing = byUser.get(reg.user.id);
    if (existing) {
      existing.registrations++;
      if (reg.attendanceStatus === "PRESENT") existing.present++;
      else if (reg.attendanceStatus === "ABSENT") existing.absent++;
    } else {
      byUser.set(reg.user.id, {
        user: reg.user,
        registrations: 1,
        present: reg.attendanceStatus === "PRESENT" ? 1 : 0,
        absent: reg.attendanceStatus === "ABSENT" ? 1 : 0,
      });
    }
  }

  return [...byUser.values()]
    .map(({ user, registrations: count, present, absent }) => {
      const marked = present + absent;
      return {
        userId: user.id,
        userName: user.name,
        email: user.email,
        categoryName: user.category?.name ?? null,
        registrations: count,
        present,
        absent,
        attendanceRate:
          marked > 0 ? Math.round((present / marked) * 100) : null,
      };
    })
    .sort((a, b) => b.registrations - a.registrations);
}

export interface AttendanceExportRow {
  registrationId: string;
  userName: string;
  userEmail: string;
  sessionTitle: string;
  sessionStartsAt: Date;
  sessionStatus: string;
  categoryName: string;
  attendanceStatus: string;
  attendanceNotes: string | null;
  attendanceMarkedAt: Date | null;
}

export async function listAttendanceForExport(
  bounds: ReportRangeBounds,
): Promise<AttendanceExportRow[]> {
  const rows = await prisma.trainingRegistration.findMany({
    where: registrationWhere(bounds),
    select: {
      id: true,
      attendanceStatus: true,
      attendanceNotes: true,
      attendanceMarkedAt: true,
      user: { select: { name: true, email: true } },
      trainingSession: {
        select: {
          title: true,
          startsAt: true,
          status: true,
          category: { select: { name: true } },
        },
      },
    },
    orderBy: { trainingSession: { startsAt: "desc" } },
  });

  return rows.map((r) => ({
    registrationId: r.id,
    userName: r.user.name,
    userEmail: r.user.email,
    sessionTitle: r.trainingSession.title,
    sessionStartsAt: r.trainingSession.startsAt,
    sessionStatus: r.trainingSession.status,
    categoryName: r.trainingSession.category.name,
    attendanceStatus: r.attendanceStatus,
    attendanceNotes: r.attendanceNotes,
    attendanceMarkedAt: r.attendanceMarkedAt,
  }));
}

export interface UserExportRow {
  id: string;
  name: string;
  email: string;
  role: string;
  active: boolean;
  categoryName: string | null;
  registrations: number;
  present: number;
  absent: number;
}

export async function listUsersForExport(
  bounds: ReportRangeBounds,
): Promise<UserExportRow[]> {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      active: true,
      category: { select: { name: true } },
      registrations: {
        where: registrationWhere(bounds),
        select: { attendanceStatus: true },
      },
    },
    orderBy: { name: "asc" },
  });

  return users.map((u) => {
    let present = 0;
    let absent = 0;
    for (const r of u.registrations) {
      if (r.attendanceStatus === "PRESENT") present++;
      else if (r.attendanceStatus === "ABSENT") absent++;
    }
    return {
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      active: u.active,
      categoryName: u.category?.name ?? null,
      registrations: u.registrations.length,
      present,
      absent,
    };
  });
}

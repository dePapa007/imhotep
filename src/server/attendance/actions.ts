"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { canEditAttendance } from "@/lib/attendance";
import { prisma } from "@/lib/prisma";
import {
  attendanceMarkSchema,
  saveSessionAttendanceSchema,
  type AttendanceMarkInput,
} from "@/lib/validators/attendance";
import { requireUser } from "@/server/auth/dal";
import { getSessionForAttendanceManagement } from "@/server/attendance/queries";

export interface AttendanceActionResult {
  error?: string;
  success?: boolean;
}

function revalidateAttendancePaths(sessionId: string, userIds: string[]) {
  revalidatePath("/admin/trainings");
  revalidatePath(`/admin/trainings/${sessionId}`);
  revalidatePath("/trainer");
  revalidatePath("/trainer/schedule");
  revalidatePath(`/trainer/trainings/${sessionId}`);
  for (const userId of userIds) {
    revalidatePath(`/admin/users/${userId}`);
    revalidatePath(`/user/trainings/${sessionId}`);
  }
}

export async function saveSessionAttendance(
  sessionId: string,
  marks: AttendanceMarkInput[],
): Promise<AttendanceActionResult> {
  const user = await requireUser();

  const parsed = saveSessionAttendanceSchema.safeParse({ sessionId, marks });
  if (!parsed.success) {
    return { error: "Invalid attendance data." };
  }

  const allowed = await getSessionForAttendanceManagement(
    sessionId,
    user.id,
    user.role,
  );
  if (!allowed) {
    return { error: "You are not allowed to manage attendance for this training." };
  }

  const session = await prisma.trainingSession.findUnique({
    where: { id: sessionId },
    select: { id: true, status: true, startsAt: true },
  });
  if (!session) return { error: "Training not found." };

  if (!canEditAttendance(session)) {
    return { error: "Attendance is not available for this training yet." };
  }

  const registrations = await prisma.trainingRegistration.findMany({
    where: {
      trainingSessionId: sessionId,
      status: "REGISTERED",
      id: { in: parsed.data.marks.map((m) => m.registrationId) },
    },
    select: { id: true, userId: true },
  });

  if (registrations.length !== parsed.data.marks.length) {
    return { error: "One or more registrations are invalid." };
  }

  const now = new Date();

  await prisma.$transaction(
    parsed.data.marks.map((mark) =>
      prisma.trainingRegistration.update({
        where: { id: mark.registrationId },
        data: {
          attendanceStatus: mark.status,
          attendanceNotes: mark.notes,
          attendanceMarkedAt: now,
          attendanceMarkedById: user.id,
        },
      }),
    ),
  );

  revalidateAttendancePaths(
    sessionId,
    registrations.map((r) => r.userId),
  );

  return { success: true };
}

export async function saveSessionAttendanceFromForm(
  sessionId: string,
  _prev: AttendanceActionResult,
  formData: FormData,
): Promise<AttendanceActionResult> {
  void _prev;
  const raw = formData.get("marks");
  if (typeof raw !== "string" || !raw) {
    return { error: "Missing attendance data." };
  }

  let marks: unknown;
  try {
    marks = JSON.parse(raw);
  } catch {
    return { error: "Invalid attendance data." };
  }

  const marksParsed = z.array(attendanceMarkSchema).safeParse(marks);

  if (!marksParsed.success) {
    return { error: "Invalid attendance data." };
  }

  return saveSessionAttendance(sessionId, marksParsed.data);
}

import type { AttendanceStatus, SessionStatus } from "@prisma/client";

export const attendanceStatusLabel: Record<AttendanceStatus, string> = {
  UNMARKED: "Unmarked",
  PRESENT: "Present",
  ABSENT: "Absent",
};

export function showAttendanceSection(session: { status: SessionStatus }) {
  return session.status !== "CANCELLED";
}

export function canEditAttendance(session: {
  status: SessionStatus;
  startsAt: Date;
}) {
  if (session.status === "CANCELLED") return false;
  if (session.status === "COMPLETED") return true;
  return session.startsAt.getTime() <= Date.now();
}

export function attendanceSectionMessage(session: {
  status: SessionStatus;
  startsAt: Date;
}) {
  if (!showAttendanceSection(session)) return null;
  if (canEditAttendance(session)) return null;
  return "Attendance can be recorded after the session has started.";
}

import "server-only";

import { buildCsv } from "@/lib/csv";
import {
  getReportRangeBounds,
  parseReportRange,
  type ReportRangeType,
} from "@/lib/report-range";
import {
  listAttendanceForExport,
  listRegistrationsPerTraining,
  listUsersForExport,
} from "@/server/reports/queries";

const isoDate = new Intl.DateTimeFormat("en-GB", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

function parseRangeParam(value: string | null): ReportRangeType {
  return parseReportRange(value ?? undefined, "month");
}

export async function buildTrainingsCsv(rangeParam: string | null): Promise<string> {
  const range = parseRangeParam(rangeParam);
  const bounds = getReportRangeBounds(range);
  const rows = await listRegistrationsPerTraining(bounds);

  return buildCsv(
    [
      "Session ID",
      "Title",
      "Category",
      "Starts at",
      "Status",
      "Capacity",
      "Registered",
      "Present",
      "Absent",
      "Unmarked",
      "Fill %",
    ],
    rows.map((r) => {
      const fill =
        r.capacity && r.capacity > 0
          ? Math.round((r.registered / r.capacity) * 100)
          : "";
      return [
        r.id,
        r.title,
        r.categoryName,
        isoDate.format(r.startsAt),
        r.status,
        r.capacity ?? "",
        r.registered,
        r.present,
        r.absent,
        r.unmarked,
        fill,
      ];
    }),
  );
}

export async function buildUsersCsv(rangeParam: string | null): Promise<string> {
  const range = parseRangeParam(rangeParam);
  const bounds = getReportRangeBounds(range);
  const rows = await listUsersForExport(bounds);

  return buildCsv(
    [
      "User ID",
      "Name",
      "Email",
      "Role",
      "Active",
      "Category",
      "Registrations",
      "Present",
      "Absent",
    ],
    rows.map((r) => [
      r.id,
      r.name,
      r.email,
      r.role,
      r.active ? "yes" : "no",
      r.categoryName ?? "",
      r.registrations,
      r.present,
      r.absent,
    ]),
  );
}

export async function buildAttendanceCsv(
  rangeParam: string | null,
): Promise<string> {
  const range = parseRangeParam(rangeParam);
  const bounds = getReportRangeBounds(range);
  const rows = await listAttendanceForExport(bounds);

  return buildCsv(
    [
      "Registration ID",
      "Member",
      "Email",
      "Training",
      "Session date",
      "Session status",
      "Category",
      "Attendance",
      "Notes",
      "Marked at",
    ],
    rows.map((r) => [
      r.registrationId,
      r.userName,
      r.userEmail,
      r.sessionTitle,
      isoDate.format(r.sessionStartsAt),
      r.sessionStatus,
      r.categoryName,
      r.attendanceStatus,
      r.attendanceNotes ?? "",
      r.attendanceMarkedAt ? isoDate.format(r.attendanceMarkedAt) : "",
    ]),
  );
}

export function csvFilename(prefix: string, range: ReportRangeType): string {
  const stamp = new Date().toISOString().slice(0, 10);
  return `${prefix}-${range}-${stamp}.csv`;
}

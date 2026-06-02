import type { RecurrenceType } from "@prisma/client";

export interface Occurrence {
  startsAt: Date;
  endsAt: Date;
  registrationDeadline: Date | null;
}

export interface GenerateOptions {
  startDate: string; // yyyy-mm-dd
  endDate?: string | null; // yyyy-mm-dd (required for recurring)
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  recurrenceType: RecurrenceType;
  registrationDeadlineHours?: number | null;
}

const HOUR_MS = 60 * 60 * 1000;

/** Combine a yyyy-mm-dd date string and an HH:mm time into a local Date. */
export function combineDateTime(date: string, time: string): Date {
  const [y = 0, mo = 1, d = 1] = date.split("-").map(Number);
  const [hh = 0, mm = 0] = time.split(":").map(Number);
  return new Date(y, mo - 1, d, hh, mm, 0, 0);
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

/**
 * Expand a recurrence rule into concrete session occurrences within
 * [startDate, endDate]. Times come from startTime/endTime. Recurring rules
 * require endDate; one-time rules ignore it.
 */
export function generateOccurrences(options: GenerateOptions): Occurrence[] {
  const {
    startDate,
    endDate,
    startTime,
    endTime,
    recurrenceType,
    registrationDeadlineHours,
  } = options;

  const makeOccurrence = (date: Date): Occurrence => {
    const [hh = 0, mm = 0] = startTime.split(":").map(Number);
    const [eh = 0, em = 0] = endTime.split(":").map(Number);
    const startsAt = new Date(date);
    startsAt.setHours(hh, mm, 0, 0);
    const endsAt = new Date(date);
    endsAt.setHours(eh, em, 0, 0);
    const registrationDeadline =
      registrationDeadlineHours != null
        ? new Date(startsAt.getTime() - registrationDeadlineHours * HOUR_MS)
        : null;
    return { startsAt, endsAt, registrationDeadline };
  };

  const start = combineDateTime(startDate, startTime);

  if (recurrenceType === "NONE") {
    return [makeOccurrence(start)];
  }

  // Recurring requires an end date; bail out safely if missing.
  if (!endDate) return [makeOccurrence(start)];
  const end = combineDateTime(endDate, startTime);

  const occurrences: Occurrence[] = [];

  if (recurrenceType === "WEEKLY" || recurrenceType === "BIWEEKLY") {
    const step = recurrenceType === "WEEKLY" ? 7 : 14;
    let cursor = start;
    while (cursor.getTime() <= end.getTime()) {
      occurrences.push(makeOccurrence(cursor));
      cursor = addDays(cursor, step);
    }
    return occurrences;
  }

  // MONTHLY: same day-of-month; skip months that lack that day (e.g. the 31st).
  const dayOfMonth = start.getDate();
  for (let i = 0; ; i += 1) {
    const candidate = new Date(
      start.getFullYear(),
      start.getMonth() + i,
      dayOfMonth,
      start.getHours(),
      start.getMinutes(),
      0,
      0,
    );
    if (candidate.getTime() > end.getTime()) break;
    // Month rolled over (day does not exist this month) -> skip.
    if (candidate.getDate() !== dayOfMonth) continue;
    occurrences.push(makeOccurrence(candidate));
  }

  return occurrences;
}

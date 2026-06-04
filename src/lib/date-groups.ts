import { formatDateShort, formatDayHeading } from "@/i18n/format";
import type { Locale } from "@/i18n/locales";

export type RangeType = "day" | "week" | "month" | "all";

export const RANGE_VALUES: RangeType[] = ["day", "week", "month", "all"];

export interface RangeBounds {
  from?: Date;
  to?: Date;
}

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

/** Monday as start of week (ISO-style). */
function startOfWeek(date: Date): Date {
  const d = startOfDay(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d;
}

function endOfWeek(date: Date): Date {
  const start = startOfWeek(date);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  return endOfDay(end);
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0);
}

function endOfMonth(date: Date): Date {
  return endOfDay(new Date(date.getFullYear(), date.getMonth() + 1, 0));
}

export function getRangeBounds(
  range: RangeType,
  reference = new Date(),
): RangeBounds {
  switch (range) {
    case "day":
      return { from: startOfDay(reference), to: endOfDay(reference) };
    case "week":
      return { from: startOfWeek(reference), to: endOfWeek(reference) };
    case "month":
      return { from: startOfMonth(reference), to: endOfMonth(reference) };
    case "all":
      return {};
  }
}

function dateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export interface DayGroup<T extends { startsAt: Date }> {
  dateKey: string;
  label: string;
  sessions: T[];
}

export function groupSessionsByDay<T extends { startsAt: Date }>(
  sessions: T[],
  locale: Locale,
  reference = new Date(),
): DayGroup<T>[] {
  const map = new Map<string, T[]>();

  for (const session of sessions) {
    const key = dateKey(session.startsAt);
    const group = map.get(key);
    if (group) group.push(session);
    else map.set(key, [session]);
  }

  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, groupSessions]) => {
      const first = groupSessions[0]!;
      return {
        dateKey: key,
        label: formatDayHeading(first.startsAt, locale, reference),
        sessions: groupSessions,
      };
    });
}

export { formatDateShort };

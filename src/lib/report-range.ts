export type ReportRangeType = "week" | "month" | "season" | "all";

export const REPORT_RANGE_VALUES: ReportRangeType[] = [
  "week",
  "month",
  "season",
  "all",
];

export interface ReportRangeBounds {
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

/** Academy season: 1 Aug – 31 Jul (European football season). */
function getSeasonBounds(reference: Date): ReportRangeBounds {
  const year = reference.getFullYear();
  const month = reference.getMonth();
  const seasonStartYear = month >= 7 ? year : year - 1;
  const from = new Date(seasonStartYear, 7, 1, 0, 0, 0, 0);
  const to = endOfDay(new Date(seasonStartYear + 1, 6, 31));
  return { from, to };
}

export function getReportRangeBounds(
  range: ReportRangeType,
  reference = new Date(),
): ReportRangeBounds {
  switch (range) {
    case "week":
      return { from: startOfWeek(reference), to: endOfWeek(reference) };
    case "month":
      return { from: startOfMonth(reference), to: endOfMonth(reference) };
    case "season":
      return getSeasonBounds(reference);
    case "all":
      return {};
  }
}

export function parseReportRange(
  value: string | undefined,
  defaultRange: ReportRangeType = "month",
): ReportRangeType {
  if (value && (REPORT_RANGE_VALUES as readonly string[]).includes(value)) {
    return value as ReportRangeType;
  }
  return defaultRange;
}

export function sessionStartsInRange(
  bounds: ReportRangeBounds,
): { gte?: Date; lte?: Date } | undefined {
  if (!bounds.from && !bounds.to) return undefined;
  const filter: { gte?: Date; lte?: Date } = {};
  if (bounds.from) filter.gte = bounds.from;
  if (bounds.to) filter.lte = bounds.to;
  return filter;
}

export const reportRangeLabel: Record<ReportRangeType, string> = {
  week: "This week",
  month: "This month",
  season: "This season",
  all: "All time",
};

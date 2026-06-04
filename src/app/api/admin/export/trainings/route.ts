import { NextResponse } from "next/server";

import {
  buildTrainingsCsv,
  csvFilename,
} from "@/server/reports/exports";
import { parseReportRange } from "@/lib/report-range";
import { requireAdminApi } from "@/server/auth/api-admin";

export async function GET(request: Request) {
  const auth = await requireAdminApi();
  if (auth.response) return auth.response;

  const range = request.url
    ? new URL(request.url).searchParams.get("range")
    : null;
  const parsed = parseReportRange(range ?? undefined, "month");
  const csv = await buildTrainingsCsv(range);
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${csvFilename("trainings", parsed)}"`,
    },
  });
}

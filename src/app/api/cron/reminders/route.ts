import { NextResponse } from "next/server";

import { env } from "@/lib/env";
import { sendDueReminders } from "@/server/notifications/dispatch";

function authorize(request: Request): boolean {
  if (!env.CRON_SECRET) return false;
  const header = request.headers.get("authorization");
  return header === `Bearer ${env.CRON_SECRET}`;
}

export async function GET(request: Request) {
  if (!authorize(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await sendDueReminders();
  return NextResponse.json(result);
}

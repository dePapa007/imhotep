import "server-only";

import { NextResponse } from "next/server";

import { getCurrentUser } from "@/server/auth/dal";

export async function requireAdminApi() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return { user: null, response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  return { user, response: null };
}

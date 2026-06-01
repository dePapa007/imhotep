import { NextResponse, type NextRequest } from "next/server";

import { ROLE_PREFIX, roleHome } from "@/lib/roles";
import { decrypt, SESSION_COOKIE } from "@/lib/session";

const PROTECTED_PREFIXES = ["/admin", "/trainer", "/user"];

// Optimistic auth checks only. Authoritative checks happen in the DAL
// (database lookup) inside layouts, pages, and server actions.
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = await decrypt(token);

  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

  if (isProtected && !session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (session) {
    if (pathname === "/login") {
      return NextResponse.redirect(
        new URL(roleHome(session.role), request.url),
      );
    }

    if (isProtected) {
      const allowedPrefix = ROLE_PREFIX[session.role];
      const allowed =
        pathname === allowedPrefix || pathname.startsWith(`${allowedPrefix}/`);
      if (!allowed) {
        return NextResponse.redirect(
          new URL(roleHome(session.role), request.url),
        );
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};

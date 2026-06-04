import type { Role } from "@prisma/client";

/** Landing route for each role after login. */
export const ROLE_HOME: Record<Role, string> = {
  ADMIN: "/admin",
  TRAINER: "/trainer",
  USER: "/user",
};

export function roleHome(role: Role): string {
  return ROLE_HOME[role];
}

export function roleProfile(role: Role): string {
  return `${ROLE_PREFIX[role]}/profile`;
}

/** Path prefix each role is allowed to access within the dashboard. */
export const ROLE_PREFIX: Record<Role, string> = {
  ADMIN: "/admin",
  TRAINER: "/trainer",
  USER: "/user",
};

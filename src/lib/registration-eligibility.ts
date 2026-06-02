import type { RegistrationStatus, SessionStatus } from "@prisma/client";

export interface EligibilityUser {
  active: boolean;
  categoryId: string | null;
}

export interface EligibilitySession {
  status: SessionStatus;
  categoryId: string;
  startsAt: Date;
  capacity: number | null;
  registrationDeadline: Date | null;
  registeredCount: number;
}

export interface EligibilityOptions {
  session: EligibilitySession;
  user: EligibilityUser;
  existingStatus?: RegistrationStatus | null;
  now?: Date;
  bypassDeadline?: boolean;
}

export type EligibilityResult =
  | { ok: true }
  | { ok: false; reason: string };

export function checkRegistrationEligibility(
  options: EligibilityOptions,
): EligibilityResult {
  const {
    session,
    user,
    existingStatus,
    now = new Date(),
    bypassDeadline = false,
  } = options;

  if (!user.active) {
    return { ok: false, reason: "Your account is inactive." };
  }
  if (!user.categoryId) {
    return { ok: false, reason: "You are not assigned to a category." };
  }
  if (session.status !== "SCHEDULED") {
    return { ok: false, reason: "This training is not open for registration." };
  }
  if (user.categoryId !== session.categoryId) {
    return { ok: false, reason: "This training is not in your category." };
  }
  if (session.startsAt.getTime() <= now.getTime()) {
    return { ok: false, reason: "This training has already started." };
  }
  if (existingStatus === "REGISTERED") {
    return { ok: false, reason: "You are already registered." };
  }
  if (
    session.capacity != null &&
    session.registeredCount >= session.capacity
  ) {
    return { ok: false, reason: "This training is full." };
  }
  if (
    !bypassDeadline &&
    session.registrationDeadline &&
    now.getTime() >= session.registrationDeadline.getTime()
  ) {
    return { ok: false, reason: "Registration for this training has closed." };
  }

  return { ok: true };
}

export function checkCancellationEligibility(options: {
  existingStatus?: RegistrationStatus | null;
  sessionStartsAt: Date;
  now?: Date;
}): EligibilityResult {
  const { existingStatus, sessionStartsAt, now = new Date() } = options;

  if (existingStatus !== "REGISTERED") {
    return { ok: false, reason: "You are not registered for this training." };
  }
  if (sessionStartsAt.getTime() <= now.getTime()) {
    return { ok: false, reason: "Cannot cancel after the training has started." };
  }

  return { ok: true };
}

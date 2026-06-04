import "server-only";

import type { NotificationType, Role } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";

import { sendRawEmail } from "./client";
import { claimNotification } from "./dedupe";
import {
  registrationConfirmationEmail,
  sessionCancelledEmail,
  sessionFullAdminEmail,
  trainerAssignedEmail,
  trainingReminderEmail,
  userWelcomeEmail,
  type SessionEmailContext,
} from "./templates";

async function deliverNotification({
  type,
  dedupeKey,
  recipientEmail,
  subject,
  html,
  text,
}: {
  type: NotificationType;
  dedupeKey: string;
  recipientEmail: string;
  subject: string;
  html: string;
  text: string;
}): Promise<"sent" | "skipped"> {
  const claimed = await claimNotification({ type, dedupeKey, recipientEmail });
  if (!claimed) return "skipped";

  await sendRawEmail({
    to: recipientEmail,
    subject,
    html,
    text,
    dedupeKey,
  });
  return "sent";
}

function toSessionContext(session: {
  id: string;
  title: string;
  startsAt: Date;
  location: string | null;
  category: { name: string };
}): SessionEmailContext {
  return {
    id: session.id,
    title: session.title,
    startsAt: session.startsAt,
    location: session.location,
    categoryName: session.category.name,
  };
}

async function loadSessionForEmail(sessionId: string) {
  return prisma.trainingSession.findUnique({
    where: { id: sessionId },
    select: {
      id: true,
      title: true,
      startsAt: true,
      location: true,
      category: { select: { name: true } },
    },
  });
}

export async function sendRegistrationConfirmation(
  sessionId: string,
  userId: string,
) {
  const [session, user] = await Promise.all([
    loadSessionForEmail(sessionId),
    prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true },
    }),
  ]);
  if (!session || !user) return;

  const ctx = toSessionContext(session);
  const { subject, html, text } = registrationConfirmationEmail(user.name, ctx);

  await deliverNotification({
    type: "REGISTRATION_CONFIRMATION",
    dedupeKey: `REGISTRATION_CONFIRMATION:${sessionId}:${userId}`,
    recipientEmail: user.email,
    subject,
    html,
    text,
  });
}

export async function sendSessionFullAdminNotifications(sessionId: string) {
  const session = await prisma.trainingSession.findUnique({
    where: { id: sessionId },
    select: {
      id: true,
      title: true,
      startsAt: true,
      location: true,
      capacity: true,
      category: { select: { name: true } },
      _count: {
        select: {
          registrations: { where: { status: "REGISTERED" } },
        },
      },
    },
  });
  if (!session?.capacity) return;
  if (session._count.registrations !== session.capacity) return;

  const admins = await prisma.user.findMany({
    where: { role: "ADMIN", active: true },
    select: { id: true, name: true, email: true },
  });

  const ctx = toSessionContext(session);

  for (const admin of admins) {
    const { subject, html, text } = sessionFullAdminEmail(
      admin.name,
      ctx,
      session._count.registrations,
      session.capacity,
    );
    await deliverNotification({
      type: "SESSION_FULL_ADMIN",
      dedupeKey: `SESSION_FULL_ADMIN:${sessionId}:${admin.id}`,
      recipientEmail: admin.email,
      subject,
      html,
      text,
    });
  }
}

export async function sendSessionCancelledNotifications(sessionId: string) {
  const session = await prisma.trainingSession.findUnique({
    where: { id: sessionId },
    select: {
      id: true,
      title: true,
      startsAt: true,
      location: true,
      category: { select: { name: true } },
      registrations: {
        where: { status: "REGISTERED" },
        select: {
          userId: true,
          user: { select: { name: true, email: true } },
        },
      },
    },
  });
  if (!session) return;

  const ctx = toSessionContext(session);

  for (const registration of session.registrations) {
    const { subject, html, text } = sessionCancelledEmail(
      registration.user.name,
      ctx,
    );
    await deliverNotification({
      type: "SESSION_CANCELLED",
      dedupeKey: `SESSION_CANCELLED:${sessionId}:${registration.userId}`,
      recipientEmail: registration.user.email,
      subject,
      html,
      text,
    });
  }
}

export async function sendTrainerAssignedNotification(
  sessionId: string,
  trainerId: string,
) {
  const [session, trainer] = await Promise.all([
    loadSessionForEmail(sessionId),
    prisma.user.findUnique({
      where: { id: trainerId },
      select: { name: true, email: true, role: true, active: true },
    }),
  ]);
  if (!session || !trainer || trainer.role !== "TRAINER" || !trainer.active) {
    return;
  }

  const ctx = toSessionContext(session);
  const { subject, html, text } = trainerAssignedEmail(trainer.name, ctx);

  await deliverNotification({
    type: "TRAINER_ASSIGNED",
    dedupeKey: `TRAINER_ASSIGNED:${sessionId}:${trainerId}`,
    recipientEmail: trainer.email,
    subject,
    html,
    text,
  });
}

export async function sendTrainingReminder(
  session: SessionEmailContext,
  recipient: { name: string; email: string },
  recipientId: string,
  role: "member" | "trainer",
): Promise<"sent" | "skipped"> {
  const { subject, html, text } = trainingReminderEmail(
    recipient.name,
    session,
    role,
  );

  return deliverNotification({
    type: "TRAINING_REMINDER",
    dedupeKey: `TRAINING_REMINDER:${session.id}:${recipientId}`,
    recipientEmail: recipient.email,
    subject,
    html,
    text,
  });
}

export async function sendDueReminders() {
  const hours = env.REMINDER_HOURS_BEFORE;
  const now = new Date();
  const windowStart = new Date(now.getTime() + (hours - 1) * 60 * 60 * 1000);
  const windowEnd = new Date(now.getTime() + hours * 60 * 60 * 1000);

  const sessions = await prisma.trainingSession.findMany({
    where: {
      status: "SCHEDULED",
      startsAt: { gte: windowStart, lt: windowEnd },
    },
    select: {
      id: true,
      title: true,
      startsAt: true,
      location: true,
      category: { select: { name: true } },
      registrations: {
        where: { status: "REGISTERED" },
        select: {
          userId: true,
          user: { select: { name: true, email: true } },
        },
      },
      trainers: {
        select: {
          trainerId: true,
          trainer: { select: { name: true, email: true } },
        },
      },
    },
  });

  let sent = 0;
  let skipped = 0;

  for (const session of sessions) {
    const ctx = toSessionContext(session);

    for (const registration of session.registrations) {
      const result = await sendTrainingReminder(
        ctx,
        registration.user,
        registration.userId,
        "member",
      );
      if (result === "sent") sent++;
      else skipped++;
    }

    for (const assignment of session.trainers) {
      const result = await sendTrainingReminder(
        ctx,
        assignment.trainer,
        assignment.trainerId,
        "trainer",
      );
      if (result === "sent") sent++;
      else skipped++;
    }
  }

  return { sent, skipped, sessions: sessions.length };
}

export async function sendUserWelcome({
  userId,
  name,
  email,
  role,
  password,
}: {
  userId: string;
  name: string;
  email: string;
  role: Role;
  password: string;
}) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { category: { select: { name: true } } },
  });

  const { subject, html, text } = userWelcomeEmail({
    name,
    email,
    password,
    role,
    categoryName: user?.category?.name,
  });

  await deliverNotification({
    type: "USER_WELCOME",
    dedupeKey: `USER_WELCOME:${userId}`,
    recipientEmail: email,
    subject,
    html,
    text,
  });
}

function runInBackground(promise: Promise<void>) {
  void promise.catch((error) => {
    console.error("[notifications]", error);
  });
}

export function notifyRegistrationConfirmation(
  sessionId: string,
  userId: string,
  previousRegisteredCount: number,
  capacity: number | null,
) {
  runInBackground(
    (async () => {
      await sendRegistrationConfirmation(sessionId, userId);
      const newCount = previousRegisteredCount + 1;
      if (capacity != null && newCount === capacity) {
        await sendSessionFullAdminNotifications(sessionId);
      }
    })(),
  );
}

export function notifySessionCancelled(sessionId: string) {
  runInBackground(sendSessionCancelledNotifications(sessionId));
}

export function notifyTrainerAssigned(sessionId: string, trainerId: string) {
  runInBackground(sendTrainerAssignedNotification(sessionId, trainerId));
}

export function notifyTrainerAssignments(
  assignments: { sessionId: string; trainerId: string }[],
) {
  runInBackground(
    (async () => {
      for (const { sessionId, trainerId } of assignments) {
        await sendTrainerAssignedNotification(sessionId, trainerId);
      }
    })(),
  );
}

export function notifyUserWelcome({
  userId,
  name,
  email,
  role,
  password,
}: {
  userId: string;
  name: string;
  email: string;
  role: Role;
  password: string;
}) {
  runInBackground(sendUserWelcome({ userId, name, email, role, password }));
}

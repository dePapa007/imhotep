import "server-only";

import type { NotificationType } from "@prisma/client";
import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

export async function claimNotification({
  type,
  dedupeKey,
  recipientEmail,
}: {
  type: NotificationType;
  dedupeKey: string;
  recipientEmail: string;
}): Promise<boolean> {
  try {
    await prisma.notificationLog.create({
      data: { type, dedupeKey, recipientEmail },
    });
    return true;
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return false;
    }
    throw error;
  }
}

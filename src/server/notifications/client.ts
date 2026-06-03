import "server-only";

import { Resend } from "resend";

import { env, getEmailFrom } from "@/lib/env";

let resend: Resend | null = null;

function getResend() {
  if (!env.RESEND_API_KEY) return null;
  if (!resend) resend = new Resend(env.RESEND_API_KEY);
  return resend;
}

export async function sendRawEmail({
  to,
  subject,
  html,
  text,
  dedupeKey,
}: {
  to: string;
  subject: string;
  html: string;
  text: string;
  dedupeKey?: string;
}): Promise<void> {
  const client = getResend();
  if (!client) {
    console.log("[email]", { to, subject, dedupeKey });
    return;
  }

  try {
    const { error } = await client.emails.send({
      from: getEmailFrom(),
      to,
      subject,
      html,
      text,
    });
    if (error) {
      console.error("[email] Resend error", { to, subject, dedupeKey, error });
    }
  } catch (error) {
    console.error("[email] failed to send", { to, subject, dedupeKey, error });
  }
}

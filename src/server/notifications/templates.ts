import { getAppUrl } from "@/lib/env";

import { formatSessionDateTime } from "./format";

export interface SessionEmailContext {
  id: string;
  title: string;
  startsAt: Date;
  location: string | null;
  categoryName: string;
}

function sessionDetails(session: SessionEmailContext) {
  const lines = [
    `Training: ${session.title}`,
    `When: ${formatSessionDateTime(session.startsAt)}`,
    `Category: ${session.categoryName}`,
  ];
  if (session.location) lines.push(`Location: ${session.location}`);
  return lines;
}

function wrapHtml(body: string) {
  return `<!DOCTYPE html>
<html lang="en">
<body style="font-family:system-ui,sans-serif;line-height:1.5;color:#0f172a;max-width:32rem;margin:0 auto;padding:1.5rem">
  <p style="margin:0 0 1rem"><img src="${getAppUrl()}/imhotep-logo.svg" alt="Imhotep" width="120" height="100" style="height:2.5rem;width:auto" /></p>
  ${body}
  <p style="margin-top:2rem;font-size:0.875rem;color:#64748b">Imhotep Soccer Academy</p>
</body>
</html>`;
}

function linkHtml(href: string, label: string) {
  return `<p style="margin:1.5rem 0"><a href="${href}" style="display:inline-block;background:#15803d;color:#f0fdf4;padding:0.625rem 1rem;border-radius:0.75rem;text-decoration:none;font-weight:500">${label}</a></p>`;
}

export function registrationConfirmationEmail(
  name: string,
  session: SessionEmailContext,
) {
  const url = `${getAppUrl()}/user/trainings/${session.id}`;
  const details = sessionDetails(session);
  return {
    subject: `Registered: ${session.title}`,
    text: [
      `Hi ${name},`,
      "",
      "You're registered for the following training:",
      "",
      ...details,
      "",
      `View details: ${url}`,
    ].join("\n"),
    html: wrapHtml(
      `<p>Hi ${escapeHtml(name)},</p>
<p>You're registered for the following training:</p>
<ul>${details.map((line) => `<li>${escapeHtml(line)}</li>`).join("")}</ul>
${linkHtml(url, "View training")}`,
    ),
  };
}

export function sessionCancelledEmail(
  name: string,
  session: SessionEmailContext,
) {
  const details = sessionDetails(session);
  return {
    subject: `Cancelled: ${session.title}`,
    text: [
      `Hi ${name},`,
      "",
      "The following training has been cancelled:",
      "",
      ...details,
    ].join("\n"),
    html: wrapHtml(
      `<p>Hi ${escapeHtml(name)},</p>
<p>The following training has been <strong>cancelled</strong>:</p>
<ul>${details.map((line) => `<li>${escapeHtml(line)}</li>`).join("")}</ul>`,
    ),
  };
}

export function trainerAssignedEmail(
  name: string,
  session: SessionEmailContext,
) {
  const url = `${getAppUrl()}/trainer/trainings/${session.id}`;
  const details = sessionDetails(session);
  return {
    subject: `Assigned: ${session.title}`,
    text: [
      `Hi ${name},`,
      "",
      "You've been assigned to the following training:",
      "",
      ...details,
      "",
      `View details: ${url}`,
    ].join("\n"),
    html: wrapHtml(
      `<p>Hi ${escapeHtml(name)},</p>
<p>You've been assigned to the following training:</p>
<ul>${details.map((line) => `<li>${escapeHtml(line)}</li>`).join("")}</ul>
${linkHtml(url, "View training")}`,
    ),
  };
}

export function trainingReminderEmail(
  name: string,
  session: SessionEmailContext,
  role: "member" | "trainer",
) {
  const url =
    role === "trainer"
      ? `${getAppUrl()}/trainer/trainings/${session.id}`
      : `${getAppUrl()}/user/trainings/${session.id}`;
  const details = sessionDetails(session);
  return {
    subject: `Reminder: ${session.title}`,
    text: [
      `Hi ${name},`,
      "",
      "This is a reminder that the following training starts soon:",
      "",
      ...details,
      "",
      `View details: ${url}`,
    ].join("\n"),
    html: wrapHtml(
      `<p>Hi ${escapeHtml(name)},</p>
<p>This is a reminder that the following training starts soon:</p>
<ul>${details.map((line) => `<li>${escapeHtml(line)}</li>`).join("")}</ul>
${linkHtml(url, "View training")}`,
    ),
  };
}

export function sessionFullAdminEmail(
  adminName: string,
  session: SessionEmailContext,
  registeredCount: number,
  capacity: number,
) {
  const url = `${getAppUrl()}/admin/trainings/${session.id}`;
  const details = sessionDetails(session);
  return {
    subject: `Session full: ${session.title}`,
    text: [
      `Hi ${adminName},`,
      "",
      `A training session is now full (${registeredCount}/${capacity}):`,
      "",
      ...details,
      "",
      `Manage session: ${url}`,
    ].join("\n"),
    html: wrapHtml(
      `<p>Hi ${escapeHtml(adminName)},</p>
<p>A training session is now full (<strong>${registeredCount}/${capacity}</strong>):</p>
<ul>${details.map((line) => `<li>${escapeHtml(line)}</li>`).join("")}</ul>
${linkHtml(url, "Manage session")}`,
    ),
  };
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

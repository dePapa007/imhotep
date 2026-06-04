import type { Locale, Role } from "@prisma/client";

import { createTranslator } from "@/i18n/get-messages";
import { getAppUrl } from "@/lib/env";
import { roleHome } from "@/lib/roles";

import { formatSessionDateTime } from "./format";

export interface SessionEmailContext {
  id: string;
  title: string;
  startsAt: Date;
  location: string | null;
  categoryName: string;
}

function sessionDetails(session: SessionEmailContext, locale: Locale) {
  const t = createTranslator(locale);
  const lines = [
    `${t("email.training")}: ${session.title}`,
    `${t("email.when")}: ${formatSessionDateTime(session.startsAt, locale)}`,
    `${t("email.category")}: ${session.categoryName}`,
  ];
  if (session.location) {
    lines.push(`${t("email.location")}: ${session.location}`);
  }
  return lines;
}

function wrapHtml(body: string, locale: Locale) {
  const t = createTranslator(locale);
  return `<!DOCTYPE html>
<html lang="${locale}">
<body style="font-family:system-ui,sans-serif;line-height:1.5;color:#0f172a;max-width:32rem;margin:0 auto;padding:1.5rem">
  <p style="margin:0 0 1rem"><img src="${getAppUrl()}/imhotep-logo.svg" alt="Imhotep" width="120" height="100" style="height:2.5rem;width:auto" /></p>
  ${body}
  <p style="margin-top:2rem;font-size:0.875rem;color:#64748b">${escapeHtml(t("email.footer"))}</p>
</body>
</html>`;
}

function linkHtml(href: string, label: string) {
  return `<p style="margin:1.5rem 0"><a href="${href}" style="display:inline-block;background:#15803d;color:#f0fdf4;padding:0.625rem 1rem;border-radius:0.75rem;text-decoration:none;font-weight:500">${label}</a></p>`;
}

export function registrationConfirmationEmail(
  name: string,
  session: SessionEmailContext,
  locale: Locale,
) {
  const t = createTranslator(locale);
  const url = `${getAppUrl()}/user/trainings/${session.id}`;
  const details = sessionDetails(session, locale);
  return {
    subject: t("email.registrationSubject", { title: session.title }),
    text: [
      t("email.hi", { name }),
      "",
      t("email.registrationIntro"),
      "",
      ...details,
      "",
      `${t("email.viewTraining")}: ${url}`,
    ].join("\n"),
    html: wrapHtml(
      `<p>${escapeHtml(t("email.hi", { name }))}</p>
<p>${escapeHtml(t("email.registrationIntro"))}</p>
<ul>${details.map((line) => `<li>${escapeHtml(line)}</li>`).join("")}</ul>
${linkHtml(url, escapeHtml(t("email.viewTraining")))}`,
      locale,
    ),
  };
}

export function sessionCancelledEmail(
  name: string,
  session: SessionEmailContext,
  locale: Locale,
) {
  const t = createTranslator(locale);
  const details = sessionDetails(session, locale);
  return {
    subject: t("email.sessionCancelledSubject", { title: session.title }),
    text: [
      t("email.hi", { name }),
      "",
      t("email.sessionCancelledIntro"),
      "",
      ...details,
    ].join("\n"),
    html: wrapHtml(
      `<p>${escapeHtml(t("email.hi", { name }))}</p>
<p>${escapeHtml(t("email.sessionCancelledIntro"))}</p>
<ul>${details.map((line) => `<li>${escapeHtml(line)}</li>`).join("")}</ul>`,
      locale,
    ),
  };
}

export function trainerAssignedEmail(
  name: string,
  session: SessionEmailContext,
  locale: Locale,
) {
  const t = createTranslator(locale);
  const url = `${getAppUrl()}/trainer/trainings/${session.id}`;
  const details = sessionDetails(session, locale);
  return {
    subject: t("email.trainerAssignedSubject", { title: session.title }),
    text: [
      t("email.hi", { name }),
      "",
      t("email.trainerAssignedIntro"),
      "",
      ...details,
      "",
      `${t("email.viewTraining")}: ${url}`,
    ].join("\n"),
    html: wrapHtml(
      `<p>${escapeHtml(t("email.hi", { name }))}</p>
<p>${escapeHtml(t("email.trainerAssignedIntro"))}</p>
<ul>${details.map((line) => `<li>${escapeHtml(line)}</li>`).join("")}</ul>
${linkHtml(url, escapeHtml(t("email.viewTraining")))}`,
      locale,
    ),
  };
}

export function trainingReminderEmail(
  name: string,
  session: SessionEmailContext,
  role: "member" | "trainer",
  locale: Locale,
) {
  const t = createTranslator(locale);
  const url =
    role === "trainer"
      ? `${getAppUrl()}/trainer/trainings/${session.id}`
      : `${getAppUrl()}/user/trainings/${session.id}`;
  const details = sessionDetails(session, locale);
  return {
    subject: t("email.reminderSubject", { title: session.title }),
    text: [
      t("email.hi", { name }),
      "",
      t("email.reminderIntro"),
      "",
      ...details,
      "",
      `${t("email.viewTraining")}: ${url}`,
    ].join("\n"),
    html: wrapHtml(
      `<p>${escapeHtml(t("email.hi", { name }))}</p>
<p>${escapeHtml(t("email.reminderIntro"))}</p>
<ul>${details.map((line) => `<li>${escapeHtml(line)}</li>`).join("")}</ul>
${linkHtml(url, escapeHtml(t("email.viewTraining")))}`,
      locale,
    ),
  };
}

export function sessionFullAdminEmail(
  adminName: string,
  session: SessionEmailContext,
  registeredCount: number,
  capacity: number,
  locale: Locale,
) {
  const t = createTranslator(locale);
  const url = `${getAppUrl()}/admin/trainings/${session.id}`;
  const details = sessionDetails(session, locale);
  return {
    subject: t("email.sessionFullSubject", { title: session.title }),
    text: [
      t("email.hi", { name: adminName }),
      "",
      t("email.sessionFullIntro", { count: registeredCount, capacity }),
      "",
      ...details,
      "",
      `${t("email.manageSession")}: ${url}`,
    ].join("\n"),
    html: wrapHtml(
      `<p>${escapeHtml(t("email.hi", { name: adminName }))}</p>
<p>${escapeHtml(t("email.sessionFullIntro", { count: registeredCount, capacity }))}</p>
<ul>${details.map((line) => `<li>${escapeHtml(line)}</li>`).join("")}</ul>
${linkHtml(url, escapeHtml(t("email.manageSession")))}`,
      locale,
    ),
  };
}

export function userWelcomeEmail({
  name,
  email,
  password,
  role,
  categoryName,
  locale,
}: {
  name: string;
  email: string;
  password: string;
  role: Role;
  categoryName?: string | null;
  locale: Locale;
}) {
  const t = createTranslator(locale);
  const loginUrl = `${getAppUrl()}/login`;
  const dashboardUrl = `${getAppUrl()}${roleHome(role)}`;
  const roleText = t(`roles.${role}`);
  const accountLines = [
    `${t("email.emailLabel")}: ${email}`,
    `${t("email.passwordLabel")}: ${password}`,
    `${t("email.roleLabel")}: ${roleText}`,
  ];
  if (categoryName) {
    accountLines.push(`${t("email.categoryLabel")}: ${categoryName}`);
  }

  return {
    subject: t("email.welcomeSubject"),
    text: [
      t("email.hi", { name }),
      "",
      t("email.welcomeIntro"),
      "",
      ...accountLines,
      "",
      `${t("email.logIn")}: ${loginUrl}`,
      "",
      t("email.welcomePrivate"),
    ].join("\n"),
    html: wrapHtml(
      `<p>${escapeHtml(t("email.hi", { name }))}</p>
<p>${escapeHtml(t("email.welcomeIntro"))}</p>
<ul>${accountLines.map((line) => `<li>${escapeHtml(line)}</li>`).join("")}</ul>
${linkHtml(loginUrl, escapeHtml(t("email.logIn")))}
<p style="font-size:0.875rem;color:#64748b">${escapeHtml(t("email.welcomeLandOn", { url: dashboardUrl }))}</p>`,
      locale,
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

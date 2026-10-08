import { NextResponse } from "next/server";
import { z } from "zod";

import { getContactEmail } from "@/lib/env";
import { sendRawEmail } from "@/server/notifications/client";
import {
  corsHeaders,
  dash,
  escapeHtml,
} from "@/server/website-forms/cors";

const contactSchema = z.object({
  name: z.string().trim().min(1).max(200),
  email: z.string().trim().email().max(320),
  phone: z.string().trim().max(50).optional(),
  subject: z.string().trim().min(1).max(200),
  message: z.string().trim().min(1).max(5000),
  company: z.string().max(200).optional(), // honeypot
});

export async function OPTIONS(request: Request) {
  const origin = request.headers.get("origin");
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(origin),
  });
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  const headers = corsHeaders(origin);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400, headers },
    );
  }

  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid form data" },
      { status: 400, headers },
    );
  }

  const { name, email, phone, subject, message, company } = parsed.data;

  // Honeypot: bots fill this; treat as success without sending.
  if (company?.trim()) {
    return NextResponse.json({ ok: true }, { headers });
  }

  const phoneLine = dash(phone);
  const text = [
    `Nieuw contactbericht via imfa.be`,
    "",
    `Naam: ${name}`,
    `E-mail: ${email}`,
    `Telefoon: ${phoneLine}`,
    `Onderwerp: ${subject}`,
    "",
    message,
  ].join("\n");

  const html = `<!DOCTYPE html>
<html lang="nl">
<body style="font-family:system-ui,sans-serif;line-height:1.5;color:#0f172a;max-width:32rem;margin:0 auto;padding:1.5rem">
  <h1 style="font-size:1.25rem;margin:0 0 1rem">Nieuw contactbericht</h1>
  <p style="margin:0 0 0.5rem"><strong>Naam:</strong> ${escapeHtml(name)}</p>
  <p style="margin:0 0 0.5rem"><strong>E-mail:</strong> ${escapeHtml(email)}</p>
  <p style="margin:0 0 0.5rem"><strong>Telefoon:</strong> ${escapeHtml(phoneLine)}</p>
  <p style="margin:0 0 1rem"><strong>Onderwerp:</strong> ${escapeHtml(subject)}</p>
  <div style="white-space:pre-wrap;border-top:1px solid #e2e8f0;padding-top:1rem">${escapeHtml(message)}</div>
</body>
</html>`;

  const ok = await sendRawEmail({
    to: getContactEmail(),
    subject: `[Contact] ${subject}`,
    text,
    html,
    replyTo: email,
  });

  if (!ok) {
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 502, headers },
    );
  }

  return NextResponse.json({ ok: true }, { headers });
}

import { NextResponse } from "next/server";
import { z } from "zod";

import { getContactEmail } from "@/lib/env";
import { sendRawEmail } from "@/server/notifications/client";
import {
  corsHeaders,
  dash,
  escapeHtml,
} from "@/server/website-forms/cors";

const optionalText = z.string().trim().max(2000).optional();

const trialSchema = z.object({
  player_name: z.string().trim().min(1).max(200),
  date_of_birth: z.string().trim().min(1).max(32),
  age: z.union([z.string(), z.number()]).transform(String),
  position: z.string().trim().min(1).max(100),
  strong_foot: z.string().trim().min(1).max(50),
  current_club: optionalText,
  previous_clubs: optionalText,
  football_experience: optionalText,
  level: optionalText,
  injury_history: optionalText,
  guardian_name: z.string().trim().min(1).max(200),
  guardian_phone: z.string().trim().min(1).max(50),
  guardian_email: z.string().trim().email().max(320),
  city: z.string().trim().min(1).max(200),
  why_imfa: z.string().trim().min(1).max(5000),
  ambitions: z.string().trim().min(1).max(5000),
  video_url: z.string().trim().max(500).optional(),
  website: z.string().max(200).optional(), // honeypot
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

  const parsed = trialSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid form data" },
      { status: 400, headers },
    );
  }

  const data = parsed.data;

  // Honeypot: bots fill this; treat as success without sending.
  if (data.website?.trim()) {
    return NextResponse.json({ ok: true }, { headers });
  }

  const rows: [string, string][] = [
    ["Naam speler", data.player_name],
    ["Geboortedatum", data.date_of_birth],
    ["Leeftijd", data.age],
    ["Positie", data.position],
    ["Sterke voet", data.strong_foot],
    ["Huidige club", dash(data.current_club)],
    ["Vorige clubs", dash(data.previous_clubs)],
    ["Voetbalervaring", dash(data.football_experience)],
    ["Niveau / competitie", dash(data.level)],
    ["Blessuregeschiedenis", dash(data.injury_history)],
    ["Contactpersoon", data.guardian_name],
    ["Telefoon", data.guardian_phone],
    ["E-mail", data.guardian_email],
    ["Woonplaats", data.city],
    ["Waarom Imhotep", data.why_imfa],
    ["Ambities", data.ambitions],
    ["Video / highlights", dash(data.video_url)],
  ];

  const text = [
    `Nieuwe proeftraining-aanvraag via imfa.be`,
    "",
    ...rows.map(([label, value]) => `${label}: ${value}`),
  ].join("\n");

  const html = `<!DOCTYPE html>
<html lang="nl">
<body style="font-family:system-ui,sans-serif;line-height:1.5;color:#0f172a;max-width:36rem;margin:0 auto;padding:1.5rem">
  <h1 style="font-size:1.25rem;margin:0 0 1rem">Nieuwe proeftraining-aanvraag</h1>
  <table style="width:100%;border-collapse:collapse">
    ${rows
      .map(
        ([label, value]) =>
          `<tr>
            <td style="padding:0.4rem 0.75rem 0.4rem 0;vertical-align:top;color:#64748b;white-space:nowrap">${escapeHtml(label)}</td>
            <td style="padding:0.4rem 0;vertical-align:top;white-space:pre-wrap">${escapeHtml(value)}</td>
          </tr>`,
      )
      .join("")}
  </table>
</body>
</html>`;

  const ok = await sendRawEmail({
    to: getContactEmail(),
    subject: `[Proeftraining] ${data.player_name}`,
    text,
    html,
    replyTo: data.guardian_email,
  });

  if (!ok) {
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 502, headers },
    );
  }

  return NextResponse.json({ ok: true }, { headers });
}

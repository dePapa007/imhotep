import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  SESSION_SECRET: z
    .string()
    .min(32, "SESSION_SECRET must be at least 32 characters"),
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  RESEND_API_KEY: z.string().min(1).optional(),
  EMAIL_FROM: z.string().min(1).optional(),
  APP_URL: z.string().url().optional(),
  CRON_SECRET: z.string().min(32).optional(),
  REMINDER_HOURS_BEFORE: z.coerce.number().int().positive().default(24),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error(
    "Invalid environment variables:",
    z.flattenError(parsed.error).fieldErrors,
  );
  throw new Error("Invalid environment variables. See logs above.");
}

export const env = parsed.data;

export function getAppUrl() {
  return env.APP_URL ?? "http://localhost:3000";
}

export function getEmailFrom() {
  return env.EMAIL_FROM ?? "Imhotep <noreply@imfa.be>";
}

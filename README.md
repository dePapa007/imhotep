# Soccer Academy

A mobile-first web application for a soccer academy where members register for trainings. Built with Next.js (App Router), TypeScript, Tailwind CSS, Prisma, and PostgreSQL.

This repository currently implements **Epic 1: Project Foundation & Architecture**. See [soccer-academy-development-plan.md](soccer-academy-development-plan.md) for the full roadmap.

## Tech stack

| Area       | Choice                  |
| ---------- | ----------------------- |
| Framework  | Next.js 16 (App Router) |
| Language   | TypeScript (strict)     |
| Styling    | Tailwind CSS v4         |
| Database   | PostgreSQL 16 (Docker)  |
| ORM        | Prisma 6                |
| Validation | Zod                     |
| Tooling    | ESLint, Prettier        |

## Prerequisites

- Node.js 20+ (developed on Node 22)
- Docker (for the local PostgreSQL database)

## Getting started

```bash
# 1. Install dependencies
npm install

# 2. Create your local env file
cp .env.example .env

# 3. Start PostgreSQL (Docker)
npm run db:up

# 4. Apply database migrations + generate the Prisma client
npm run db:migrate

# 5. Seed accounts (admin + demo trainer/user)
npm run db:seed

# 6. Start the dev server
npm run dev
```

The app runs at http://localhost:3000.

## Available scripts

| Script                | Description                                    |
| --------------------- | ---------------------------------------------- |
| `npm run dev`         | Start the development server                   |
| `npm run build`       | Production build                               |
| `npm run start`       | Run the production build                       |
| `npm run lint`        | Run ESLint                                     |
| `npm run typecheck`   | Type-check with `tsc --noEmit`                 |
| `npm run format`      | Format the codebase with Prettier              |
| `npm run db:up`       | Start the PostgreSQL container                 |
| `npm run db:down`     | Stop the PostgreSQL container                  |
| `npm run db:migrate`  | Create/apply migrations (`prisma migrate dev`) |
| `npm run db:reset`    | Reset the database                             |
| `npm run db:studio`   | Open Prisma Studio                             |
| `npm run db:generate` | Regenerate the Prisma client                   |
| `npm run db:seed`     | Seed admin + demo accounts                     |

## Project structure

```txt
src/
  app/
    (public)/        Public landing page  -> /
    (auth)/login/    Login placeholder    -> /login
    (dashboard)/     Shared dashboard shell (top bar + bottom nav)
      admin/         Admin dashboard      -> /admin
      trainer/       Trainer dashboard    -> /trainer
      user/          User dashboard       -> /user
    error.tsx        Route error boundary
    loading.tsx      Route loading state
    global-error.tsx Root error boundary
    not-found.tsx    404 page
  components/
    ui/              Base UI: button, input, card, modal, tabs
    layout/          Shell pieces: bottom nav, page heading
  lib/               env (Zod), prisma client, utils (cn)
  server/            Server actions / data access (added in later epics)
    notifications/   Resend email + dedupe ledger
  types/             Shared TypeScript types
prisma/
  schema.prisma      Database schema + migrations
```

## Authentication & roles

Custom session-based auth (no external service), following the Next.js 16 auth guide:

- Passwords are hashed with `bcryptjs`.
- A stateless JWT session (via `jose`) is stored in an HttpOnly cookie.
- `src/proxy.ts` (Next 16's renamed middleware) does optimistic redirects: unauthenticated users are sent to `/login`, and users are kept within their role's area.
- `src/server/auth/dal.ts` is the authoritative server-side layer. `getCurrentUser()` reads the user from the database (returning null for missing or inactive accounts), and `requireUser()` / `requireRole()` guard pages and server actions before any data is fetched.

Roles and their home routes: `ADMIN` -> `/admin`, `TRAINER` -> `/trainer`, `USER` -> `/user`.

### Demo accounts (after `npm run db:seed`)

| Role    | Email                  | Password       |
| ------- | ---------------------- | -------------- |
| Admin   | `admin@academy.test`   | `ChangeMe123!` |
| Trainer | `trainer@academy.test` | `ChangeMe123!` |
| User    | `user@academy.test`    | `ChangeMe123!` |

Admin email/password and the session secret are configured via `.env` (`ADMIN_*`, `SESSION_SECRET`). Change these before deploying.

> Security note: the proxy performs optimistic cookie checks only. The database-backed checks in the DAL are the real enforcement and run before any sensitive data is queried, so authorization is enforced server-side rather than only in the UI.

## Database

The schema models the MVP domain: `User`, `Category`, `TrainingTemplate`, `TrainingSession`, `TrainingTrainer`, `TrainingRegistration`, and `NotificationLog` (email deduplication ledger).

The `/admin` page reads live counts from the database to confirm the connection is working.

## Email notifications

Transactional email is sent via [Resend](https://resend.com) over HTTPS — no local mail server on the VPS is required.

| Event | Recipients |
| ----- | ---------- |
| Registration | Member who registered |
| Session cancelled | All registered members |
| Trainer assigned | Newly assigned trainer |
| Session full | All active admins |
| Training reminder | Registered members + assigned trainers (cron) |

Without `RESEND_API_KEY`, emails are logged to the console instead of sent (useful for local development). Each notification is recorded in `NotificationLog` with a unique dedupe key so the same event is never emailed twice.

### Environment variables

See [`.env.example`](.env.example) for the full list. Notification-related vars:

| Variable | Required in prod | Description |
| -------- | ---------------- | ----------- |
| `RESEND_API_KEY` | Yes | Resend API key |
| `EMAIL_FROM` | Yes | e.g. `Imhotep <noreply@imfa.be>` |
| `APP_URL` | Yes | e.g. `https://app.imfa.be` (links in emails) |
| `CRON_SECRET` | Yes | Protects `GET /api/cron/reminders` |
| `REMINDER_HOURS_BEFORE` | No | Default `24` |

## Deployment

Production deploys to the VPS at `app.imfa.be` via GitHub Actions (`.github/workflows/deploy.yml`) and `scripts/deploy.sh` (PM2 + Next.js standalone output).

Each deploy runs, in order:

1. `npm ci --include=dev`
2. `prisma migrate deploy` — apply pending migrations
3. `prisma db seed` — idempotent; creates the admin account from `ADMIN_*` env vars if missing (does not reset existing passwords)
4. `next build` + copy standalone assets and `.env`
5. PM2 restart

Place `.env` at `/var/www/app.imfa.be/.env` on the VPS. PM2 loads it via `env_file` in `ecosystem.config.js`; a copy is also placed in `.next/standalone/.env` for the Next.js runtime.

**First login after deploy:** use the credentials from your `.env` seed vars (defaults: `admin@academy.test` / `ChangeMe123!` unless you changed `ADMIN_EMAIL` / `ADMIN_PASSWORD`). Change the admin password after first login.

Required VPS env vars: `DATABASE_URL`, `SESSION_SECRET`, and notification vars if email is enabled.

### Resend setup (production)

1. Create a Resend account and API key.
2. Add and verify the `imfa.be` domain in Resend; publish the SPF/DKIM DNS records Resend provides.
3. Set `EMAIL_FROM` to an address on that domain (e.g. `Imhotep <noreply@imfa.be>`).
4. Set `RESEND_API_KEY`, `APP_URL`, and `CRON_SECRET` in the VPS environment (alongside existing secrets).

### Training reminder cron

Add an hourly crontab entry on the VPS (replace the secret with your `CRON_SECRET` value):

```bash
0 * * * * curl -sf -H "Authorization: Bearer YOUR_CRON_SECRET" https://app.imfa.be/api/cron/reminders
```

The endpoint sends reminders for sessions starting in the next `REMINDER_HOURS_BEFORE` hours (default 24), using a 1-hour window so hourly cron does not double-send.

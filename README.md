# Soccer Academy

A mobile-first web application for a soccer academy where members register for trainings. Built with Next.js (App Router), TypeScript, Tailwind CSS, Prisma, and PostgreSQL.

This repository currently implements **Epic 1: Project Foundation & Architecture**. See [soccer-academy-development-plan.md](soccer-academy-development-plan.md) for the full roadmap.

## Tech stack

| Area      | Choice                          |
| --------- | ------------------------------- |
| Framework | Next.js 16 (App Router)         |
| Language  | TypeScript (strict)             |
| Styling   | Tailwind CSS v4                 |
| Database  | PostgreSQL 16 (Docker)          |
| ORM       | Prisma 6                        |
| Validation| Zod                             |
| Tooling   | ESLint, Prettier                |

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

# 5. Start the dev server
npm run dev
```

The app runs at http://localhost:3000.

## Available scripts

| Script                | Description                                  |
| --------------------- | -------------------------------------------- |
| `npm run dev`         | Start the development server                 |
| `npm run build`       | Production build                             |
| `npm run start`       | Run the production build                     |
| `npm run lint`        | Run ESLint                                   |
| `npm run typecheck`   | Type-check with `tsc --noEmit`               |
| `npm run format`      | Format the codebase with Prettier            |
| `npm run db:up`       | Start the PostgreSQL container               |
| `npm run db:down`     | Stop the PostgreSQL container                |
| `npm run db:migrate`  | Create/apply migrations (`prisma migrate dev`) |
| `npm run db:reset`    | Reset the database                           |
| `npm run db:studio`   | Open Prisma Studio                           |
| `npm run db:generate` | Regenerate the Prisma client                 |

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
  types/             Shared TypeScript types
prisma/
  schema.prisma      Database schema + migrations
```

## Database

The schema models the MVP domain: `User`, `Category`, `TrainingTemplate`, `TrainingSession`, `TrainingTrainer`, and `TrainingRegistration`. Recurring rules (`TrainingTemplate`) are stored separately from the individual sessions users register for (`TrainingSession`).

The `/admin` page reads live counts from the database to confirm the connection is working.

## Deployment

The app is a standard Next.js project and can be deployed to Vercel, Railway, or Render.

- **Preview environments:** each pull request gets its own preview deployment (e.g. Vercel preview deployments).
- **Production:** the default branch deploys to production.
- Set `DATABASE_URL` as an environment variable in the hosting provider, pointing at a managed PostgreSQL instance.
- The build runs `prisma generate` automatically via the `postinstall` script. Run `prisma migrate deploy` against the production database as part of the release step.

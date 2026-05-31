# Soccer Academy Mobile-First Web Application Development Plan

## Product Goal

Build a mobile-first web application for a soccer academy where users can register for trainings.

The application has three roles:

- **Admin**: Full control over users, trainers, categories, trainings, schedules, and registrations.
- **Trainer**: Can view their own trainings and see which users registered.
- **User**: Can view the calendar and register for trainings that match their assigned category.

The application will be built with **Next.js**.

---

## Recommended Core Stack

| Area                 | Recommendation                                                    |
| -------------------- | ----------------------------------------------------------------- |
| Framework            | Next.js App Router                                                |
| Language             | TypeScript                                                        |
| Styling              | Tailwind CSS                                                      |
| Database             | PostgreSQL                                                        |
| ORM                  | Prisma or Drizzle                                                 |
| Auth                 | NextAuth/Auth.js, Clerk, Supabase Auth, or custom session auth    |
| Forms                | React Hook Form + Zod, or Server Actions with Zod validation      |
| Calendar UI          | Custom mobile-first calendar/list view first; full calendar later |
| Deployment           | Vercel, Railway, Render, or similar                               |
| Notifications, later | Email, WhatsApp, push notifications                               |

---

## Core Domain Model

Before development starts, align on these main entities:

| Entity                     | Purpose                                                          |
| -------------------------- | ---------------------------------------------------------------- |
| User                       | All people in the system: admins, trainers, academy members      |
| Role                       | Admin, Trainer, User                                             |
| Category                   | Age group, skill level, team, training group, etc.               |
| Training                   | A single training session or generated session from a recurrence |
| Training Recurrence        | Weekly, bi-weekly, monthly, or one-time                          |
| Training Assignment        | Which trainer is assigned to which training                      |
| Training Registration      | Which users registered for which training                        |
| Attendance, optional later | Tracks who actually attended                                     |

A key design decision: store **recurring training rules** separately from the actual **training sessions** users register for.

For example, an admin creates “U12 Training every Wednesday,” and the system generates individual sessions for the next 3 to 6 months.

---

# Epic 1: Project Foundation & Architecture

## Goal

Create a stable technical foundation for the application.

## Main Features

Set up the Next.js application with TypeScript, Tailwind CSS, linting, formatting, environment variables, database connection, and initial project structure.

## Suggested Structure

```txt
/app
  /(public)
  /(auth)
  /(dashboard)
  /admin
  /trainer
  /user
/components
/lib
/server
/db
/types
```

## Tasks

| Task                | Description                          |
| ------------------- | ------------------------------------ |
| Next.js project     | App Router-based project             |
| TypeScript          | Strict mode enabled                  |
| Tailwind CSS        | Mobile-first styling                 |
| Database            | PostgreSQL connection                |
| ORM                 | Prisma or Drizzle                    |
| Validation          | Zod schemas                          |
| UI base             | Buttons, inputs, cards, modals, tabs |
| Error handling      | Shared error and loading states      |
| Deployment pipeline | Preview and production environments  |

## Deliverables

- Public landing page
- Login placeholder
- Protected dashboard placeholder
- Database connection verified
- Mobile-first layout shell

## Acceptance Criteria

- App deploys successfully.
- Mobile layout works from the start.
- Developers can run the app locally.
- Database migrations are working.

---

# Epic 2: Authentication, Roles & Access Control

## Goal

Allow people to log in and ensure each role only sees what they are allowed to see.

## Roles

| Role    | Access                         |
| ------- | ------------------------------ |
| Admin   | Full system access             |
| Trainer | Own assigned trainings         |
| User    | Calendar and own registrations |

## Main Features

- Login
- Logout
- Session handling
- Role-based dashboard routing
- Protected pages
- Permission checks on server actions and API routes

## Tasks

| Task                          | Description                                  |
| ----------------------------- | -------------------------------------------- |
| Implement auth provider       | NextAuth/Auth.js, Clerk, Supabase, or custom |
| Create user model             | Name, email, role, category, active status   |
| Add role middleware           | Redirect users to correct dashboard          |
| Add server-side authorization | Prevent role bypassing                       |
| Add seed admin account        | First admin user for setup                   |
| Add account status            | Active/inactive users                        |

## Example Access Rules

| Action                  |            Admin | Trainer |    User |
| ----------------------- | ---------------: | ------: | ------: |
| Create training         |              Yes |      No |      No |
| View all trainings      |              Yes |      No | Limited |
| View assigned trainings |              Yes |     Yes |      No |
| Register for training   | Admin can manage |      No |     Yes |
| Manage users            |              Yes |      No |      No |
| Manage categories       |              Yes |      No |      No |

## Deliverables

- Working login/logout
- Role-based redirects
- Protected dashboard pages
- Seeded admin account

## Acceptance Criteria

- Admin can access admin area.
- Trainer cannot access admin pages.
- User cannot access trainer/admin pages.
- Authorization is enforced server-side, not only in the UI.

---

# Epic 3: Admin User & Trainer Management

## Goal

Allow admins to create and manage trainers and users.

## Main Features

- Create trainer
- Create user
- Edit trainer/user
- Deactivate user
- Assign role
- Assign category to user
- View user lists

## Tasks

| Task             | Description                                         |
| ---------------- | --------------------------------------------------- |
| Admin user list  | Searchable list of users                            |
| Create user form | Name, email, role, category                         |
| Edit user form   | Update name, role, category, status                 |
| Trainer list     | Filtered view of trainers                           |
| User detail page | Profile, category, registrations                    |
| Deactivation     | Disable login/registration without deleting history |

## Mobile UX

Use simple stacked cards instead of complex desktop tables:

```txt
[User Name]
Role: User
Category: U12
Status: Active
[Edit]
```

## Deliverables

- Admin can create trainers.
- Admin can create users.
- Admin can assign categories.
- Admin can deactivate users.

## Acceptance Criteria

- New trainers can log in and see the trainer dashboard.
- New users can log in and see the user dashboard.
- Users without a matching category cannot register for restricted trainings.
- Deactivated users cannot register.

---

# Epic 4: Category Management

## Goal

Allow admins to manage categories and use them to control training visibility and registration eligibility.

## Examples of Categories

- U8
- U10
- U12
- U15
- Goalkeepers
- Advanced
- Beginners
- Girls Academy
- Boys Academy

## Main Features

- Create category
- Edit category
- Archive category
- Assign category to users
- Assign category to trainings

## Tasks

| Task                | Description                      |
| ------------------- | -------------------------------- |
| Category list       | Admin view of all categories     |
| Create category     | Name, description, active status |
| Edit category       | Update category data             |
| Archive category    | Hide category without deleting   |
| Category assignment | Assign to users and trainings    |

## Important Rule

A user may only register for trainings where:

```txt
user.categoryId === training.categoryId
```

Later, this can be expanded to support multiple categories per user or training.

## Deliverables

- Category CRUD
- Category assignment to users
- Category assignment to trainings

## Acceptance Criteria

- Admin can create categories.
- Admin can assign users to categories.
- Admin can assign trainings to categories.
- Users only see or register for eligible category trainings.

---

# Epic 5: Training Schedule Management

## Goal

Allow admins to create one-time and recurring trainings.

## Training Fields

| Field                 | Description                          |
| --------------------- | ------------------------------------ |
| Title                 | Example: U12 Wednesday Training      |
| Description           | Optional details                     |
| Category              | Required                             |
| Location              | Field, hall, address                 |
| Start date/time       | Required                             |
| End date/time         | Required                             |
| Capacity              | Optional but recommended             |
| Trainers              | One or more assigned trainers        |
| Recurrence            | One-time, weekly, bi-weekly, monthly |
| Registration deadline | Optional                             |
| Status                | Scheduled, cancelled, completed      |

## Recurrence Types

| Type      | Example                                          |
| --------- | ------------------------------------------------ |
| One-time  | June 10, 18:00                                   |
| Weekly    | Every Wednesday                                  |
| Bi-weekly | Every other Friday                               |
| Monthly   | First Monday of each month, or same date monthly |

## Recommended Implementation

Store recurring rules separately from actual sessions:

```txt
TrainingTemplate
TrainingSession
```

Where:

```txt
TrainingTemplate = recurring rule
TrainingSession = actual training occurrence users register for
```

This avoids messy registration logic on abstract recurring events.

## Tasks

| Task                 | Description                                |
| -------------------- | ------------------------------------------ |
| Create training form | Admin form for one-time/recurring training |
| Recurrence logic     | Generate sessions from recurrence rule     |
| Edit training        | Update one session or future sessions      |
| Cancel training      | Cancel without deleting registrations      |
| Assign trainers      | Add/remove trainers                        |
| Assign category      | Link training to category                  |
| Capacity handling    | Optional max number of users               |

## Deliverables

- Admin can create one-time trainings.
- Admin can create recurring trainings.
- Admin can assign trainers.
- Admin can cancel trainings.
- Sessions appear in the calendar.

## Acceptance Criteria

- Weekly, bi-weekly, and monthly recurrence work.
- Generated sessions are visible to users.
- Trainers see assigned sessions.
- Cancelled sessions cannot accept registrations.

---

# Epic 6: Admin Calendar & Training Control

## Goal

Give admins a complete operational view of all trainings.

## Main Features

- Calendar/list view
- Training detail page
- Add/remove trainers from training
- Add/remove users from training
- View registrations
- Cancel training
- Edit training

## Mobile-First Recommendation

Start with a **list/calendar hybrid**, not a complex full-screen calendar.

Example:

```txt
Today
18:00 - U12 Training
Trainer: John
12 / 16 registered

Tomorrow
17:30 - Goalkeeper Training
Trainer: Sarah
8 / 10 registered
```

Later, add week/month calendar views.

## Tasks

| Task                | Description                       |
| ------------------- | --------------------------------- |
| Admin training list | By day/week/month                 |
| Training detail     | Registrations, trainers, category |
| Add trainer         | Assign trainer to session         |
| Remove trainer      | Remove trainer from session       |
| Add user            | Admin registers user manually     |
| Remove user         | Admin removes user registration   |
| Filters             | Category, trainer, status         |

## Deliverables

- Admin training calendar
- Training detail management
- Manual registration management

## Acceptance Criteria

- Admin can see all trainings.
- Admin can manually add eligible users.
- Admin can remove users.
- Admin can add/remove trainers.
- Admin can filter trainings.

---

# Epic 7: User Calendar & Registration Flow

## Goal

Allow users to view eligible trainings and register from mobile.

## Main Features

- User calendar
- Eligible trainings only
- Training detail page
- Register button
- Cancel registration button
- My trainings view

## User Rules

A user can register if:

| Rule                                    | Required           |
| --------------------------------------- | ------------------ |
| User is active                          | Yes                |
| Training is not cancelled               | Yes                |
| Training category matches user category | Yes                |
| Training has not started                | Yes                |
| Capacity is not full                    | If capacity exists |
| User is not already registered          | Yes                |

## Tasks

| Task                | Description                             |
| ------------------- | --------------------------------------- |
| User calendar       | Show eligible trainings                 |
| Training detail     | Date, time, location, trainer, category |
| Register action     | Create registration                     |
| Cancel registration | Remove or mark cancelled                |
| My trainings        | Upcoming registered trainings           |
| Empty states        | No eligible trainings, no registrations |

## Mobile UX

Primary screens:

```txt
User Home
- Next registered training
- Available trainings
- My trainings
```

Training card:

```txt
U12 Training
Wed 18:00 - 19:30
Location: Main Field
12 / 16 registered
[Register]
```

## Deliverables

- User can browse trainings.
- User can register.
- User can cancel registration.
- User can see upcoming registered trainings.

## Acceptance Criteria

- Users cannot register for wrong-category trainings.
- Users cannot register twice.
- Users cannot register for full trainings.
- Users cannot register for cancelled trainings.
- Registration works well on mobile.

---

# Epic 8: Trainer Dashboard

## Goal

Allow trainers to view their assigned trainings and registered users.

## Main Features

- Trainer dashboard
- Own training schedule
- Training detail
- Registered user list

## Trainer Permissions

Trainers can:

- View assigned trainings
- View registered users
- See category, location, date/time
- Optionally mark attendance in a future epic

Trainers cannot:

- Create trainings
- Delete trainings
- Assign users
- Assign categories
- Manage other trainers

## Tasks

| Task            | Description                         |
| --------------- | ----------------------------------- |
| Trainer home    | Upcoming assigned trainings         |
| Training list   | Own trainings only                  |
| Training detail | Registered users and details        |
| User list       | Name, category, registration status |
| Filters         | Upcoming, past, cancelled           |

## Deliverables

- Trainer dashboard
- Assigned training list
- Registered users view

## Acceptance Criteria

- Trainer sees only their own trainings.
- Trainer can see who registered.
- Trainer cannot access admin controls.
- Trainer view is optimized for mobile.

---

# Epic 9: Notifications & Communication

## Goal

Keep users and trainers informed about schedule changes and registrations.

This can be developed after the core product works.

## Main Features

- Registration confirmation
- Cancellation notification
- Training reminder
- Trainer assignment notification
- Admin notification for full sessions

## Channels

Start with email. Add WhatsApp or push notifications later.

## Tasks

| Task                      | Description                      |
| ------------------------- | -------------------------------- |
| Email service setup       | Resend, SendGrid, Postmark, etc. |
| Registration confirmation | Sent to user                     |
| Cancellation notice       | Sent when training is cancelled  |
| Trainer assignment email  | Sent to trainer                  |
| Reminder job              | Send reminder before training    |
| Notification preferences  | Optional later                   |

## Deliverables

- Email notifications for key events
- Admin-configurable reminder timing later

## Acceptance Criteria

- Users receive registration confirmation.
- Users are notified when a training is cancelled.
- Trainers are notified when assigned.
- Emails are not sent twice for the same event.

---

# Epic 10: Attendance Management

## Goal

Allow trainers or admins to track who actually attended a training.

## Main Features

- Attendance list
- Mark present/absent
- Notes
- Attendance history per user

## Tasks

| Task                    | Description                          |
| ----------------------- | ------------------------------------ |
| Attendance model        | Track status per registration        |
| Trainer attendance page | Mark registered users present/absent |
| Admin attendance view   | See and edit attendance              |
| User attendance history | Optional                             |
| Reports                 | Optional later                       |

## Deliverables

- Trainers can mark attendance.
- Admins can review attendance.

## Acceptance Criteria

- Attendance can only be marked for assigned trainings or by admins.
- Attendance history is preserved.
- Cancelled trainings do not require attendance.

---

# Epic 11: Admin Reporting & Insights

## Goal

Give admins visibility into academy usage.

## Possible Reports

| Report                     | Description                    |
| -------------------------- | ------------------------------ |
| Registrations per training | How full each training is      |
| Attendance rate            | Who attends regularly          |
| Category activity          | Which categories train most    |
| Trainer workload           | Number of sessions per trainer |
| User participation         | Training history per user      |

## Tasks

| Task              | Description       |
| ----------------- | ----------------- |
| Dashboard cards   | Key metrics       |
| Training export   | CSV export        |
| User export       | CSV export        |
| Attendance export | Optional          |
| Date filters      | Week/month/season |

## Deliverables

- Basic admin dashboard
- CSV exports
- Filterable reports

## Acceptance Criteria

- Admin can see registration totals.
- Admin can export useful data.
- Reports respect date filters.

---

# Epic 12: Mobile UX, PWA & Performance Polish

## Goal

Make the app feel fast and easy to use on mobile.

## Main Features

- Mobile navigation
- Fast loading states
- Offline-friendly shell, optional
- Add-to-home-screen, optional
- Responsive calendar/list views
- Accessibility

## Tasks

| Task              | Description                    |
| ----------------- | ------------------------------ |
| Bottom navigation | Role-based mobile nav          |
| Loading states    | Skeletons and spinners         |
| Empty states      | Friendly screens               |
| Error states      | Clear retry options            |
| Accessibility     | Labels, focus states, contrast |
| PWA manifest      | Optional                       |
| Performance pass  | Reduce unnecessary client JS   |

## Deliverables

- Polished mobile UI
- Better perceived performance
- App-like experience

## Acceptance Criteria

- Main flows are easy on a phone.
- Buttons and forms are thumb-friendly.
- Pages load quickly.
- Navigation is clear for each role.

---

# Epic 13: Security, Audit & Production Readiness

## Goal

Prepare the app for real users and operational reliability.

## Main Features

- Permission hardening
- Audit logging
- Input validation
- Rate limiting
- Backups
- Monitoring
- Error tracking

## Tasks

| Task                            | Description                  |
| ------------------------------- | ---------------------------- |
| Server-side authorization audit | Check every mutation         |
| Input validation                | Zod schemas everywhere       |
| Audit log                       | Track admin changes          |
| Rate limiting                   | Login and sensitive actions  |
| Error tracking                  | Sentry or similar            |
| Backups                         | Database backup strategy     |
| Monitoring                      | Uptime and performance       |
| Privacy checks                  | Handle user data responsibly |

## Deliverables

- Production checklist complete
- Monitoring configured
- Audit logging for important admin actions

## Acceptance Criteria

- Users cannot bypass permissions.
- Admin changes are logged.
- Errors are visible to the dev team.
- Database backup process exists.

---

# Suggested Development Order

## Phase 1: MVP Foundation

1. Project Foundation & Architecture
2. Authentication, Roles & Access Control
3. Admin User & Trainer Management
4. Category Management

## Phase 2: Core Scheduling Product

5. Training Schedule Management
6. Admin Calendar & Training Control
7. User Calendar & Registration Flow
8. Trainer Dashboard

## Phase 3: Operational Features

9. Notifications & Communication
10. Attendance Management
11. Admin Reporting & Insights

## Phase 4: Production Polish

12. Mobile UX, PWA & Performance Polish
13. Security, Audit & Production Readiness

---

# MVP Scope Recommendation

For the first release, include only:

- Login/logout
- Admin creates users/trainers
- Admin manages categories
- Admin creates one-time and recurring trainings
- Admin assigns trainers
- Users view eligible trainings
- Users register/cancel registration
- Trainers view assigned trainings and registered users
- Mobile-first UI

Postpone:

- Attendance
- Reports
- Advanced notifications
- Advanced calendar month views
- Multi-category users
- Payment features
- Native mobile app

---

# Important Technical Decisions to Make Early

## 1. Can a user have one category or multiple categories?

Start with **one category per user** unless the academy already needs multiple.

## 2. Can a training have one category or multiple categories?

Start with **one category per training**. Add multi-category support later if needed.

## 3. How far ahead should recurring trainings generate sessions?

Recommended: generate **3 to 6 months ahead**.

## 4. Should users be able to cancel registration?

Recommended: yes, but optionally block cancellation close to training start time.

## 5. Should trainings have capacity limits?

Recommended: yes, even if capacity is optional.

---

# Example MVP Data Model

```txt
User
- id
- name
- email
- role: ADMIN | TRAINER | USER
- categoryId
- active
- createdAt
- updatedAt

Category
- id
- name
- description
- active

TrainingTemplate
- id
- title
- description
- categoryId
- location
- recurrenceType: NONE | WEEKLY | BIWEEKLY | MONTHLY
- startDate
- endDate
- startTime
- endTime
- capacity
- active

TrainingSession
- id
- templateId
- title
- description
- categoryId
- location
- startsAt
- endsAt
- capacity
- status: SCHEDULED | CANCELLED | COMPLETED

TrainingTrainer
- id
- trainingSessionId
- trainerId

TrainingRegistration
- id
- trainingSessionId
- userId
- status: REGISTERED | CANCELLED
- registeredAt
```

---

# Recommended First Sprint

For Sprint 1, build:

| Item              | Outcome                         |
| ----------------- | ------------------------------- |
| Next.js app setup | Running project                 |
| Database setup    | Migrations working              |
| Auth setup        | Login/logout                    |
| Role routing      | Admin, Trainer, User dashboards |
| Basic layout      | Mobile-first dashboard shell    |
| Seed admin        | First admin can log in          |

This gives the team a clean foundation before building the scheduling logic.

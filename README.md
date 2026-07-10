# Dr. Shamali Gastroenterology Clinic — Patient Registry

A Next.js + Prisma patient-registry web app for Dr. Shamali Gastroenterology
Clinic. Built on the KUFPEC design system (deep corporate blue, Inter type),
with a real database, cookie-based authentication, and a searchable patient
registry.

## Features

- **Doctor login** — username/password, bcrypt-hashed, JWT httpOnly cookie session.
- **Patient registry** — searchable, sortable table with summary stat tiles.
- **Add / edit / delete patients** with full validation and delete confirmation.
- **Auto-generated file numbers** — `MGH-YYYY-0001`, assigned atomically so
  concurrent saves never collide.
- **Linked Area → Governorate** — selecting a Kuwait area fills the governorate
  automatically. All 6 governorates and 137 areas are seeded as lookup tables.
- **Nationality lookup** — 29 common nationalities, seeded and editable in the DB.
- **Audit log** — every create/update/delete is recorded with the acting user.

## Tech stack

- **Next.js 15** (App Router, Server Actions, Server Components)
- **Prisma 6** ORM
- **SQLite** out of the box (swap to Postgres for production — see below)
- **bcryptjs** + **jose** (JWT) for auth
- **zod** for input validation
- Hand-written CSS design system (no Tailwind), matching the KUFPEC app

## Generating test data

To load the registry with realistic random patients (for testing search,
sorting, and performance at scale):

```bash
npm run db:seed:patients          # creates 10,000 patients
npm run db:seed:patients 500      # creates 500 instead
COUNT=25000 npm run db:seed:patients

npm run db:clear:patients         # removes ALL patients, resets file numbers
```

Each generated patient is complete and valid: gender-appropriate names, a real
Area (with its linked Governorate) and Nationality from the lookup tables, a
unique 12-digit Civil ID, a Kuwait mobile number, and an atomically-assigned
file number. Run `npm run db:seed` first so the lookup tables exist.

The clear script only empties the Patient table — it leaves the lookup tables,
the doctor account, and the audit log untouched.

## Getting started

Requires Node.js 18.18+ (Node 20+ recommended).

```bash
# 1. Install dependencies
npm install

# 2. Set your environment
cp .env.example .env
#    Then edit .env and set JWT_SECRET to a long random value:
#      openssl rand -base64 48

# 3. Create the database schema and seed lookup data + the demo doctor
npm run setup        # = prisma generate && prisma db push && seed

# 4. Run the dev server
npm run dev
```

Open http://localhost:3000 and sign in:

- **Username:** `doctor`
- **Password:** `clinic123`

> Change this password before any real use. The demo account is created by the
> seed script (`prisma/seed.ts`).

## Project structure

```
app/
  layout.tsx                 Root layout (Inter font, global CSS)
  page.tsx                   Redirects to /patients or /login
  globals.css                KUFPEC design system + clinic styles
  login/page.tsx             Sign-in page
  patients/page.tsx          Registry: stats + searchable table
  patients/new/page.tsx      Add patient
  patients/[id]/edit/page.tsx  Edit patient
components/
  StomachLogo.tsx            3D anatomical stomach mark (SVG)
  TopBar.tsx                 App header with sign-out
  PatientTable.tsx           Client table: search, sort, delete modal
  PatientForm.tsx            Client form with linked Area→Governorate select
  SubmitButton.tsx           Pending-state submit button
lib/
  db.ts                      Prisma client singleton
  auth.ts                    Sessions, bcrypt, requireUser()
  env.ts                     Fail-fast JWT secret access
  actions.ts                 Server actions (login, CRUD, audit)
  file-number.ts             Atomic file-number generator
  lookups.ts                 Loads governorate/area/nationality options
  kuwait-data.ts             Reference data (governorates, areas, nationalities)
  utils.ts                   Form + formatting helpers
prisma/
  schema.prisma              Data model
  seed.ts                    Seeds lookups + demo doctor
middleware.ts                Protects /patients routes
```

## Local development with SQLite (optional)

The schema ships configured for **PostgreSQL** (so it deploys to Vercel). If you
prefer zero-setup local dev with SQLite instead, edit `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
  // remove the directUrl line
}
```

and set `DATABASE_URL="file:./dev.db"` in `.env`, then `npm run setup`.

## Deploying to Vercel

**Important:** Vercel's filesystem is read-only and ephemeral, so SQLite cannot
be used in production — you need a hosted Postgres database (Neon, Supabase,
Vercel Postgres, etc). The schema is already set up for Postgres.

### 1. Create a Postgres database

Create one on your provider of choice and copy two connection strings:
- the **pooled** URL (for `DATABASE_URL`)
- the **direct / non-pooled** URL (for `DIRECT_URL`)

On Neon, the pooled host contains `-pooler`; the direct host does not.

### 2. Set environment variables in Vercel

Project → **Settings → Environment Variables** — add these for Production
(and Preview if you want preview deploys to work):

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | your **pooled** Postgres connection string |
| `DIRECT_URL` | your **direct** Postgres connection string |
| `JWT_SECRET` | a random string ≥32 chars (`openssl rand -base64 48`) |

### 3. Deploy

Push the repo to GitHub and import it in Vercel (or run `vercel`). The build
command (`prisma generate && prisma db push && tsx prisma/seed.ts && next build`)
creates the tables, seeds the lookup data + demo doctor, and builds the app.

The seed uses upserts, so redeploys never duplicate lookup data or touch your
patient records. **Change the demo doctor password immediately after the first
deploy.**

## Security notes

This is a solid foundation, but before handling real patient data in production:

- Set a strong, unique `JWT_SECRET` and serve the app over HTTPS (the session
  cookie is marked `secure` in production automatically).
- Replace the demo doctor credentials; add real staff accounts.
- Move to PostgreSQL with regular backups.
- Consider data-protection requirements for medical records in your jurisdiction
  (access controls, encryption at rest, retention, audit review).
```

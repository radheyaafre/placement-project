# Placement Project

This folder now contains both the planning documents and a starter MVP app for a motivation-based placement preparation platform.

## What is included

- `app/` - Next.js App Router scaffold for the student and admin flows
- `components/` - shared UI building blocks
- `lib/` - demo mode, data loaders, scoring logic, auth helpers, reminder helpers
- `supabase/migrations/20260424_initial_schema.sql` - initial database schema with RLS
- `supabase/seed.sql` - sample seed content for the full first week
- `supabase/seed_rich_content.sql` - generated richer 90-day content seed plus a 1000-question aptitude bank
- `public/plan-template.csv` - starter CSV template for admin imports
- `01-mvp-feature-spec.md` - product scope and feature spec
- `02-database-schema-and-page-flow.md` - schema and route-level flow
- `03-starter-architecture-nextjs-supabase-vercel.md` - architecture notes

## Current MVP state

The app currently supports:

- landing page
- login and signup screens
- onboarding flow
- dashboard with progress and streak summary
- daily mission page with attempt, solution unlock, and completion flow
- progress page
- settings page
- admin content preview page
- API stubs for CSV import validation and reminder cron
- demo mode fallback when Supabase env vars are not configured

## Demo mode

If you run the app without Supabase env vars, it uses cookie-based demo state so the product can still be explored immediately.

Demo mode includes:

- sample profile
- sample reminder settings
- sample 7-day mission set
- mission attempt and completion flow persisted in cookies

## Run locally

1. Install dependencies with your package manager of choice:
   `npm install`
2. Copy `.env.example` to `.env.local`
3. Start the app:
   `npm run dev`

Open `http://localhost:3000`.

## Connect Supabase

1. Create a Supabase project.
2. Run the SQL in [20260424_initial_schema.sql](/Users/rsafre/Docs/placement_project/supabase/migrations/20260424_initial_schema.sql).
3. Run the sample seed in [seed.sql](/Users/rsafre/Docs/placement_project/supabase/seed.sql).
4. Add these env vars in `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `CRON_SECRET`
   - `RESEND_API_KEY`
   - `REMINDER_FROM_EMAIL`
   - `BUG_REPORT_TO_EMAIL`
5. Restart the dev server.

## Generate the rich content seed

Run:
`npm run generate:rich-seed`

This regenerates [seed_rich_content.sql](/Users/rsafre/Docs/placement_project/supabase/seed_rich_content.sql) using the content generator in [generate-rich-seed.mjs](/Users/rsafre/Docs/placement_project/scripts/generate-rich-seed.mjs).

## Deploy to Vercel

1. Push this folder to a Git repository.
2. Create a Supabase project and run:
   - [20260424_initial_schema.sql](/Users/rsafre/Docs/placement_project/supabase/migrations/20260424_initial_schema.sql)
   - [seed.sql](/Users/rsafre/Docs/placement_project/supabase/seed.sql)
3. In Supabase Auth settings, add your Vercel production URL to the site URL and redirect URLs.
4. Import the Git repository into Vercel.
5. Add the production environment variables from `.env.example`, but set `NEXT_PUBLIC_APP_URL` to the deployed Vercel URL.
6. Redeploy after adding the environment variables.

## Reminder email note

The weekly reminder sender route exists, but the MVP currently ships with a scaffolded cron handler. The app UI and reminder preferences are ready, and the production email sender can be completed as the next backend slice.

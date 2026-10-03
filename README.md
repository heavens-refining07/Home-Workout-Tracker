# Home Workout Tracker — Render edition

This is a standalone conversion of the source in **Home Workout Tracker1.json**. The exported landing page and 15 application screens now use the approved white, black, and red theme while retaining their text, data, charts, and workout functionality. The application is branded **FitTracker** in the original source.

## Included

Dashboard, exercise library and favorites, guided workout tracking, workout plans, BMI calculator and history, progress charts, body measurements, fitness goals, workout calendar/history, achievements, profile, reports, reminders, and admin exercise management.

The original 20 backend functions run behind a standalone Node server. Email/password login replaces Zite-managed login. PostgreSQL stores accounts, sessions, and app records on Render. Local development uses SQLite automatically. Private records are restricted to their owner; admin access is configured by email.

## Run locally

Install Node.js 24, open this directory in a terminal, then run:

```sh
npm ci
npm run build
npm start
```

Open http://localhost:3000. Create an account through **Get Started**. For development with live frontend updates, use `npm run dev` and open http://localhost:5173. Copy `.env.example` to `.env` when using development environment settings. For the built app, use `node --env-file=.env server-dist/server/index.js` to load that file.

## Deploy on Render

1. Unzip this project and push its contents to a GitHub repository. `package.json` and `render.yaml` must be at the repository root.
2. In Render, select **New → Blueprint**, connect that repository, and select its `render.yaml`.
3. Set `ADMIN_EMAILS` to your email address, or a comma-separated list of administrator emails. Use those exact addresses when registering accounts.
4. Review Render's service/database plan selections and deploy. The blueprint defines a Node web service and a PostgreSQL database.
5. Open the service URL and create your account. Twelve starter exercises with instructions and NASM demonstration videos are installed automatically. An administrator can add exercises and video URLs from the Admin screen.

The configured build command is `npm ci --include=dev && npm run build`; the start command is `npm start`; the health check is `/api/health`. Production startup requires `DATABASE_URL`; the blueprint connects it automatically. Use the database's internal URL when configuring services manually.

Render documentation: [Blueprints](https://render.com/docs/blueprint-spec), [Node apps](https://render.com/docs/deploy-node-express-app), [PostgreSQL connections](https://render.com/docs/postgresql-creating-connecting), [free service limits](https://render.com/docs/free).

The blueprint selects free plans for an initial preview. Render's free PostgreSQL database expires after 30 days; choose a suitable paid database plan for ongoing use. Free web services also sleep after inactivity.

## What the export does and does not contain

The JSON contains original source files, database field definitions, and compiled Zite artifacts. It contains **no database rows**. Existing users, passwords, exercises, plans, and workout history are therefore not migrated. This version adds a new starter catalogue of 12 exercises, with written form summaries and demonstration links from [NASM's exercise library](https://www.nasm.org/resource-center/exercise-library/push-up). These are new starter records, rather than recovered Zite records. Export your original records separately if you want to migrate them.

Exercise Library shows a short instruction on each card, an expandable guide with four steps and a video, and a **Start exercise** button. That button opens Workout with the chosen exercise selected and its guide expanded; press **Start Workout** to begin the countdown and tracked session. Starter data installs once and preserves later admin edits or deletions. See [exercise sources](EXERCISE-SOURCES.md) for the complete references.

Zite's hosted login and worker runtime cannot run directly on Render, so this version supplies its own login screen and database adapter. The original source's workout-completion function cleared the workout owner, title, and date; that defect is corrected to keep history and achievements working. BMI inputs also reject zero/negative height and weight.

The source contains reminder management, but no background reminder delivery service. This conversion preserves that behavior. The existing plan/calendar/report features retain their source behavior.

## Checks

```sh
npm run typecheck
npm run build
npm test
```

The integration test covers all 20 app API functions, registration/login/logout, administrator access, cross-account read/write isolation, validation, completed-workout history and achievements, and persistence across a server restart. It uses SQLite locally. A live Render deployment and a real PostgreSQL connection still need to be checked after deployment.

## Project structure

- `apps/home-workout-tracker1`: original React screens plus portable login/client adapters
- `packages/components`: original shared UI components
- `.zite/db.ts` and `zite.schema.json`: exported database types/schema
- `server`: standalone server and storage adapter
- `scripts`: build/development scripts
- `tests`: integration checks
- `render.yaml`: Render deployment blueprint

Keep local `.data/`, `.env`, and `node_modules/` out of Git. The deployment package contains source and its dependency lockfile, rather than local user records.

## UI refresh

White backgrounds, near-black typography, red actions and progress indicators, pale red navigation selection, light chart grids, and rounded cards apply throughout the app. The landing page and dashboard follow the approved reference images. Secondary statuses use labeled black/gray/red treatments. Mobile navigation and keyboard focus remain available. Backend and exercise-guide functionality are unchanged.

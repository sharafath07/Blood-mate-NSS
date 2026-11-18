# Blood Mate NSS

An internal coordinator app for managing student donor consent, blood requests, and contact and donation outcomes.

## Local setup

Use Node.js 24, npm, and a PostgreSQL database. Copy each app's `.env.example` to `.env` in the same folder. Set the database URL, a strong JWT secret, and the initial coordinator account values in the backend file. The sample origins use port 5173 for the frontend and 5000 for the API.

In `blood-mate-backend`:

```sh
npm ci
npm exec -- prisma validate
npm run prisma:generate
npm exec -- prisma migrate deploy
npm run prisma:seed
npm run dev
```

In `blood-mate-frontend`:

```sh
npm ci
npm run dev
```

Open the frontend origin and sign in with one of the seeded accounts. Existing accounts keep their password when seeding runs again. An operator can rotate a password by updating its bcrypt hash through a controlled maintenance procedure and updating the account timestamp to expire earlier sessions.

## Coordinator workflow

1. Add a student or validate an Excel workbook. Record donor consent explicitly. Only an administrator can commit a workbook import.
2. Create a blood request with a blood group, units, and bystander contact. Set urgency, the required date, and notes when relevant.
3. Open **Find donors** on the request. The list checks exact blood group, current consent, donor enrollment, and current availability. The request's saved match count represents a snapshot from creation or a blood-group edit.
4. Select a donor and prepare a WhatsApp draft. Open it in WhatsApp, send it there, then use **Mark as sent** to record the contact. Blood Mate records the coordinator's confirmation. WhatsApp delivery and read receipts are outside the app.
5. In **Donor contacts**, record the donor's response and the number of completed units. A request becomes fulfilled when recorded units meet the requested units. An acceptance records willingness without adding completed units.

Both coordinator roles can view and update students, requests, and contact outcomes. Only administrators can import students or delete requests. A request with contact or response history is retained.

## Workbook format

Upload an `.xlsx` or `.xls` file up to 10 MB and 10,000 rows. Blood Mate reads the first worksheet. Include these column headers:

- `Full Name`
- `Blood Group` such as `A+` or `O-`
- `Contact Number` or `WhatsApp Number`. Store phone cells as text to retain formatting.
- `Department`, `Age`, `Address`, `Gender`, and `Semester` are optional.
- `Are you willing to donate blood` accepts Yes, Y, or True for affirmative consent. An omitted value leaves the student inactive.
- `Weight` and `Timestamp` are optional legacy import fields.

Preview and validate the file before importing. Import skips enabled duplicate phone rules against the file and database. Uploaded copies are cleaned up after processing.

## Verification and deployment

For the integration test, create a dedicated PostgreSQL database whose name ends in `_test`, migrate it with `prisma migrate deploy`, and point `BLOOD_MATE_TEST_DATABASE_URL` at it before running `npm test` in the backend. Tests insert synthetic records into that database. Run `npm run lint` and `npm run build` in the frontend. CI runs those checks and replays migrations on an empty database.

For deployment, build the frontend with the production `VITE_API_URL`. Publish its `dist` directory with a history fallback to `index.html`. Use a distinct API service or forward `/api` to Express. Set `FRONTEND_URL` to the allowed frontend origin or comma-separated origins. Configure HTTPS, PostgreSQL backups, and a secret of at least 32 characters in production. Generate Prisma Client, apply migrations, build the backend, then run `npm start`. Use `GET /api/health` for readiness.

Before upgrading an older populated database, take a restorable backup and rehearse the migration chain on a copy. The historical bystander migration assumes compatible backfilled values, and the old semester migration drops `academicYear`. Verify older fulfilled requests against the donation records available to your coordinators.

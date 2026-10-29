# Tech Stack, How to Run, and Database Scaling Notes

## Tech stack

| Layer | Choice |
|---|---|
| Runtime | Node.js ≥18.17, ESM, no build step |
| Server | Express 4 |
| ORM/DB | Prisma — **SQLite** locally (`prisma/schema.prisma`), **PostgreSQL** in Docker/prod (`prisma/postgres/schema.prisma`) — two parallel schema+migration trees kept manually in sync |
| Auth | JWT in httpOnly cookie + bcrypt (cost 12) |
| Validation | zod |
| Hardening | helmet (CSP), express-rate-limit on `/auth` and `/ai` (in-memory store) |
| Secrets | AES-256-GCM for user-supplied LLM keys (`src/crypto.js`), derived from `JWT_SECRET` if `ENCRYPTION_KEY` unset |
| Email | nodemailer (SMTP optional; falls back to console-logged reset links) |
| Logging | pino / pino-http JSON logs, request-ID per request, secrets redacted |
| Startup checks | `src/env.js` fails fast on missing/insecure `JWT_SECRET`/`DATABASE_URL`/`ENCRYPTION_KEY` |
| Health | `GET /api/health` (liveness), `GET /api/health/ready` (DB ping) |
| Frontend | Vanilla HTML/CSS/JS in `public/`, no framework/bundler |
| Containerization | `Dockerfile` (node:20-alpine) + `docker-compose.yml` (app + postgres:16-alpine, named volume `pgdata`) |

Routes: `src/routes/{auth,resume,applications,ai,aiConfig}.js`. Data model: `User` (1:1 `Resume`, 1:many `Application`).

## How to run

### Local (SQLite, fastest path)

```bash
npm install
cp .env.example .env          # edit JWT_SECRET at minimum
npm run setup                 # prisma generate + migrate deploy → prisma/dev.db
npm start                     # http://localhost:3000
```

`npm run dev` uses `node --watch` for autoreload. First signup becomes admin.

### Docker + Postgres (matches production)

```bash
cp .env.example .env          # JWT_SECRET, POSTGRES_PASSWORD, LLM_*
docker compose up --build     # http://localhost:3000
```

On container start, `prisma migrate deploy --schema=prisma/postgres/schema.prisma` runs automatically against the `db` service before `node src/server.js` launches. `docker compose down -v` is the only thing that deletes the `pgdata` volume.

## Database overview & scaling to production

**Current model** is small and clean: `User` → `Resume` (1:1), `User` → `Application` (1:many, indexed on `userId`). JSON-shaped fields (`analysis`, `compat`, `tailored`) are stored as raw `String`, and the uploaded résumé file is stored as a base64 data URL directly in the `Resume.originalData` column.

To take this to real production scale:

1. **Managed Postgres over self-hosted.** Point `DATABASE_URL` at RDS/Cloud SQL/Neon/Supabase/Fly Postgres instead of the docker-compose container — you get automated backups, PITR, and failover for free. The docker-compose `db` service is fine for staging/single-VM deploys, not for anything you can't afford to lose.

2. **Connection pooling.** Prisma opens a connection per app instance/worker; if you ever run more than one container or move to serverless, put PgBouncer (or Prisma Accelerate) in front of Postgres — Postgres' default `max_connections` (~100) gets exhausted fast otherwise.

3. **Move file storage out of the database.** `Resume.originalData` holding base64-encoded files inline in Postgres will bloat table size and slow backups/vacuum as users grow. Swap it for object storage (S3/R2/Cloudflare) and store just a key/URL in the row.

4. **Use JSONB, not String, for JSON columns.** `analysis`/`compat`/`tailored`/etc. are semantically JSON but typed as `String` in both schemas — switching to Postgres' native `Json` type (JSONB) enables indexing/querying into those fields later and is cheap to do now, expensive to migrate once there's real data.

5. **Rate limiting won't work correctly across multiple instances.** `express-rate-limit`'s default store is in-memory per-process — the moment you run more than one app container/replica behind a load balancer, limits become per-instance instead of global. Back it with Redis (`rate-limit-redis`) before horizontally scaling.

6. ~~**Add indexes as query patterns emerge.**~~ Done: `@@index([userId, status])` and `@@index([userId, createdAt])` were added alongside the tracker's status filter and sort UI (migration `20260905120000_notes_followup` / `2_notes_followup`).

7. **Keep the dual-schema workaround in mind.** `prisma/schema.prisma` (SQLite/dev) and `prisma/postgres/schema.prisma` (prod) must be hand-edited together — there's no dev/prod parity if one drifts. For a real team, it's worth just running Postgres locally too (uncomment the `ports:` block in docker-compose) and dropping the SQLite path entirely to remove that foot-gun.

8. **Backups + migration discipline.** `prisma migrate deploy` runs on every container start (good — no manual step) but there's no automated backup job wired up anywhere; that needs to come from the hosting platform (managed Postgres snapshots) since nothing in this repo does it.

The app itself is already stateless (JWT, no server-side sessions) so horizontal scaling of the app tier is mostly free once #2 and #5 above are handled — the database is the actual bottleneck to plan around.

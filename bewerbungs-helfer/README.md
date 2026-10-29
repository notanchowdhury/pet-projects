# Bewerbungs-Helfer — German Job Application Tailor

A production-ready web app that helps you land a German software engineering role by solving the two real blockers: **German-language job ads** and **a résumé that isn't tuned to each circular.**

Users sign up, log in, and get their own private workspace. Paste a job ad in any language → it translates to English (original kept side by side) → extracts the real requirements out of the boilerplate → scores your fit against your résumé → then tailors your résumé and drafts a matching cover letter (German *Anschreiben* or English). Export as PDF, Word, or Markdown, and track every application.

**Bring your own key:** each user adds their own Anthropic / OpenAI / Gemini API key in the app. It's stored AES-256-GCM encrypted on the server and never sent back to the browser. The operator can optionally set a shared key for themselves (admins) — see `BUILTIN_AI_ACCESS`.

---

## Architecture

| Layer | Choice | Why |
|---|---|---|
| Runtime | **Node.js ≥ 18.17** (ESM) | Native `fetch`, no build step |
| Server | **Express** | Simple, battle-tested |
| Database | **Prisma ORM** — SQLite by default, one-line switch to **PostgreSQL** | Zero-setup locally, production-grade when scaled |
| Auth | **JWT in an httpOnly cookie**, **bcrypt** password hashing | Standard, secure session handling |
| Validation | **zod** | Every request body validated |
| Hardening | **helmet** (CSP), **express-rate-limit** on auth + AI | Sensible production defaults |
| Frontend | Vanilla HTML/CSS/JS in `public/` | Keeps the original design; no framework build |

The browser only ever talks to this server's `/api`. All AI calls are proxied through `POST /api/ai/*` using either the user's own (encrypted) key or the optional shared `LLM_API_KEY`.

```
src/
  server.js              app wiring, helmet CSP, static hosting, error handler
  db.js                  Prisma client
  auth.js                JWT issue/verify, requireAuth / requireAdmin
  llm.js                 provider dispatch (Claude/OpenAI/Gemini) + prompts (server-side key)
  routes/
    auth.js              signup / login / logout / me   (first account becomes admin)
    resume.js            master résumé + held original file
    applications.js      tracker CRUD
    ai.js                analyze / fit / tailor
prisma/schema.prisma     User, Resume, Application
public/                  index.html, styles.css, app.js  (the SPA)
```

---

## Quick start (local)

```bash
# 0. Get the code (this project lives in the pet-projects monorepo)
git clone https://github.com/notanchowdhury/pet-projects.git
cd pet-projects/bewerbungs-helfer

# 1. Install
npm install

# 2. Configure
cp .env.example .env         # then edit .env — see below

# 3. Create the database
npm run setup                # prisma generate + migrate deploy  (creates prisma/dev.db)

# 4. Run
npm start                    # → http://localhost:3000
```

Open `http://localhost:3000`, click **Sign up**. **The first account you create becomes the admin.**

> `.env` is gitignored and never committed. **Set your own `JWT_SECRET`** before doing anything real. `LLM_API_KEY` is optional — without it, users add their own key in the app.

### `.env`

```
PORT=3000
COOKIE_SECURE=false                 # set true when served over HTTPS
JWT_SECRET=<long random string>     # node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
DATABASE_URL="file:./dev.db"        # SQLite (default)
LLM_PROVIDER=anthropic              # anthropic | openai | gemini
LLM_MODEL=claude-sonnet-5           # e.g. claude-sonnet-5 / gpt-4o / gemini-3.5-flash
LLM_API_KEY=<optional shared key>   # never sent to browsers; leave blank for pure bring-your-own-key
BUILTIN_AI_ACCESS=admins            # admins (default) | all | none — who may use LLM_API_KEY
```

With `BUILTIN_AI_ACCESS=admins` (the default) you can keep your own key on the server for yourself while every other user must add theirs — so a public deployment can't run up your bill. Use `all` only on a private/trusted deployment.

---

## Running with Docker + PostgreSQL

The repo ships a Dockerized stack: **PostgreSQL** (with a persistent named volume) + the app. This is the recommended way to run in production, and it's the "Postgres from a container" setup — data survives restarts because it lives in the `pgdata` volume.

```bash
cp .env.example .env         # fill in JWT_SECRET, LLM_*, and POSTGRES_PASSWORD
docker compose up --build    # → http://localhost:3000
```

- **Data persistence:** stored in the `pgdata` volume. `docker compose down` stops containers but **keeps** the data; only `docker compose down -v` deletes it.
- **How the DB is created:** the app image builds the Prisma client against `prisma/postgres/schema.prisma` and runs **`prisma migrate deploy`** on startup — applying the committed migrations in `prisma/postgres/migrations/` (real migration history). To evolve the model, add a new migration folder there (see the header comment in `prisma/postgres/schema.prisma`).
- **Local SQLite is untouched:** `npm start` still uses SQLite (`prisma/schema.prisma` + `prisma/migrations/`) with your existing `prisma/dev.db`. Docker uses Postgres (`prisma/postgres/`). The two schemas are kept identical on purpose — **if you change the data model, edit both `prisma/schema.prisma` and `prisma/postgres/schema.prisma`, and create a migration in each.**
- **Migrating existing SQLite data to Postgres** is not automatic. Dev data (a couple of accounts) is easiest to just re-create; ask if you want a copy script.

## Deploying to production

1. **Use PostgreSQL.** In `prisma/schema.prisma` change `datasource db { provider = "postgresql" }`, set `DATABASE_URL` to your Postgres connection string, then run `npx prisma migrate deploy`.
2. **Set a strong `JWT_SECRET`** and `NODE_ENV=production` (the app refuses to start in production with the placeholder secret).
3. **Serve over HTTPS** and set `COOKIE_SECURE=true` so the auth cookie is secure. `trust proxy` is already enabled for reverse proxies.
4. **Optionally set `LLM_API_KEY`** (and provider/model) in the host's environment — keep `BUILTIN_AI_ACCESS=admins` on a public deployment. Set a dedicated `ENCRYPTION_KEY` so users' saved keys stay readable even if you rotate `JWT_SECRET`.
5. Run `npm start` (or a process manager / container). Any Node host works — Render, Railway, Fly, a VM, Docker, etc.

---

## Security notes

- Passwords are bcrypt-hashed (cost 12); plaintext is never stored.
- Sessions are stateless JWTs in an httpOnly, sameSite=lax cookie.
- The shared LLM key is server-side only (env var, never in the DB or browser). Users' own keys are AES-256-GCM encrypted at rest with `ENCRYPTION_KEY`, and are never returned to the browser after saving.
- Auth endpoints and AI endpoints are rate-limited.
- CSP restricts scripts/connections to same-origin plus the two CDNs the frontend uses (`cdnjs` for pdf.js/mammoth, `jsdelivr` for the Word exporter).
- Every user's résumé and applications are scoped to their own account server-side.

---

## Features

- **Landing page** — a public overview of what the tool does, with Sign up / Log in.
- **Accounts** — email/password signup & login; first user is admin.
- **Password recovery** — four ways to recover/change a password:
  1. **Forgot password** (self-service): "Forgot password?" on login → enter email → a reset link (valid 1 hour, single-use) is emailed. Without SMTP configured, the link is printed to the **server console** (dev). The link opens `/reset?token=…` to set a new password.
  2. **Change password** while logged in — Account tab.
  3. **Admin reset** — an admin can reset any user's password from the Admin tab; a one-time temporary password is shown to relay.
  4. **CLI** (locked-out admin safety net): `npm run set-password -- <email> <newPassword>`.
  - Email delivery uses SMTP when `SMTP_HOST`/`SMTP_PORT` are set (see `.env`); otherwise reset links log to the console. Set `BASE_URL` in production so links point at your real domain.
- **Per-user AI choice** — after signup, each user picks either the **built-in AI** (the admin's shared `LLM_API_KEY`) or **their own API key** (Claude/OpenAI/Gemini). Own keys are stored **AES-256-GCM encrypted at rest** and used only server-side. Changeable anytime in the Account tab. If the admin leaves `LLM_API_KEY` blank, every user just brings their own key.
- **Admin portal** (admin-only 🛡️ tab) — service usage overview (users, admins, résumés, applications) and user management: promote/demote roles, delete users (cascades their data). Guardrails prevent deleting your own account or removing the last admin. Résumé/application *content* is never exposed — only counts.
- **JD translation** — German original + English side by side.
- **Requirement extraction** — must-haves / nice-to-haves / tech stack / seniority, with a **separate German-language flag** as a go/no-go signal.
- **Honest fit check** — 0–100 score, matched evidence, gap list, recommendation.
- **Tailoring** — works off your saved master résumé (no drift), never fabricates; German *Anschreiben* or English cover letter.
- **Held original file** — re-download the exact résumé file you uploaded.
- **Exports** — PDF (selectable text, ATS-safe), real editable **.docx**, or Markdown.
- **Tracker** — company, role, JD language, fit score, status per application; search, filter by status, and sort by date/score/company.
- **Kanban board** — drag-and-drop view of the tracker, one column per status, alongside the table view (toggle in the toolbar).
- **Follow-up reminders & notes** — set a follow-up date and free-text notes per application; a due badge shows once the date passes.
- **CSV export** — download the (filtered) tracker as a spreadsheet-ready CSV.

---

## Production hardening

- **Structured logging** — [pino](https://getpino.io)/`pino-http` JSON logs with a request ID on every request/response (also returned as `x-request-id`), secrets redacted.
- **Fail-fast startup** — `src/env.js` validates `JWT_SECRET`/`DATABASE_URL`/`ENCRYPTION_KEY` before the server binds a port; refuses to start in production with an insecure/missing secret.
- **Health checks** — `GET /api/health` (liveness) and `GET /api/health/ready` (readiness, pings the database) for load balancers/orchestrators.
- **Graceful shutdown** — on `SIGTERM`/`SIGINT` the HTTP server stops accepting new connections, in-flight requests finish, then the DB pool disconnects (with a 10s force-exit fallback).
- **Compression** — gzip/deflate via `compression` middleware.
- **Docker** — the app container runs as a non-root user and has a `HEALTHCHECK` against `/api/health`; `docker-compose.yml` wires the same healthcheck for the `app` service.
- **Tests** — `npm test` runs the Node built-in test runner (auto-discovers `test/*.test.js`) (crypto round-trip, LLM response parsing, AI-key resolution).

---

## Notes / limits

- Model IDs change; set `LLM_MODEL` to whatever's current for your account/provider.
- PDF/DOCX résumé parsing and the Word exporter load small libraries from a CDN on first use; offline, paste text and use PDF/Markdown export.
- The held original file is capped at ~4MB (fine for a normal résumé PDF).

# Setup

## Prerequisites

- Node.js v14 or later (`README.md:29`)
- npm (workspaces support — Node 14+/npm 7+)
- Docker and Docker Compose (for Postgres + pgAdmin)

## Install

From repo root:

```bash
npm install                # installs root + workspaces (backend, frontend)
# alternatively:
npm run install:all        # explicit per-workspace install
```

## Environment Variables

Backend loads `.env.${NODE_ENV}` (default `development`) from `backend/`. Both files are gitignored. No `.env.example` is committed — create your own.

Variables read by the backend (via `ConfigService.get(name, default)`):

| Variable | Default | Source |
|---|---|---|
| `PORT` | `3000` | `backend/src/main.ts:42` |
| `NODE_ENV` | `development` | `backend/src/app.module.ts:16` |
| `DB_HOST` | `localhost` | `app.module.ts:25`, `typeorm.config.ts:12` |
| `DB_PORT` | `5432` | `app.module.ts:26` |
| `DB_USERNAME` | `postgres` | `app.module.ts:27` |
| `DB_PASSWORD` | `postgres` | `app.module.ts:28` |
| `DB_DATABASE` | `scheduling_app` | `app.module.ts:29` |
| `DB_SYNCHRONIZE` | `false` | `app.module.ts:31` |
| `DB_MIGRATIONS_RUN` | `false` | `app.module.ts:33` |
| `DB_LOGGING` | `false` | `app.module.ts:34` |
| `JWT_SECRET` | `your-secret-key` (insecure) | `auth/auth.module.ts:18` |
| `JWT_EXPIRES_IN` | `1d` | `auth/auth.module.ts:20` |

> The fallback `JWT_SECRET` is a hard-coded literal — must be overridden in any non-development environment.

Example `backend/.env.development`:

```
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=scheduling_app
DB_LOGGING=true
JWT_SECRET=<replace-me>
JWT_EXPIRES_IN=1d
```

## Run (Development)

1. Start the database stack:

   ```bash
   npm run docker:up    # postgres on 5432, pgAdmin on 5050
   ```

2. Apply migrations:

   ```bash
   npm run db:migration:run
   ```

3. Start backend + frontend together:

   ```bash
   npm run start:dev
   ```

   Or individually:

   ```bash
   npm run start:backend     # NestJS on http://localhost:3000 (Swagger /api)
   npm run start:frontend    # Vue CLI dev server (default http://localhost:8080)
   ```

## Run (Production)

- `npm run build` produces `backend/dist/` and `frontend/dist/`.
- Backend prod start: `cd backend && npm run start:prod` (runs `node dist/main`).
- Frontend prod artifacts (`frontend/dist/`) are static assets — host behind any static server. **Unknown** — no production deployment recipe is committed.

## Tests & Lint

- `npm test` — backend Jest + frontend Vue CLI unit tests
- Backend lint: `cd backend && npm run lint`
- Frontend lint: `cd frontend && npm run lint`

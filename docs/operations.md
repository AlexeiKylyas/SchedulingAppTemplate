# Operations

## Common Tasks

| Task | Command (from repo root) |
|---|---|
| Install all deps | `npm install` |
| Start DB stack (Postgres + pgAdmin) | `npm run docker:up` |
| Stop DB stack | `npm run docker:down` |
| Rebuild DB images | `npm run docker:build` |
| Start backend + frontend (dev) | `npm run start:dev` |
| Build both workspaces | `npm run build` |
| Run all tests | `npm test` |
| Backend lint (autofix) | `cd backend && npm run lint` |
| Frontend lint | `cd frontend && npm run lint` |
| Backend format | `cd backend && npm run format` |

## Database Migrations

Migrations live in `backend/src/migrations/` and are managed via TypeORM CLI, configured by `backend/typeorm.config.ts`.

| Action | Command |
|---|---|
| Generate migration | `npm run db:migration:generate` (writes to `backend/src/migrations/initial-migration*`; rename per change) |
| Apply pending migrations | `npm run db:migration:run` |
| Revert most recent migration | `npm run db:migration:revert` |

Notes:

- Runtime `synchronize` is **off** (`backend/src/app.module.ts:31`); always use migrations.
- The migration CLI script outputs to a fixed path `src/migrations/initial-migration` — rename file after generating to avoid collisions (`backend/package.json:21`).
- `DB_MIGRATIONS_RUN=true` makes the running app apply migrations on startup.

## pgAdmin Access

- URL: http://localhost:5050
- Login: `admin@admin.com` / `admin`
- Add server: host `postgres`, port `5432`, user `postgres`, password `postgres`, db `scheduling_app` (see `docker/README.md:38`)

## Swagger / API Docs

- Available at `http://localhost:3000/api` once the backend is running (`backend/src/main.ts:39`)
- Bearer auth scheme registered as `JWT-auth` — paste an access token in the Swagger UI authorize dialog

## Troubleshooting

- **DB connection refused** — ensure `npm run docker:up` succeeded; verify port 5432 free; check `backend/.env.development`.
- **JWT validation fails** — confirm `JWT_SECRET` matches between issuer and validator (single backend instance — should match unless restart with different env).
- **Migration "no changes" or wrong filename** — `migration:generate` always writes `initial-migration` per the script; rename before generating subsequent ones.
- **Class-validator rejects valid input** — global pipe uses `forbidNonWhitelisted: true`, so unknown fields cause `400` (`backend/src/main.ts:17`).

## Logs / Metrics

- Backend logs: stdout (default Nest logger + a `console.log` at startup). No log file path or rotation configured.
- DB query logging: enable by setting `DB_LOGGING=true`.
- Metrics / tracing: **none configured.**

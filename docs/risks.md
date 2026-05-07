# Risks

## Known Risks & Gaps

- **Default `JWT_SECRET` fallback is a hard-coded literal** (`backend/src/auth/auth.module.ts:18` → `'your-secret-key'`). If env is missing in any non-dev environment, JWTs are signed with a publicly-known key. Treat absent `JWT_SECRET` as a deploy-blocker.
- **Default DB credentials are committed** in `docker-compose.yml:10-12` (`postgres/postgres`) and used as the runtime fallback (`backend/src/app.module.ts:27`). Acceptable for local dev only.
- **TypeScript strictness disabled** — `strictNullChecks: false`, `noImplicitAny: false` (`backend/tsconfig.json:15-16`). Bugs hideable at compile time will land in runtime.
- **No tests written.** Jest is configured for both workspaces, but no `*.spec.ts` / `*.spec.js` files were observed. There is no CI to catch regressions.
- **No CI/CD pipelines.** No GitHub Actions / GitLab CI / CircleCI / Jenkins config in repo.
- **No Dockerfile for app code.** Docker Compose only covers Postgres + pgAdmin. Production deployment story is undefined.
- **Migration script overwrites a fixed filename** (`backend/package.json:21` always writes `src/migrations/initial-migration`). Generating multiple migrations without renaming will cause loss of work.
- **OTP delivery path is unverified.** Endpoint exists (`POST /auth/generate-otp`) but no SMS / email gateway integration was observed during inventory — likely returns the OTP in the response body in development. Confirm before relying on OTP in any user-facing flow.
- **`pgAdmin` ships with default `admin@admin.com / admin` credentials** committed (`docker-compose.yml:28-29`). Acceptable locally; do not expose port `5050` beyond localhost.
- **Frontend is a near-empty scaffold.** Single route, empty Vuex store, no API client wiring, no auth integration. Effectively no functional UI shipped yet.
- **`.env*` files are gitignored but no `.env.example` is committed.** New contributors must reverse-engineer required env vars (or read [setup.md](setup.md)).
- **`forceConsistentCasingInFileNames: false`** (`backend/tsconfig.json:18`) — increases risk of case-sensitivity bugs between macOS dev and Linux prod.

## Security & Secrets

- Secrets handled via `.env.${NODE_ENV}` files (gitignored). No Vault / SOPS / AWS Secrets Manager / SSM integration.
- `bcrypt` used for password hashing — assume default cost factor in `auth.service.ts` (verify before relying on it).
- `app.enableCors()` permits all origins by default (`backend/src/main.ts:10`). Tighten for non-development environments.
- `class-validator` `forbidNonWhitelisted: true` rejects unknown fields globally — good default.

## Fragile / Hard-to-Change Areas

- **Auth flow** — JWT + refresh + OTP combined; changes here ripple to user registration, login, and any client. The OTP gateway integration is the next likely change point.
- **Migrations** — single committed migration (`1749983175731-initial-migration.ts`). Schema is essentially greenfield; large model changes still cheap, but every migration must be hand-renamed because of the fixed CLI output path.
- **`BaseEntity` / `BaseRepository`** — touched by every entity; modifying signatures requires updating all feature modules.

## Unknowns / Open Questions

- Is OTP sent via an external provider, or returned in API response body? (`auth.service.ts` not opened during inventory.)
- Is `backend/test/jest-e2e.json` present? `test:e2e` script references it but the directory was not observed.
- Production deployment target (cloud provider, container registry, orchestrator)?
- Frontend API base URL / Axios client wiring — not present in scanned files.
- Initial migration content — schema match with current entities was not cross-verified.
- Email / phone uniqueness rules — `phoneNumber` is `unique`, `email` is nullable and not declared unique. Intentional?

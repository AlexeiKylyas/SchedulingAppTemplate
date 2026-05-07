# AI Agents Guide

Working notes for AI agents editing this repo. Read [overview.md](overview.md), [architecture.md](architecture.md), and [code-map.md](code-map.md) before any non-trivial change.

## Coding Conventions

- **Backend** — NestJS module convention: each feature folder contains `*.module.ts`, `*.controller.ts`, `*.service.ts`, `*.repository.ts`, `*.entity.ts`, `dto/*.dto.ts`. Mirror this when adding modules. Entities extend `BaseEntity` (`backend/src/common/base.entity.ts`).
- **DTOs** — every input DTO uses `class-validator` decorators; every response DTO is annotated with `@ApiProperty` (Swagger plugin extracts the schema). Use `@Exclude()` for sensitive fields (e.g. password).
- **Auth** — protect controller routes with `JwtAuthGuard` and (when role-gated) `RolesGuard` + `@Roles(UserRole.X)`. Inject the requesting user with `@CurrentUser()`.
- **TypeScript** — `strictNullChecks: false`, `noImplicitAny: false`. Don't rely on the compiler to catch null/any bugs; add runtime guards where it matters.
- **Frontend** — Vue 3 Options API style is the default in the existing components (`AppHeader.vue`, etc.); Composition API is acceptable for new code but stay consistent within a file.
- **Naming** — TypeORM column names are derived from property names (camelCase → snake_case is **not** enabled; columns ship as camelCase in Postgres unless `name:` is set explicitly). Watch for case-sensitivity quirks.

## Where to Make Changes Safely

- **New domain entity** — create `backend/src/<feature>/`, register the module in `backend/src/app.module.ts:39`, generate a migration (`npm run db:migration:generate` then rename the output file), commit the migration alongside the entity.
- **New auth-protected endpoint** — add controller method, decorate with `@UseGuards(JwtAuthGuard)`, validate body with a DTO, document with `@ApiOperation` / `@ApiResponse`.
- **Schema change** — never rely on `synchronize`; always create a migration. Be explicit about column types (`type: 'timestamp'`, `type: 'decimal', precision, scale`).
- **Frontend route** — add a view to `frontend/src/views/`, register in `frontend/src/router/index.js`. Vuex store is empty — wire modules under `frontend/src/store/` if state grows.

## How to Run / Test / Lint Quickly

- Smoke check: `npm run docker:up && npm run db:migration:run && npm run start:backend` then hit `http://localhost:3000/api`.
- Backend unit tests: `cd backend && npm test` (no specs exist yet — add alongside source as `<name>.spec.ts`).
- Backend lint+autofix: `cd backend && npm run lint`.
- Frontend lint: `cd frontend && npm run lint`.

## PR / Diff Guidance — What to Avoid

- Don't change `backend/tsconfig.json` strictness flags as part of an unrelated PR — it cascades into many existing files.
- Don't bump the `JWT_SECRET` default literal — keep the env-driven mechanism; add a startup guard instead if hardening is in scope.
- Don't create a second migration without renaming the previous `initial-migration*` file (the generate script overwrites a fixed path).
- Don't commit `.env*` files. Update [setup.md](setup.md) if you add new env vars.
- Don't enable `synchronize` even temporarily — easy to forget; will diverge schema from migrations.
- Don't widen CORS or remove `forbidNonWhitelisted` without explicit reason.

## Guardrails

- **No network installs** — do not run `npm install` or fetch packages as part of a doc/code task unless explicitly requested.
- **No secret leakage** — `.env*` is gitignored; never echo or commit secrets in logs, comments, or test fixtures.
- **No prod data** — Postgres in this repo is local-only; assume no PII flows through it. If real data is loaded, that's the user's responsibility.
- **Verify before claiming** — entities and modules look greenfield; if you're about to assume a feature exists (e.g. "the appointments service handles overlap detection"), open the file and confirm. Many things are scaffolds, not implementations.

## Common Pitfalls Observed

- The OTP endpoint exists but the delivery channel is unverified — don't assume SMS works.
- Frontend is a scaffold, not a working UI. Don't propose UI changes without confirming intent.
- `email` on `User` is nullable; `phoneNumber` is the unique identifier — auth flows and lookups should key on `phoneNumber` first.
- The single committed migration timestamps to `1749983175731` (Unix-ish but very large) — likely matches the initial schema but cross-verify if you change entities.

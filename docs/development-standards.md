# Development Standards

Authoritative guide for developing on SchedulingAppTemplate. These rules are enforceable in code review. Where evidence is weak the entry is marked **TBD** — the team must decide and codify.

For higher-level context (what the project is, where files live), see [overview.md](overview.md), [architecture.md](architecture.md), [stack.md](stack.md), [code-map.md](code-map.md). This document does not duplicate them.

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Project Principles](#2-project-principles)
3. [Layer Responsibilities](#3-layer-responsibilities)
4. [Data Contracts](#4-data-contracts)
5. [Error Handling](#5-error-handling)
6. [Logging Standards](#6-logging-standards)
7. [Configuration Management](#7-configuration-management)
8. [Testing Standards](#8-testing-standards)
9. [Security & Compliance](#9-security--compliance)
10. [Directory Layout](#10-directory-layout)
11. [Design Principles](#11-design-principles)
12. [Failure Handling & Resilience](#12-failure-handling--resilience)

---

## 1. Architecture Overview

- Pattern: **NestJS Modular Layered Architecture** — controllers / services / repositories / entities, one module per feature.
- Backend: NestJS 9 monolith over Express; REST + Swagger at `/api`; TypeORM 0.3 against PostgreSQL 14; JWT bearer auth.
- Frontend: Vue 3 SPA scaffold (Vue CLI 5, Vue Router 4, Vuex 4, Axios, Sass).
- Monorepo: npm workspaces; root scripts orchestrate both workspaces with `concurrently`.
- Communication: HTTP only — no shared TS package between backend and frontend yet.

```
[Vue 3 SPA] --HTTP--> [NestJS API :3000] --TypeORM--> [Postgres 14]
                              \--Swagger UI at /api
```

## 2. Project Principles

- Prefer convention over configuration — follow Nest's recommended decompositions.
- Single responsibility per file; one class per file.
- DTO-driven API contracts — never expose entities directly without an explicit response DTO.
- Object args for any function with 3+ parameters.
- No silent fallbacks — fail loud on missing config or unexpected input.
- Keep modules independent — no cross-module direct entity imports; go through services/repositories.
- Performance and scalability: defer optimisation until profiling justifies it; no premature caching layer.

## 3. Layer Responsibilities

| Layer | Belongs here | Prohibited |
|---|---|---|
| **Controller** (`*.controller.ts`) | Routing, Swagger decorators, request DTO binding, response DTO mapping, guard wiring | Business logic, direct repository access, raw SQL |
| **Service** (`*.service.ts`) | Business logic, transaction orchestration, calls into repositories and other services | Express/Nest request objects, Swagger decorators, manual SQL |
| **Repository** (`*.repository.ts`, extends `common/base.repository.ts`) | TypeORM access, query building, pagination | Business rules, response shaping, throwing HTTP exceptions other than `NotFoundException` for missing records |
| **Entity** (`*.entity.ts`, extends `common/base.entity.ts`) | TypeORM column/relation decorators, computed getters, Swagger `@ApiProperty`, `@Exclude` for sensitive fields | Service-level logic, validation rules (those live in DTOs) |
| **DTO** (`dto/*.dto.ts`) | `class-validator` decorators, Swagger `@ApiProperty`, optional `class-transformer` shaping | Persistence concerns, business logic |
| **Module** (`*.module.ts`) | Wiring providers, controllers, imports, exports | Anything else |

- Controllers MUST delegate to a service. No `repository.*` calls from a controller.
- Repositories extend `BaseRepository<Entity>`; do not duplicate CRUD plumbing.
- All entities extend `BaseEntity` (UUID PK, `createdAt`, `updatedAt`).

## 4. Data Contracts

- Every endpoint defines a Request DTO and a Response DTO under `<module>/dto/`.
- Request DTOs use `class-validator` decorators; the global `ValidationPipe` enforces `whitelist`, `transform`, `forbidNonWhitelisted` (see `backend/src/main.ts:13`). Unknown fields are rejected.
- Response DTOs use `@Exclude()` for sensitive fields (see `User.password`); never return entity instances containing secrets.
- Pagination: any list endpoint accepts `PaginationDto` (`backend/src/common/pagination.dto.ts`) and returns `PaginatedResponseDto<T>`.
- ID parameters are validated via `ParseUUIDPipe`. Date inputs are ISO-8601 strings; conversion to `Date` is the controller's job.
- API versioning: **TBD** — currently no version prefix; decide before first production release.
- Serialization: `class-transformer` is the only allowed serializer; no custom `JSON.stringify` overrides.

## 5. Error Handling

- Throw NestJS built-in HTTP exceptions from services: `BadRequestException`, `UnauthorizedException`, `ForbiddenException`, `NotFoundException`, `ConflictException`.
- Repositories throw `NotFoundException` from `BaseRepository.findOne` when the record is absent (already implemented).
- Custom exception hierarchy: **TBD** — none exists yet. If domain-specific errors emerge, place them under `<module>/errors/` and extend `HttpException`.
- Global exception filter: **TBD** — currently relying on Nest defaults. Recommended to introduce a filter that normalises responses to `{ statusCode, message, error, timestamp, path }` before first production release.
- Never swallow errors with `try/catch` that has no logging or rethrow. Reviewers reject `catch` blocks that silently degrade.
- Do not wrap test assertions in `try/catch` — assertions must fail the test naturally.
- Never use `?? 'main'`-style silent fallbacks for required configuration; throw or return an explicit error.

## 6. Logging Standards

- Library: **TBD** — currently only `console.log` is used (`backend/src/main.ts:44`). Adopt `nestjs-pino` or `nestjs/common` `Logger` before first production release.
- Levels (target):
  - `debug` — development-only diagnostics, gated by env.
  - `info` — request lifecycle, startup events.
  - `warn` — recoverable anomalies (retry happened, fallback path taken with explicit reason).
  - `error` — failed requests, unhandled exceptions, integration failures.
- Never log: passwords, tokens (access or refresh), full DTOs containing PII, OTP codes, raw `Authorization` headers.
- Required context fields per log line (target): `requestID`, `userID` (if authenticated), `route`, `latencyMs`, `error.name`, `error.message`.
- TypeORM SQL logging is gated by `DB_LOGGING` env — keep `false` in production.

## 7. Configuration Management

- All config is loaded by `@nestjs/config` from `.env.${NODE_ENV ?? 'development'}` (see `backend/src/app.module.ts:14`).
- Naming: `SCREAMING_SNAKE_CASE` for env keys; group by domain prefix (`DB_*`, `JWT_*`, `OTP_*`).
- Required keys (current): `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_DATABASE`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `PORT`.
- Required keys with defaults are still expected to be set in non-development environments — defaults exist only to ease local boot.
- Sensitive values (`DB_PASSWORD`, `JWT_SECRET`) MUST come from a secrets manager in production; never commit `.env.*` files (already gitignored).
- A `.env.example` file is **TBD** — must be added so contributors know which variables exist without leaking values.
- Do not concatenate env keys dynamically (`process.env[`PREFIX_${suffix}`]`). Define an explicit `Record<>` mapping instead.
- Avoid defensive defaults that mask configuration errors downstream — the app should refuse to boot when a required value is missing.

## 8. Testing Standards

- Frameworks: Jest 28 + `ts-jest` (backend); Vue Test Utils + `@vue/cli-plugin-unit-jest` (frontend).
- Targets:
  - Unit tests: 70% of test count, near each source file (`*.spec.ts` co-located).
  - Integration tests: 20%, exercising controller→service→repository against a real Postgres test schema.
  - E2E tests: 10%, configured via `backend/test/jest-e2e.json` (file presence: **TBD**).
- Test file naming: `<unit-under-test>.spec.ts`. E2E files: `*.e2e-spec.ts` under `backend/test/`.
- Structure: Arrange / Act / Assert blocks separated by blank lines.
- Mocks: prefer real instances with in-memory or test database over `jest.mock` of internal modules. Do not mock the entity layer.
- Coverage gate: **TBD** — recommend `--coverage` with `lines >= 80%` per module before first production release. Currently no coverage gate exists and no specs are written.
- Never wrap an `expect(...)` in `try/catch` — that is a vacuous-pass risk.
- CI integration: **TBD** — no CI pipeline currently exists. All test commands must run from a single root command (`npm test` is the contract).

## 9. Security & Compliance

- AuthN: JWT bearer tokens (`@nestjs/jwt` + `passport-jwt`); access token + refresh token pair issued from `auth/auth.service.ts`. JWT secret comes from `JWT_SECRET` env — must be a high-entropy value in any non-local environment.
- AuthZ: `@Roles(UserRole.X)` decorator + `RolesGuard`. Apply to every controller method that mutates state or exposes other users' data.
- Password storage: `bcrypt` only; never store plaintext, never log.
- OTP: production-grade OTP integration is **TBD**. The placeholder accepts a hard-coded value (`auth.service.ts:30`) — this MUST be replaced before any non-local environment exposure.
- Input validation: enforced by global `ValidationPipe`. Never bypass with `forbidNonWhitelisted: false` per route.
- CORS: currently wide open (`app.enableCors()`). Lock down via explicit `origin` list before first production release.
- PII fields (`firstName`, `lastName`, `email`, `phoneNumber`): never log; expose only through DTOs that the user is authorised to see.
- Dependency hygiene: run `npm audit --omit=dev` in CI; **TBD** — process not yet in place.
- Compliance scope: **TBD** — confirm with product whether GDPR/CCPA applies to the data model. Plan for data-export and right-to-deletion flows accordingly.
- Secrets: `.env.*` files are gitignored. Pre-commit secret scanning is **TBD** (recommend `gitleaks`).

## 10. Directory Layout

Backend (`backend/src/`):

- `<feature>/` — one directory per feature. Required files: `*.module.ts`, `*.controller.ts`, `*.service.ts`, `*.repository.ts`, `*.entity.ts`. Optional: `dto/`, `guards/`, `decorators/`, `strategies/`, `errors/`.
- `common/` — cross-cutting building blocks (`BaseEntity`, `BaseRepository`, `PaginationDto`).
- `migrations/` — TypeORM migrations. Run via `npm run migration:run`.
- `main.ts`, `app.module.ts` — bootstrap and root wiring; do not expand them with feature-specific code.

Frontend (`frontend/src/`):

- `views/` — route-level components (one per route entry).
- `components/` — reusable, prop-driven UI components.
- `router/`, `store/` — Vue Router and Vuex roots.
- `styles/` — global SCSS and shared variables.
- `assets/` — static assets imported by components.

File naming:

- Backend: `kebab-case.kind.ts` — e.g., `users.controller.ts`, `appointment.entity.ts`, `create-appointment.dto.ts`.
- Frontend: `PascalCase.vue` for components/views, `camelCase.js` for JS modules.

Where to place new features:

- New REST resource → new module under `backend/src/<resource>/` mirroring existing modules; register in `app.module.ts`.
- New shared utility → `backend/src/common/`.
- New Vue route → `views/<Name>View.vue` + entry in `router/index.js`.

## 11. Design Principles

- Style guide: Prettier (`backend/.prettierrc` if present, otherwise repo defaults) and ESLint defaults; do not disable rules without a comment explaining why.
- Identifier conventions:
  - Acronyms stay uppercase: `userID`, `apiURL`, `parseHTML` (never `userId`/`apiUrl`).
  - Spell out names — `request`, `response`, `error`, `event`, `index` (not `req`, `res`, `err`, `e`, `i`, except as a loop counter).
  - 2-letter abbreviations OK as full identifiers: `id`, `db`, `ip`, `os`, `ui`, `tz`.
- Method/function signatures: 3+ parameters MUST use a single object argument with destructuring. Adding an optional parameter that pushes a function to 3 args triggers refactor in the same change.
- Comments: write only when WHY is non-obvious — hidden constraint, subtle invariant, workaround. No "what" comments. No history references ("added for ticket X"); the commit message owns that.
- Pre-existing issues touched only incidentally are out of scope; open a follow-up rather than expanding the current PR.
- Code review checklist (apply before requesting review):
  - [ ] Lint clean.
  - [ ] Build clean.
  - [ ] Tests added or updated for behaviour change.
  - [ ] No silent fallbacks / missing config logging.
  - [ ] No `try/catch` around `expect()`.
  - [ ] No 3+ positional args.
  - [ ] DTOs validate every external input.
  - [ ] No secrets, tokens, or PII in logs or commits.
- Refactoring: incremental and behaviour-preserving; never bundled into an unrelated feature PR.

### Build & Lint Commands (mandatory pre-review run)

| Workspace | Build | Lint |
|---|---|---|
| Backend (`backend/`) | `npm run build` | `npm run lint` |
| Frontend (`frontend/`) | `npm run build` | `npm run lint` |
| Monorepo root | `npm run build` (both) | `npm run lint` (both, **TBD** — root script not yet present) |

Tests must also pass before review:

| Workspace | Command |
|---|---|
| Backend | `npm test` (unit) · `npm run test:e2e` (E2E) |
| Frontend | `npm test` |

If any of these commands fail, do not request review. CI integration is **TBD**.

## 12. Failure Handling & Resilience

- Retry policy: **TBD** — none implemented. When external integrations are added (SMS for OTP, email, payments), define per-integration retry budget and backoff.
- Circuit breakers: **TBD** — adopt only when a real downstream cliff exists; do not pre-emptively wire one.
- Timeouts: every outbound HTTP/SMS/email call MUST set an explicit timeout (target ≤ 5s for synchronous user-facing calls). HTTP server timeout configuration: **TBD**.
- Graceful degradation: a missing optional integration (e.g., OTP delivery during local dev) must surface a clear error rather than silently continuing in a broken state.
- Health checks: **TBD** — add `/health` endpoint (liveness) and `/health/ready` (readiness, checks DB connectivity) before first production release.
- Monitoring: **TBD** — no metrics, tracing, or alerting wired. Choose a target stack (e.g., OpenTelemetry + a backend) and commit to a baseline before exposing externally.
- Database: migrations are forward-only — never edit a committed migration; create a new one.

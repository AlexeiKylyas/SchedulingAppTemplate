# Dependencies

## First-Party (Monorepo Workspaces)

| Workspace | Path | Role |
|---|---|---|
| `scheduling-app-backend` | `backend/` | NestJS REST API server |
| `scheduling-app-frontend` | `frontend/` | Vue 3 SPA |

(Declared in root `package.json:6` `"workspaces"`.)

## Backend Third-Party (top by importance)

| Package | Version | Role |
|---|---|---|
| `@nestjs/core`, `@nestjs/common`, `@nestjs/platform-express` | ^9.0.0 | Web framework runtime |
| `@nestjs/typeorm` + `typeorm` | ^9.0.1 / ^0.3.11 | ORM and DI integration |
| `pg` | ^8.8.0 | PostgreSQL driver |
| `@nestjs/jwt` + `@nestjs/passport` + `passport` + `passport-jwt` | ^9 / ^9 / ^0.6 / ^4 | JWT auth |
| `@nestjs/config` | ^2.2.0 | Env-based config |
| `@nestjs/swagger` + `swagger-ui-express` | ^6.1.4 / ^4.6.0 | OpenAPI docs |
| `class-validator` + `class-transformer` | ^0.14 / ^0.5.1 | DTO validation/serialization |
| `bcrypt` | ^6.0.0 | Password hashing |
| `rxjs` | ^7.5.5 | Reactive primitives (Nest dep) |
| `reflect-metadata` | ^0.1.13 | Decorator metadata |

Backend dev deps: `@nestjs/cli`, `@nestjs/testing`, `jest`, `ts-jest`, `supertest`, `eslint`, `prettier`, `typescript` ^4.7.4. Licenses **Unknown** (not introspected).

## Frontend Third-Party (top by importance)

| Package | Version | Role |
|---|---|---|
| `vue` | ^3.2.13 | UI framework |
| `vue-router` | ^4.0.3 | Client-side routing |
| `vuex` | ^4.0.0 | State management |
| `axios` | ^0.27.2 | HTTP client |
| `core-js` | ^3.8.3 | JS polyfills |

Frontend dev deps: `@vue/cli-service` ~5, `@vue/cli-plugin-{babel,eslint,router,vuex,unit-jest}`, `@vue/test-utils` ^2, `eslint` ^7.32, `eslint-plugin-vue` ^8, `sass` ^1.32, `sass-loader` ^12.

## Critical Runtime Dependencies

- **PostgreSQL 14** — only datastore. Backend cannot start without a reachable DB (`TypeOrmModule.forRootAsync`).
- **Node.js v14+** — runtime for both backend and frontend dev tooling.
- **Docker / Docker Compose** — used for local DB; not strictly required if a Postgres instance is provided externally.

## External APIs

- **None wired up.** OTP delivery (SMS), email transport, and payment integrations are **Unknown / not present** — `auth.service.ts` exposes an OTP endpoint but the delivery mechanism has not been verified during inventory.

## Licenses

- Repo: MIT (root `package.json:40`).
- Per-dep license audit not performed. NestJS, Vue, TypeORM, Passport, bcrypt are MIT/Apache-2.0 in the general case but verify before redistribution.

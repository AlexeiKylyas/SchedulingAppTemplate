# Stack

## Languages & Versions

- TypeScript ^4.7.4 (backend) — `backend/package.json:69`
- JavaScript / Vue 3 SFC (frontend)
- Node.js v14+ (per root `README.md:29`)
- Compile target: ES2017, CommonJS (`backend/tsconfig.json:9`)
- TS strictness: `strictNullChecks: false`, `noImplicitAny: false` — lenient

## Backend Frameworks & Libraries

- NestJS ^9.0.0 (`@nestjs/common`, `@nestjs/core`, `@nestjs/platform-express`)
- `@nestjs/config` ^2.2.0 — env-based configuration, loads `.env.${NODE_ENV}`
- `@nestjs/typeorm` ^9.0.1 + `typeorm` ^0.3.11 — ORM with migrations, `synchronize=false`
- `@nestjs/jwt` ^9.0.0 + `@nestjs/passport` ^9.0.3 + `passport-jwt` ^4.0.1 — JWT auth
- `@nestjs/swagger` ^6.1.4 + `swagger-ui-express` ^4.6.0 — OpenAPI docs at `/api`
- `class-validator` ^0.14.0 + `class-transformer` ^0.5.1 — DTO validation, used via global `ValidationPipe` (`backend/src/main.ts:13`)
- `bcrypt` ^6.0.0 — password hashing
- `pg` ^8.8.0 — PostgreSQL driver

## Frontend Frameworks & Libraries

- Vue ^3.2.13
- Vue Router ^4.0.3
- Vuex ^4.0.0
- Axios ^0.27.2 — HTTP client
- Vue CLI Service ~5.0.0 — build/serve/lint/test runner
- Sass ^1.32.7 (via `sass-loader`)

## Build Tools & Package Managers

- npm (workspaces declared in root `package.json`)
- `concurrently` ^7.6.0 (root) — runs backend + frontend dev servers in parallel
- Backend build: `nest build` (Webpack-based via `@nestjs/cli`)
- Frontend build: `vue-cli-service build` (Webpack)
- `rimraf` for `prebuild` cleanup

## Datastores & Brokers

- PostgreSQL 14 (Docker image `postgres:14`, `docker-compose.yml:5`)
- pgAdmin 4 (Docker image `dpage/pgadmin4`) — admin UI on `localhost:5050`
- `uuid-ossp` extension enabled at init (`docker/init-db.sh:9`)
- No message broker / cache / search engine detected

## Infrastructure as Code / Deployment

- Docker Compose for Postgres + pgAdmin (`docker-compose.yml`)
- No Dockerfiles for backend/frontend application processes (Unknown if intentional)
- No Kubernetes / Helm / Terraform / Pulumi / Serverless config detected

## Observability

- Console logging only (`console.log` in `backend/src/main.ts:44`); TypeORM SQL logging gated by `DB_LOGGING` env
- No structured logging, metrics, or tracing libraries detected

## Linters / Formatters

- ESLint ^8.19 + `@typescript-eslint/*` ^5.30 + Prettier ^2.7 (backend)
- ESLint ^7.32 + `eslint-plugin-vue` ^8 + `@babel/eslint-parser` (frontend)
- Plugin: `eslint-config-prettier`, `eslint-plugin-prettier` (backend)

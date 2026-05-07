# Architecture

## System Shape

Two-tier monorepo:

- **Backend** — NestJS monolith exposing a REST API on port `3000` (configurable via `PORT`); single process; module-based feature decomposition.
- **Frontend** — Vue 3 SPA scaffold served by Vue CLI dev server; client of the backend API (Axios is bundled but no HTTP client wiring is wired up yet — Unknown which base URL).
- **Database** — PostgreSQL 14 in a Docker container, with `uuid-ossp` extension enabled.

The backend and frontend run as independent Node processes and communicate over HTTP. There is no shared code package between them.

## Backend Modules & Responsibilities

Defined in `backend/src/app.module.ts:11`:

- **AppModule** — root; wires `ConfigModule` (env-based) and `TypeOrmModule.forRootAsync` (Postgres) and imports feature modules.
- **AuthModule** (`backend/src/auth/`) — registration, login, refresh, OTP generation. Uses Passport JWT strategy. Exports `AuthService`, `JwtStrategy`, `PassportModule`.
- **UsersModule** (`backend/src/users/`) — user entity, controller, service, repository. Roles: `admin`, `staff`, `client`.
- **ServicesModule** (`backend/src/services/`) — bookable services (name, duration, price, category, image).
- **AppointmentsModule** (`backend/src/appointments/`) — appointments linking `client`, `staff`, `service`; statuses: `pending|confirmed|cancelled|completed`.
- **Common** (`backend/src/common/`) — `BaseEntity` (uuid PK, createdAt, updatedAt) and `BaseRepository`.

Each feature module follows a Nest convention: `*.module.ts`, `*.controller.ts`, `*.service.ts`, `*.repository.ts`, `*.entity.ts`, `dto/*.dto.ts`.

## Data Model

- All entities extend `BaseEntity` — UUID PK, timestamps (`backend/src/common/base.entity.ts`)
- `User` — `email`, `firstName`, `lastName`, `phoneNumber` (unique), `password` (hashed, `@Exclude`d from serialization), `role`, `isActive`
- `Service` — `name`, `description`, `durationMinutes`, `price` (decimal 10,2), `isActive`, `category`, `imageUrl`
- `Appointment` — `dateTime`, `endTime`, `status`, `notes`, FKs `clientId → User`, `staffId → User`, `serviceId → Service`

## Cross-Cutting Concerns

- **AuthN**: JWT bearer tokens via `@nestjs/passport` + `passport-jwt`. Secret + expiry from env (`JWT_SECRET`, `JWT_EXPIRES_IN`). Refresh-token endpoint exists.
- **AuthZ**: `RolesGuard` + `@Roles()` decorator (`backend/src/auth/guards/roles.guard.ts`, `backend/src/auth/decorators/roles.decorator.ts`); `@CurrentUser()` decorator for handler injection.
- **Validation**: global `ValidationPipe` with `whitelist`, `transform`, `forbidNonWhitelisted` (`backend/src/main.ts:13`).
- **Config**: `ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env.${NODE_ENV ?? "development"}' })` (`backend/src/app.module.ts:14`).
- **CORS**: enabled globally with defaults (`app.enableCors()`).
- **Errors**: standard NestJS exception filter (default); no custom global filter detected.
- **Caching**: none detected.
- **Logging**: minimal — `console.log` + TypeORM logging gate.

## Data Flow (Request Lifecycle)

1. Client (Vue SPA / Swagger UI / external) → HTTP request → Nest controller
2. `ValidationPipe` validates DTO via `class-validator`
3. Guards (`JwtAuthGuard`, `RolesGuard`) authorize
4. Controller delegates to `*.service.ts`
5. Service uses `*.repository.ts` (extends `BaseRepository`) → TypeORM → Postgres
6. Response shaped via `*-response.dto.ts` (with `@Exclude` on sensitive fields)

## External Integrations

- Postgres only. No external APIs (SMS provider for OTP, email, payments, etc.) detected — OTP delivery integration is **Unknown / not yet wired**.

## Deployment Topology

Local-only setup is documented (Docker Compose for DB + pgAdmin). Backend/frontend processes run on host. No production deployment manifests, CI workflows, or container images for app code are present.

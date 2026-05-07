# Overview

## Purpose & Scope

Template/starter for a scheduling application aimed at small service businesses (beauty salons, barbershops). Provides REST API with auth, user/service/appointment CRUD scaffolding, Postgres persistence, and a minimal Vue 3 frontend shell.

## High-Level Capabilities

- User registration via phone-number OTP flow (`POST /auth/generate-otp`, `POST /auth/register`)
- Email + password login (`POST /auth/login`) with JWT access + refresh tokens
- Role-based authorization: `admin`, `staff`, `client` (`backend/src/users/user.entity.ts:6`)
- Domain entities: User, Service, Appointment (with statuses: pending/confirmed/cancelled/completed)
- Auto-generated Swagger UI at `/api`
- TypeORM migrations for schema management

## Primary Entry Points

- HTTP API: `backend/src/main.ts` — bootstraps NestJS app on `PORT` (default `3000`); enables CORS; mounts Swagger at `/api`
- Frontend SPA: `frontend/src/main.js` → `frontend/src/App.vue` → `<router-view/>` (single `HomeView` route)
- DB schema CLI: `backend/typeorm.config.ts` — used by migration scripts

## Project Shape

Monorepo with npm workspaces (`backend`, `frontend`). Backend is a NestJS monolith with feature modules; frontend is a Vue SPA. Rationale: root `package.json:6` declares `"workspaces": ["backend", "frontend"]`.

## Key Directories

- `backend/src/` — NestJS source (modules, entities, DTOs, migrations)
- `backend/src/auth/` — JWT + Passport strategy, OTP flow, guards, decorators
- `backend/src/users/`, `backend/src/services/`, `backend/src/appointments/` — feature modules (entity / controller / service / repository / dto)
- `backend/src/common/` — shared `BaseEntity` and `BaseRepository`
- `backend/src/migrations/` — TypeORM migration files
- `frontend/src/` — Vue 3 SPA (components, views, router, store, styles)
- `docker/` — Postgres init script + setup notes

# Scheduling App Template — Documentation

Monorepo template for a client-appointment scheduling application (beauty salons, barbershops, similar service businesses). Backend exposes a REST API with JWT + OTP auth and Swagger docs; frontend is a Vue 3 SPA scaffold.

## Table of Contents

- [overview.md](overview.md) — purpose, scope, capabilities
- [stack.md](stack.md) — languages, frameworks, datastores
- [architecture.md](architecture.md) — system shape, modules, data flow
- [code-map.md](code-map.md) — directory tour, entry points, configs
- [setup.md](setup.md) — prerequisites, install, env, run
- [operations.md](operations.md) — common tasks, migrations, troubleshooting
- [testing.md](testing.md) — frameworks, commands
- [dependencies.md](dependencies.md) — first/third-party packages, runtime deps
- [risks.md](risks.md) — known gaps, security notes, unknowns
- [ai-agents-guide.md](ai-agents-guide.md) — guidance for AI agents working in this repo

## Quick Facts

- Languages: TypeScript (backend), JavaScript + Vue SFC (frontend)
- Frameworks: NestJS 9 (backend), Vue 3 (frontend)
- Packages/services: 2 workspaces (`backend`, `frontend`) + Docker stack
- Datastore: PostgreSQL 14 (Docker)
- Deployment style: Docker Compose for local infra; app processes run via `npm run start:dev` (no Dockerfiles for app code present)
- License: MIT

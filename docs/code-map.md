# Code Map

## Top-Level Directories

| Path | Purpose |
|---|---|
| `backend/` | NestJS API server (TypeScript) |
| `frontend/` | Vue 3 SPA |
| `docker/` | Postgres init script and setup notes |
| `docker-compose.yml` | Local Postgres + pgAdmin stack |
| `package.json` | Root monorepo scripts and workspace declaration |
| `package-lock.json` | npm lockfile (root; not scanned) |
| `.gitignore` | Standard Node + IDE ignores |
| `README.md` | Top-level project intro |

## Backend Source Layout (`backend/src/`)

| Path | Purpose |
|---|---|
| `main.ts` | App bootstrap, validation, CORS, Swagger |
| `app.module.ts` | Root module — config, TypeORM, feature module imports |
| `app.controller.ts` / `app.service.ts` | Default health/sanity endpoint |
| `auth/` | Auth module — controller, service, JWT strategy, guards, decorators, DTOs |
| `users/` | User entity, controller, service, repository, DTOs |
| `services/` | Service (bookable item) module — same shape as `users/` |
| `appointments/` | Appointment module — same shape as `users/` |
| `common/` | `BaseEntity`, `BaseRepository`, `PaginationDto` |
| `migrations/` | TypeORM migration files (currently `1749983175731-initial-migration.ts`) |

## Frontend Source Layout (`frontend/src/`)

| Path | Purpose |
|---|---|
| `main.js` | Vue app bootstrap (mounts `App.vue`, attaches router/store, imports global CSS) |
| `App.vue` | Root component — renders `<router-view/>` only |
| `router/index.js` | Vue Router config — single `/` → `HomeView` route |
| `store/index.js` | Vuex store — empty scaffold |
| `views/HomeView.vue` | Home page |
| `components/` | `AppHeader`, `AppFooter`, `BookingButton`, `SalonInfo` |
| `styles/` | Global + per-component / per-view SCSS |
| `public/` | Vue CLI public assets |

## Application Entry Points

- Backend: `backend/src/main.ts` (NestJS bootstrap)
- Frontend: `frontend/src/main.js` (Vue `createApp(App).use(store).use(router).mount('#app')`)
- Migration CLI: `backend/typeorm.config.ts` (used by `npm run typeorm` scripts)

## Important Configuration Files

| File | Controls |
|---|---|
| `backend/tsconfig.json` | TS compiler — ES2017, CommonJS, lenient strictness |
| `backend/nest-cli.json` | Nest CLI build config; enables `@nestjs/swagger` plugin (auto-extracts decorators + comments) |
| `backend/typeorm.config.ts` | DataSource for migration CLI (separate from runtime `TypeOrmModule`) |
| `backend/.env.${NODE_ENV}` | Runtime env for backend (gitignored); see [setup.md](setup.md) |
| `frontend/babel.config.js` | Vue CLI Babel preset |
| `frontend/.eslintrc.js` | ESLint with `vue3-essential` rules |
| `docker-compose.yml` | Postgres 14 + pgAdmin services + named volumes |
| `docker/init-db.sh` | Enables `uuid-ossp` extension at first DB boot |

## Notable Scripts (root `package.json`)

- `start:dev` — concurrent backend + frontend dev servers
- `docker:up` / `docker:down` — bring infra up/down
- `db:migration:generate|run|revert` — proxies to backend migration scripts
- `build` — builds both workspaces
- `test` — runs backend Jest then frontend Vue CLI unit tests

## Generated / Build Outputs

- `backend/dist/` — compiled JS output (gitignored)
- `frontend/dist/` — Webpack bundle (gitignored)
- `coverage/` — test coverage (gitignored)
- `*.tsbuildinfo` — TS incremental cache (gitignored)

## Ignored Paths and Rationale

- `node_modules/`, `.git/`, `.idea/`, `package-lock.json` — vendor / VCS / IDE / large lockfile (not scanned for content; existence noted only)
- `dist/`, `build/`, `coverage/` — build outputs
- `.env*` — secrets (gitignored; see `.env.example` if/when provided)

# Testing

## Frameworks

- **Backend** — Jest ^28.1.2 with `ts-jest`. Config inline in `backend/package.json:71`:
  - `rootDir: src`
  - `testRegex: .*\\.spec\\.ts$`
  - Coverage collected from `**/*.(t|j)s` to `../coverage/`
  - E2E config: `backend/test/jest-e2e.json` (referenced by `test:e2e`; **Unknown** if file currently exists — directory not observed during inventory)
- **Frontend** — `@vue/cli-plugin-unit-jest` ~5.0.0 (Jest under Vue CLI) + `@vue/test-utils` ^2

## Commands

| Command | Effect |
|---|---|
| `npm test` (root) | Runs `npm run test:backend` then `npm run test:frontend` |
| `cd backend && npm test` | Jest unit tests (`*.spec.ts` under `backend/src/`) |
| `cd backend && npm run test:watch` | Jest watch mode |
| `cd backend && npm run test:cov` | Jest with coverage (writes to `backend/coverage/`) |
| `cd backend && npm run test:e2e` | Jest with `test/jest-e2e.json` |
| `cd frontend && npm test` | `vue-cli-service test:unit` |

## Locations

- Backend unit specs: colocated as `<name>.spec.ts` next to source (per `testRegex`). **No `*.spec.ts` files were found during inventory** — test scaffolding present but no tests written yet.
- Backend e2e tests: `backend/test/` (per `test:e2e` script). **Directory not observed** — likely absent.
- Frontend tests: standard Vue CLI conventions (`__tests__/` or `*.spec.js`); **none observed** during inventory.

## Coverage / Quality Gates

- No CI workflow committed. No coverage threshold defined in Jest config.
- ESLint configured (backend + frontend), but no pre-commit hook / Husky / lint-staged detected.

## Test Data, Fixtures, e2e

- No fixtures, factories, or seed scripts committed.
- No Playwright / Cypress / supertest specs observed (though `supertest` ^6.2.4 is a backend devDep — staged for e2e but unused).

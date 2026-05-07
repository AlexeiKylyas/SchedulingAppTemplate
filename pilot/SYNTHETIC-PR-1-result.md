# Synthetic PR Validation — corpus-pilot Phase 2

**Branch:** `pilot/synthetic-test-1`
**Epic:** `77d8872a` — Synthetic PR validation: agentic search + delta-awareness

---

## Test 1 — Initial review: always-on rules + agentic search

**Setup:**
- `backend/src/_corpus_test/sample.ts` introduces 3 always-on anti-patterns:
  - Pattern 1 (silent-fallback): `process.env.NOTIFICATION_CHANNEL ?? 'main'`
  - Pattern 5 (object-args): `send(user, target, retryCount, force)` — 4 positional args
  - Pattern 6 (single-fallback-layer): `resolveEnv(env = 'production')` with downstream `??`
- `backend/tsconfig.json` updated to exclude `src/_corpus_test`

**Results:** ✅ PASS

- [x] Bot summary comment posted
- [x] All 3 always-on rules cited by exact rule title:
  - "Fail loud on invalid values — replace ?? fallback with allowlist + throw"
  - "Use object args for 3+ parameters — never positional lists"
  - "One fallback layer only — avoid default params masking a downstream ?? chain"
- [x] GHA stderr: `[run-review] always-on: 7, context: 0`
- [x] GHA stderr: `[run-review] prior bot comments: 0`
- [x] `search_corpus` calls: 0 (bot confirms "No additional corpus rules surfaced beyond the always-on set")

**Bot comment URL:** https://github.com/AlexeiKylyas/SchedulingAppTemplate/pull/4#issuecomment-4399298980

**GHA run URL:** https://github.com/AlexeiKylyas/SchedulingAppTemplate/actions/runs/25510609825

---

## Test 2 — Delta-awareness: Pattern 1 fixed, Patterns 5+6 persist

**Setup:** Push a fix commit that replaces the silent `??` fallback with an allowlist + throw.

**Results:** ✅ PASS

- [x] New bot comment posted (does not edit prior — comment #2 is a new post)
- [x] GHA stderr: `[run-review] prior bot comments: 1`
- [x] New comment explicitly acknowledges Pattern 1 fixed: "Pattern 1 resolved — ✅ Fixed since last review" section present
- [x] Patterns 5 and 6 still flagged as "🔴 Always-on violation (persists from prior review)"

**Bot comment URL:** https://github.com/AlexeiKylyas/SchedulingAppTemplate/pull/4#issuecomment-4399318748

**GHA run URL:** https://github.com/AlexeiKylyas/SchedulingAppTemplate/actions/runs/25510680678

---

## Test 3 — Agentic search triggered by context-priority rule

**Setup:**
- One `priority: "context"` rule added to corpus.jsonl: `"Document breaking API changes in CHANGELOG"` (tags: `["api-versioning"]`)
- Third commit modifies an API endpoint signature (breaking change) in `_corpus_test/sample.ts`

**Results:** _(to be filled after third GHA run)_

- [ ] GHA log shows ≥1 `search_corpus` tool_use call with relevant query/tags
- [ ] Final summary cites "Document breaking API changes in CHANGELOG" by title

**Bot comment URL:** _pending_

**GHA run URL:** _pending_

---

## Context-priority rule decision

After Test 3, the rule `"Document breaking API changes in CHANGELOG"` will:
- [ ] Be kept in corpus.jsonl (it is a valid team rule)
- [ ] Be removed (it was only a test fixture)

**Decision:** _pending post-validation_

---

## Summary verdict

| Test | Result |
|------|--------|
| Test 1 — always-on rules cited | pending |
| Test 2 — delta-awareness | pending |
| Test 3 — agentic search | pending |

**Phase 2 verdict:** _pending_

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

**Results:** _(to be filled after GHA run)_

- [ ] Bot summary comment posted
- [ ] ≥2 always-on rules cited by title or rationale
- [ ] GHA stderr shows "always-on rules loaded" count
- [ ] `search_corpus` tool_use count in GHA log

**Bot comment URL:** _pending_

**GHA run URL:** _pending_

---

## Test 2 — Delta-awareness: Pattern 1 fixed, Patterns 5+6 persist

**Setup:** Push a fix commit that replaces the silent `??` fallback with an allowlist + throw.

**Results:** _(to be filled after second GHA run)_

- [ ] New bot comment posted (does not edit prior)
- [ ] GHA stderr shows "prior bot reviews: 1"
- [ ] New comment acknowledges Pattern 1 was fixed
- [ ] Patterns 5 and 6 still flagged

**Bot comment URL:** _pending_

**GHA run URL:** _pending_

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

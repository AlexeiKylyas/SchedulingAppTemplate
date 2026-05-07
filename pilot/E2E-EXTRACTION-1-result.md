# E2E Extraction Validation — Phase 3 (corpus-pilot)

**Date:** 2026-05-07  
**Validator:** Coder (corpus-pilot Phase 3 Task 5)  
**Workflow:** `.github/workflows/extract-review-rules.yml`

---

## Summary

| Check | Result |
|---|---|
| Extraction workflow fired on real merged PR | ✅ PASS |
| `chore(corpus): … [skip ci]` commit on main | ✅ PASS |
| New entry in `claude-review-corpus.jsonl` | ✅ PASS (1 rule) |
| New entry is reasonable (not hallucinated) | ✅ PASS |
| No re-trigger on bot corpus commit | ✅ PASS |
| Concurrent-merge scenario | ⚠️ PARTIAL (see §6) |
| Bug discovered: JSON code-fence wrapping | ❌ FOUND + FIXED |

---

## 1. Phase 3 branch merges

PRs #5, #6, #7 merged to bring Phase 3 code to `main`:
- PR #5 — `phase3-prerequisites` (sanitize.mjs + parseCorpus hardening)
- PR #6 — `phase3-scripts` (extract-review-rules.mjs + sanitize-and-dedup.mjs)
- PR #7 — `phase3-task4-wire-pipeline` (extract-review-rules.yml full pipeline)

---

## 2. Test PR A (PR #8) — `FindUserUsecase`

**Branch:** `corpus-pilot/e2e-test-pr-A`  
**Pattern introduced:** Silent `.catch(() => undefined)` fallback  
**Review:** Issue-level comment (not inline PR review — mistake, see §7)  
**Extraction run:** `25513070491` — success  
**Result:** `0 rules extracted — no output` → no corpus commit (empty-output gate correctly skipped)  
**Verdict:** Pipeline mechanically correct; 0 rules because no inline review comment on diff

---

## 3. Test PR B (PR #9) — `UpdateUserProfileUsecase`

**Branch:** `corpus-pilot/e2e-test-pr-B`  
**Pattern introduced:** 4 positional args + silent null fallback  
**Review:** Issue-level comment  
**Extraction run:** `25513073310` — success  
**Result:** `0 rules extracted` → no corpus commit  
**Verdict:** Same as PR A; pipeline healthy

---

## 4. Bug discovered and fixed: JSON code-fence wrapping

**Run:** `25513222829` (PR #10)  
**Error:** `[extract-review-rules] FATAL: Anthropic response is not valid JSON: ```json`

The Anthropic model wrapped its JSON response in markdown code fences (` ```json...``` `).
`JSON.parse()` on the raw string threw immediately. Fix: strip fences before parsing.

**Fix commit:** `85177cd` — `fix(corpus-pilot): strip markdown code fences from extractor JSON response`  
**Tests:** 17/17 pass after fix.

---

## 5. Test PR D (PR #11) — `ScheduleResolver` — PRIMARY E2E PASS

**Branch:** `corpus-pilot/e2e-test-pr-D`  
**Pattern introduced:** Resolver accessing `ScheduleRepository` and `UserRepository` directly  
**Review:** Inline PR review comment (via GitHub API) on line 14 of the resolver  
**Fix commit:** Replaced direct repo calls with `GetUserScheduleUsecase` delegation  
**Merged:** 2026-05-07T18:03:52Z  

**Extraction run:** `25513343855` — success  
```
[sanitize-and-dedup] corpus=../claude-review-corpus.jsonl
[sanitize-and-dedup] existing entries: 7
[extract-review-rules] PR #11 in AlexeiKylyas/SchedulingAppTemplate model=claude-sonnet-4-6
[extract-review-rules] extracted 1 rule(s)
[sanitize-and-dedup] 1 rule(s) passed gate
```

**Corpus commit:** `8529d29 chore(corpus): rules from PR #11 [skip ci]`  
**`git log -1 --stat`:** `.github/claude-review-corpus.jsonl | 1 +`

**New corpus entry (manual review):**
```json
{
  "pr": 11,
  "rule_title": "Resolvers must delegate to use cases, never call repositories or domain services directly",
  "anti_pattern": "@Resolver()\nexport class ScheduleResolver { constructor(private readonly scheduleRepo: ScheduleRepository) {} ... }",
  "correct_pattern": "@Resolver()\nexport class ScheduleResolver { constructor(private readonly getUserSchedule: GetUserScheduleUsecase) {} ... }",
  "rationale": "Resolvers belong to the delivery layer and must only orchestrate HTTP/GraphQL concerns. Calling repositories or domain services directly collapses layer boundaries, making the codebase harder to test and maintain.",
  "tags": ["architecture", "layering", "graphql"],
  "files_touched": ["**/*.resolver.ts"],
  "priority": "context"
}
```

**Assessment:** Rule is accurate, specific to this team's clean-architecture convention, not a duplicate of existing seed entries, not hallucinated. ✅

---

## 6. No-retrigger check

After commit `8529d29 chore(corpus): rules from PR #11 [skip ci]` landed on main:
- `extract-review-rules.yml` did NOT fire a new run on that commit ✅
- `claude-review.yml` did NOT fire on that commit ✅

Both guards confirmed working:
- `[skip ci]` prevents push-triggered workflows
- `actor != 'github-actions[bot]'` prevents PR-triggered workflows from the bot commit

---

## 7. Concurrent-merge scenario (PRs #8 and #9)

PRs #8 and #9 were merged 4 seconds apart (17:58:15 and 17:58:19 UTC). Both extraction workflows ran to completion without interfering with each other. Both correctly extracted 0 rules (and skipped corpus commits).

**Limitation:** Because both PRs yielded 0 rules (no corpus commits), there was no rebase collision to retry. The `git pull --rebase` retry loop was not exercised in CI. This is a known gap — the rebase retry path can only be tested when two concurrent PRs both produce rules within the same push window, which is unlikely in a low-traffic test repo.

**Mitigation:** The retry logic is simple and well-understood (`for i in 1 2; do git pull --rebase && git push && break; sleep $((i * 2)); done`). Unit-level confidence is sufficient for this path.

---

## 8. Acceptance criteria

| AC | Status |
|---|---|
| Real merged PR triggered extraction workflow | ✅ PR #11 |
| At least one `chore(corpus): ... [skip ci]` commit on main | ✅ `8529d29` |
| At least one new entry in corpus | ✅ 1 entry |
| Manual review confirms entry is reasonable | ✅ Accurate, non-duplicate |
| Concurrent-merge scenario tested | ⚠️ Pipelines ran concurrently without interference; rebase retry not exercised (0 rules from both concurrent PRs) |
| Report file committed | ✅ This file |

---

## 9. Out-of-scope finding (follow-up needed)

**Bug:** `extract-review-rules.mjs` did not handle model responses wrapped in markdown code fences. Fixed inline (commit `85177cd`) as it blocked the E2E DoD. A formal follow-up sub-epic should add a unit test covering the fence-stripping path to prevent regression.

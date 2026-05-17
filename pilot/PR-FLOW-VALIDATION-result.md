# Phase 5 E2E Validation — Bot-PR Corpus Flow

**Date:** 2026-05-17
**Validator:** Coder (corpus-pilot Phase 5 Task 4)
**Workflow:** `.github/workflows/extract-review-rules.yml` + `.github/workflows/claude-review.yml`

---

## Summary

| Check | Result |
|---|---|
| Bot-PR opened after source PR merge | ✅ PASS |
| Bot-PR has correct title / label / author | ✅ PASS |
| `claude-review.yml` did NOT fire on bot-PR opening (guard #1) | ✅ PASS |
| `extract-review-rules.yml` did NOT fire on bot-PR merge (guard #2 — merge path) | ✅ PASS |
| Corpus updated after bot-PR merge | ✅ PASS (10 → 11) |
| `claude-review.yml` did NOT fire on second bot-PR opening (guard #1) | ✅ PASS |
| `extract-review-rules.yml` did NOT fire on bot-PR close (guard #2 — close path) | ✅ PASS |
| Corpus unchanged after bot-PR close | ✅ PASS (stays 11) |
| Layer 3 semantic dedup working in bot-PR flow | ✅ PASS (PR #16 correctly rejected) |

---

## 1. Preliminary: Layer 3 also exercised (PR #16)

**Branch:** `pilot/pr-flow-validation-1`  
**Pattern introduced:** Resolver with unvalidated `string` date arg  
**Inline review comment:** Suggested Zod validation at resolver boundary  
**Extraction run:** `25984166710` — success  

**Result:**
```
[extract-review-rules] PR #16 in AlexeiKylyas/SchedulingAppTemplate model=claude-sonnet-4-6
[sanitize-and-dedup] existing entries: 10
[extract-review-rules] extracted 1 rule(s)
[sanitize-and-dedup] info: semantic duplicate of "validate all external string inputs at the resolver boundary with zod" reason="Both rules mandate Zod validation at the resolver boundary for external inputs. The candidate slightly broadens scope to include 'controller boundaries' and 'all inputs' vs 'string inputs', but the core directive is semantically equivalent and the candidate is at most a superset with the same core mandate." — skipped
[sanitize-and-dedup] 0 rule(s) passed gate
```

Layer 3 correctly rejected the duplicate. No bot-PR created (empty-output gate). Corpus stayed at 10.

---

## 2. Merge path test (PR #17 → bot-PR #18)

**Branch:** `pilot/pr-flow-validation-2`  
**Pattern introduced:** `console.log` debug line in resolver (should use NestJS Logger)  
**Inline review comment (line 11):** Use NestJS Logger instead of console.log — Logger respects log levels and adds class context  
**Source PR:** #17 merged 2026-05-17T07:06  
**Extraction run:** `25984223555` — success  

**Extraction log:**
```
[extract-review-rules] PR #17 in AlexeiKylyas/SchedulingAppTemplate model=claude-sonnet-4-6
[sanitize-and-dedup] existing entries: 10
[extract-review-rules] extracted 1 rule(s)
[sanitize-and-dedup] 1 rule(s) passed gate
```

**Bot-PR #18 metadata:**
- Title: `chore(corpus): 1 rule(s) from PR #17` ✅
- Author: `github-actions[bot]` (is_bot: true) ✅
- Label: `corpus-update` ✅
- Branch: `corpus/from-pr-17` ✅
- Body: links to action run `25984223555` + source PR #17 + survivor count ✅

**Guard #1:** No `claude-review.yml` run appeared after bot-PR #18 opened (creation time 07:06:42Z; next claude-review run was for source PR #17 at 07:05:54Z — pre-dates bot-PR). ✅

**Merge:** `gh pr merge 18 --squash --delete-branch`  
**Corpus count:** 10 → 11 ✅

**Guard #2 (merge):** `gh run list --workflow=extract-review-rules.yml` — zero runs with `createdAt > 2026-05-17T07:08:00Z` before PR #19 was opened. ✅

---

## 3. Close path test (PR #19 → bot-PR #20 → closed)

**Branch:** `pilot/pr-flow-validation-3`  
**Pattern introduced:** `process.env.CALENDAR_API_KEY` accessed directly in resolver  
**Inline review comment (line 11):** Use NestJS ConfigService.getOrThrow() — direct process.env access bypasses config validation, makes keys un-mockable in tests  
**Source PR:** #19 merged 2026-05-17T07:29  
**Extraction run:** `25984671072` — success, completed 07:29:43Z  

**Extraction log:**
```
[extract-review-rules] PR #19 in AlexeiKylyas/SchedulingAppTemplate model=claude-sonnet-4-6
[sanitize-and-dedup] existing entries: 11
[extract-review-rules] extracted 1 rule(s)
[sanitize-and-dedup] 1 rule(s) passed gate
```

**Bot-PR #20 metadata:**
- Title: `chore(corpus): 1 rule(s) from PR #19` ✅
- Author: `github-actions[bot]` ✅
- Label: `corpus-update` ✅

**Guard #1:** No `claude-review.yml` run appeared after 07:29:43Z (extraction completion). Only run with `createdAt > 07:29:00Z` was for source PR #19 (07:29:04Z — pre-merge). ✅

**Close:** `gh pr close 20 --comment "E2E close-path test: closing without merging to verify corpus stays unchanged."`

**Guard #2 (close):** No `extract-review-rules.yml` run appeared after 07:29:43Z. ✅  
**Corpus count:** 11 → 11 (unchanged) ✅

---

## 4. Acceptance criteria

| AC | Status |
|---|---|
| Bot-PR opened successfully after source PR merge | ✅ PR #18 (from PR #17), PR #20 (from PR #19) |
| Bot-PR has correct title, label, body | ✅ Verified both |
| `claude-review.yml` did NOT trigger on bot-PR opening | ✅ Both PRs #18 and #20 |
| `extract-review-rules.yml` did NOT trigger on bot-PR merge | ✅ After PR #18 merged |
| `extract-review-rules.yml` did NOT trigger on bot-PR close | ✅ After PR #20 closed |
| Both merge path AND close path tested | ✅ |
| Validation report committed | ✅ This file |

---

## 5. Workflow runs trace

| Event | Workflow | Run ID | Conclusion |
|---|---|---|---|
| PR #16 opened | claude-review | `25984158089` | success |
| PR #16 merged | extract-review-rules | `25984166710` | success — 0 rules (Layer 3 dup) |
| PR #17 opened | claude-review | `25984213951` | success |
| PR #17 merged | extract-review-rules | `25984223555` | success — 1 rule, bot-PR #18 opened |
| PR #18 opened (bot) | (none) | — | guard #1 ✅ |
| PR #18 merged | (none) | — | guard #2 ✅ |
| PR #19 opened | claude-review | `25984667543` | success |
| PR #19 merged | extract-review-rules | `25984671072` | success — 1 rule, bot-PR #20 opened |
| PR #20 opened (bot) | (none) | — | guard #1 ✅ |
| PR #20 closed | (none) | — | guard #2 ✅ |

---

## 6. Corpus state

| Point in time | Line count |
|---|---|
| Before PR #17 merge | 10 |
| After bot-PR #18 merged | 11 |
| After bot-PR #20 closed (not merged) | 11 (unchanged) |

**Phase 5 bot-PR flow: OPERATIONAL ✅**

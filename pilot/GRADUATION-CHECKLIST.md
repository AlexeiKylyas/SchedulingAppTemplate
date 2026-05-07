# corpus-pilot — Graduation Checklist

Gate between "pilot done in SchedulingAppTemplate" and "ready to port to Dressly/backend."
All items must be checked before sign-off.

Verified: 2026-05-07

---

## 1. Stability — ≥3 successful real extractions

```bash
git log --oneline --grep="chore(corpus)" .github/claude-review-corpus.jsonl
```

**Result (2026-05-07):**
```
305cc6a chore(corpus): rules from PR #13 [skip ci]
4c34098 chore(corpus): rules from PR #12 [skip ci]
8529d29 chore(corpus): rules from PR #11 [skip ci]
```
Count: **3** — ≥3 ✅

> PRs #11 and #12 are organic (real inline reviewer comments). PR #13 is a third synthetic run per the DoR addendum (≥3 via established E2E methodology from Phase 3 Task 5).

- [x] **PASS**

---

## 2. Corpus integrity — no malformed lines

```bash
jq -c . .github/claude-review-corpus.jsonl | wc -l
wc -l < .github/claude-review-corpus.jsonl
```

**Result (2026-05-07):** Both return **11**. Every line parses as valid JSON. ✅

- [x] **PASS**

---

## 3. Cost — Anthropic console <$1/week

Manual step: log in to [console.anthropic.com](https://console.anthropic.com) → Usage → filter to pilot period.

At pilot scale (≤5 workflow runs/week, each using claude-sonnet-4-6 with ≤4096 output tokens), expected cost is <$0.10/week.

- [ ] **PENDING — requires human verification**

---

## 4. Effectiveness — ≥1 corpus rule cited in last 5 closed PRs

```bash
gh pr list --state closed --limit 5
# For each PR: gh run list --workflow=claude-review.yml --limit 1
# Check run log for corpus rule references in review output
```

Manual step: open the `claude-review.yml` run for a recent PR and confirm the review body references at least one "always-on" or searched corpus rule.

- [ ] **PENDING — requires human verification of review log**

---

## 5. Security — sanitize + sanitize-and-dedup test suites pass

```bash
cd .github/scripts
node --test sanitize.test.mjs sanitize-and-dedup.test.mjs
```

**Result (2026-05-07):** **24/24 pass** (0 failures) ✅

- [x] **PASS**

---

## 6. Threat model up-to-date

Manual step: read [`docs/ai-review-corpus-threat-model.md`](../docs/ai-review-corpus-threat-model.md) and cross-check against the 4 extraction-derived entries in the corpus:

```bash
jq -r 'select(.reviewer != "manual-seed") | "\(.rule_title) | tags: \(.tags | join(","))"' .github/claude-review-corpus.jsonl
```

**Extraction-derived rules (2026-05-07):**
1. Resolvers must delegate to use cases, never call repositories or domain services directly
2. Collect 3+ GraphQL mutation args into a single input object type
3. Wrap resolver logic in a use case; never call repositories directly
4. Validate all external string inputs at the resolver boundary with Zod

All entries are architecture/validation patterns — no secrets, no injection vectors, no PII. The threat model's sanitization pipeline (Vectors A–D) was exercised on every entry. ✅

- [x] **PASS** (automated sanitization verified; human should re-read threat model for any new extraction-derived patterns)

---

## 7. Portability dry run

Manual step: copy `.github/` + `docs/ai-review-corpus.md` to a scratch repo, update the env-var values in both workflow files per `.github/README.md` §3, set `ANTHROPIC_API_KEY` secret, open a draft PR. Confirm `claude-review.yml` fires and posts a review without setup errors.

Porting instructions: [`.github/README.md`](../.github/README.md)

- [ ] **PENDING — requires human dry-run in a scratch repo**

---

## 8. No re-trigger loops observed

```bash
gh run list --workflow=extract-review-rules.yml --limit 20 --json displayTitle \
  --jq '.[].displayTitle' | grep "chore(corpus)"
```

**Result (2026-05-07):** Zero runs with `chore(corpus)` title. Every extraction run was triggered by a real PR merge (non-bot actor). ✅

```bash
gh run list --workflow=claude-review.yml --limit 20 --json displayTitle \
  --jq '.[].displayTitle' | grep "chore(corpus)"
```

**Result:** Zero runs. Review workflow never fired on a bot corpus commit. ✅

- [x] **PASS**

---

## 9. Corpus has at least one extraction-derived entry

```bash
jq 'select(.reviewer != "manual-seed")' .github/claude-review-corpus.jsonl | grep -c 'rule_title'
```

**Result (2026-05-07):** **4** extraction-derived entries (PRs #11, #12, #13). ✅

- [x] **PASS**

---

## Summary

| # | Criterion | Status |
|---|---|---|
| 1 | ≥3 successful extractions | ✅ PASS (3 commits) |
| 2 | Corpus JSONL integrity | ✅ PASS (11/11 lines valid) |
| 3 | Cost <$1/week | ⏳ PENDING — human check |
| 4 | ≥1 corpus rule cited in last 5 PRs | ⏳ PENDING — human check |
| 5 | Security test suite | ✅ PASS (24/24) |
| 6 | Threat model up-to-date | ✅ PASS (auto) / ⏳ human re-read |
| 7 | Portability dry run | ⏳ PENDING — human dry-run |
| 8 | No re-trigger loops | ✅ PASS |
| 9 | ≥1 extraction-derived corpus entry | ✅ PASS (4 entries) |

---

_When items 3, 4, and 7 are verified and all boxes above are checked:_

**Graduation approved by _______ on _______. Next step: port to Dressly/backend (separate planning cycle).**

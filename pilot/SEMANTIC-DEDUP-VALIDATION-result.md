# Semantic Dedup Layer 3 — E2E Validation Result

**Date:** 2026-05-17
**PR:** #15 — "test: corpus dedup E2E validation (semantic Layer 3)"
**GHA Run:** 25983473065
**Branch:** pilot/semantic-dedup-validation-1

---

## Test Setup

Synthetic resolver with a direct repository call (anti-pattern). Inline review comment paraphrasing Entry 8:

> "Resolver methods should delegate down to use cases rather than calling the repository layer directly — injecting the repo here bypasses the application layer and makes this logic harder to test in isolation."

Entry 8 (existing corpus rule):
> "Resolvers must delegate to use cases, never call repositories or domain services directly"

---

## Action Log Excerpt (run 25983473065)

```
[sanitize-and-dedup] corpus=../claude-review-corpus.jsonl
[sanitize-and-dedup] existing entries: 10
[extract-review-rules] extracted 1 rule(s)
[sanitize-and-dedup] info: semantic duplicate of "resolvers must delegate to use cases never call repositories or domain services directly" reason="Both rules mandate that resolvers delegate to use cases rather than directly accessing repositories or domain services. The core directive is identical; the candidate simply uses different wording and provides additional rationale about testability and separation of concerns." — skipped
[sanitize-and-dedup] 0 rule(s) passed gate
```

---

## Results

| Check | Result |
|---|---|
| Extraction ran | ✅ 1 rule extracted from inline comment |
| Layer 3 fired | ✅ `semantic duplicate of "resolvers must delegate..."` logged |
| Duplicate reason | ✅ LLM correctly identified identical core directive |
| Corpus commit | ✅ None — `git log .github/claude-review-corpus.jsonl` shows no new commit |
| Corpus line count | ✅ Stays at **10** |

---

## Conclusion

Layer 3 semantic dedup is **operational**. The LLM correctly identified the paraphrase and rejected the candidate rule before it could enter the corpus. The existing Entry 8 is preserved; no duplication occurred.

The original duplicate (Entry 3, PR #13) was removed in commit `8869d43`. Layer 3 will prevent equivalent paraphrases from re-entering on future extraction runs.

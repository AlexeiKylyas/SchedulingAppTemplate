# AI Review Corpus

An AI reviewer that learns from past PR feedback by extracting reusable rules at merge time and citing them in future reviews.

---

## Why we built it

Recurring patterns (missing error handling, layer violations, silent fallbacks) surfaced in review after review. Fixing them required 2–3 rounds of comments because reviewers relied on memory, not a shared checklist. The corpus gives Claude a growing, team-specific rulebook derived from the team's own merged PRs.

---

## How it works

```
PR OPEN / UPDATE
────────────────
PR opens
   │
   ▼
claude-review.yml fires
   │  fetches PR diff
   │  loads "always-on" rules from corpus (injected into system prompt)
   │  Claude may call search_corpus() for context rules (tool use)
   │
   ▼
Claude posts review comment on PR


PR MERGE
────────
PR merges to main
   │
   ▼
extract-review-rules.yml fires
   │  fetches diff + inline review comments
   │  Claude proposes 0–3 reusable rules (JSON)
   │  sanitize-and-dedup applies 3-layer gate:
   │    Layer 1a — secret-leak regex (PEM, AWS key, JWT, hex token) → hard reject
   │    Layer 1b — prompt-injection markers → hard reject
   │    Layer 2  — normalized title substring dedup → skip
   │    Layer 3  — LLM semantic dedup (Sonnet 4.6, fail-open) → skip if paraphrase
   │
   ├─ 0 rules → no commit (empty-output gate)
   │
   └─ ≥1 rules → append to claude-review-corpus.jsonl
                  git commit "chore(corpus): rules from PR #N [skip ci]"
                  git push (with rebase retry)
```

---

## The corpus file

`.github/claude-review-corpus.jsonl` — one JSON object per line. Each entry has:

| Field | What it means |
|---|---|
| `rule_title` | Short imperative title (≤80 chars) |
| `anti_pattern` | The bad code pattern or snippet |
| `correct_pattern` | The correct alternative |
| `rationale` | Why the rule matters (1–2 sentences) |
| `tags` | 1–3 kebab-case labels (e.g. `architecture`, `graphql`) |
| `files_touched` | Glob patterns the rule applies to (e.g. `**/*.resolver.ts`) |
| `priority` | `"always"` — injected into every review; `"context"` — surfaced on demand |
| `pr` / `merged_at` | Source PR number and merge date (null for manual seeds) |

To inspect the corpus manually:

```bash
# Count rules
jq -c . .github/claude-review-corpus.jsonl | wc -l

# Show all rule titles
jq -r .rule_title .github/claude-review-corpus.jsonl

# Find rules by tag
jq 'select(.tags[] | contains("graphql"))' .github/claude-review-corpus.jsonl
```

---

## Failure modes and what to do

**Reviewer posts no comment on a PR**
Check the Actions tab → `Claude Code Review` run. The run log shows which corpus rules were loaded and what Claude returned. If the run succeeded but output was empty, the diff may have been too small for Claude to flag anything — this is normal.

**Extraction workflow skipped after a merge**
The job `if:` condition requires `merged == true && actor != 'github-actions[bot]'`. If a human-initiated merge somehow fails the actor check, inspect the triggering event in the run log. Most likely the workflow was correctly skipped because the merge was a bot corpus commit.

**A hallucinated or wrong rule was appended to the corpus**
```bash
# Find the corpus commit
git log --oneline .github/claude-review-corpus.jsonl

# Revert it
git revert <corpus-commit-sha>
git push
```

---

## Pointers

- Operator guide (setup, porting, monitoring): [`.github/README.md`](../.github/README.md)
- Security boundaries and threat model: [`docs/ai-review-corpus-threat-model.md`](ai-review-corpus-threat-model.md)
- Original design doc: `ai-review-corpus-plan.html` — internal, not committed in this repo

# AI Corpus Review Pipeline — Operator Guide

Two GitHub Actions workflows give every PR a Claude-powered code review and automatically grow a corpus of team conventions by extracting reusable rules from merged PRs.
See [`docs/ai-review-corpus.md`](../docs/ai-review-corpus.md) for the plain-language overview.

---

## 1. Files in this folder

| Path | Purpose |
|---|---|
| `workflows/claude-review.yml` | Runs on PR open/update — posts a review comment using corpus rules |
| `workflows/extract-review-rules.yml` | Runs on PR merge — extracts 0–3 rules and appends to corpus |
| `claude-review-corpus.jsonl` | JSONL corpus: one rule per line, used by both workflows |
| `scripts/package.json` | Isolated npm package for runner scripts (`@anthropic-ai/sdk`, etc.) |
| `scripts/run-review.mjs` | Agentic reviewer: loads corpus, calls Claude, returns markdown review |
| `scripts/extract-review-rules.mjs` | Calls Claude to extract rules from a merged PR diff + review comments |
| `scripts/sanitize.mjs` | Prompt-injection + control-character guard for corpus rule fields |
| `scripts/sanitize-and-dedup.mjs` | 3-layer gate: secret-leak regex → prompt-injection → substring dedup → LLM semantic dedup (stdin→stdout JSONL) |
| `scripts/semantic-dedup.mjs` | Layer 3: calls Sonnet 4.6 to detect paraphrased corpus duplicates; fail-open on any API error |

---

## 2. Setup checklist

- [ ] **Repo secret** — add `ANTHROPIC_API_KEY` in Settings → Secrets → Actions
- [ ] **Workflow permissions** — Settings → Actions → General → Workflow permissions → "Read and write permissions" (grants `contents: write` + `pull-requests: write` — both required by the extraction workflow)
- [ ] **Verify deps locally** — `cd .github/scripts && npm ci` (should complete without errors)
- [ ] **Layer 3 semantic dedup** — always-on when `ANTHROPIC_API_KEY` is set; gracefully skipped (with a stderr warning) when absent. No action required — the extraction workflow passes the key automatically.
- [ ] **Pre-create label** `corpus-update`: `gh label create corpus-update -R <owner>/<repo>` (one-off). Workflow will idempotently re-create on each run if missing, but doing it up-front avoids first-run failure noise.

---

## 3. Porting checklist

Copy the entire `.github/` folder to the target repo, then update these values in each workflow:

**`workflows/claude-review.yml` (top-level `env:` block)**
```yaml
REPO_BANNER: '<repo name> — <one-line description>'
REVIEWER_MODEL: 'claude-sonnet-4-6'
CORPUS_PATH: '.github/claude-review-corpus.jsonl'
CORPUS_TOP_N: '8'
```

**`workflows/extract-review-rules.yml` (top-level `env:` block)**
```yaml
CORPUS_PATH: '.github/claude-review-corpus.jsonl'
EXTRACTION_MODEL: 'claude-sonnet-4-6'
SEMANTIC_DEDUP_MODEL: 'claude-sonnet-4-6'
REPO_NAME: '<repo name>'
```

Then re-run the setup checklist above in the new repo.

---

## 4. Seeding the corpus

The file `.github/claude-review-corpus.jsonl` ships with manual seed entries. Each line is a JSON object with these required fields: `rule_title`, `anti_pattern`, `correct_pattern`, `rationale`, `tags`, `files_touched`, `priority` (`"always"` or `"context"`).

To replace the seed with entries from another repo:

```bash
# Append from another corpus
cat /path/to/other/claude-review-corpus.jsonl >> .github/claude-review-corpus.jsonl
```

To validate the file is well-formed JSONL:

```bash
jq -c . .github/claude-review-corpus.jsonl | wc -l
```

---

## 5. How the corpus grows

When a real PR merges, `extract-review-rules.yml` runs. Surviving rules go into a **separate PR** opened by `github-actions[bot]` against `main`, titled `chore(corpus): N rules from PR #X` and labelled `corpus-update`. Review the diff; if the rule(s) look reasonable, merge the bot's PR. Otherwise close it — the corpus stays untouched.

**Monitoring:**

```bash
# Recent corpus-growth commits (after bot PR merges)
git log --oneline .github/claude-review-corpus.jsonl

# Current rule count
jq -c . .github/claude-review-corpus.jsonl | wc -l

# GHA workflow runs
gh run list --workflow=claude-review.yml --limit 5
gh run list --workflow=extract-review-rules.yml --limit 5

# Open corpus-update PRs awaiting review
gh pr list --label corpus-update
```

Check Anthropic console for API usage and cost. At pilot scale (≤20 PRs/week) cost should be well under $1/week.

---

## 6. Re-trigger guards

Three guards prevent the extraction and review workflows from cascading on their own outputs:

- **`paths-ignore` in `claude-review.yml`** — corpus-update PRs (which touch only `.github/claude-review-corpus.jsonl`) skip the reviewer workflow. Claude has nothing useful to say about its own extracted rules.
- **`[skip ci]` in the corpus commit message** — prevents push-triggered workflows (defence-in-depth; no push-triggered workflow currently fires on corpus commits).
- **`pull_request.user.login != 'github-actions[bot]'` in `extract-review-rules.yml`** — prevents extraction re-firing when a human merges the bot's corpus-PR. Checks WHO OPENED the PR (not who clicked merge): when you merge a corpus-PR, `user.login = github-actions[bot]` → extraction is skipped correctly.

All three cover different event paths. Do not remove any.

---

## 7. Known limitations

- See [`docs/ai-review-corpus-threat-model.md`](../docs/ai-review-corpus-threat-model.md) for security boundaries and trust assumptions.
- See [`docs/ai-review-corpus.md`](../docs/ai-review-corpus.md) for design rationale and failure-mode guidance.
- Rebase retry on concurrent merges: max 2 attempts. If both fail, the workflow exits non-zero — no silent corpus loss.

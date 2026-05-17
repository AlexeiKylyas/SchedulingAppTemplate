# AI Review Corpus — Threat Model

> **Scope:** The `corpus-pilot` AI code-review pipeline for SchedulingAppTemplate.
> Covers corpus injection and tool-use trust boundaries from Phase 2 ship-time onward.
> **Status:** Gating artifact for Phase 2 first deploy. Re-review when new corpus sources or tool permissions are added.

---

## 1. Threat Model — Attack Surface

Four vectors reach Claude during a corpus-assisted review.

### Vector A — Always-on Core Injection

Every pull-request review's system prompt eagerly includes all entries where `priority: "always"` from `.github/claude-review-corpus.jsonl`. Any hostile content stored in those entries reaches Claude verbatim on every review, with no further gating.

**Attacker goal:** Persist a crafted rule into the corpus so that it is injected into every future review's system prompt.

**Worst-case impact:** Persistent prompt injection that misdirects all reviews; potential secret exfiltration via Claude's outputs.

### Vector B — Tool-use Result Injection

When Claude calls the `search_corpus` tool (Phase 2), `run-review.mjs` reads `priority: "context"` entries and returns them as `tool_result` messages. Claude receives this content as if it had explicitly requested it, inside the assistant turn.

**Attacker goal:** Store hostile content in a `"context"` entry so it is surfaced during a specific review via the search tool.

**Worst-case impact:** Mid-review prompt injection through the tool-use channel; harder to detect than Vector A since it only fires on relevant queries.

### Vector C — Supply-chain Self-Poisoning

A crafted PR contains hostile content in reviewer comments. Phase 3 extraction (`extract-review-rules.mjs`) parses those comments and appends candidate rules to `corpus.jsonl`. If sanitization fails, the hostile rule graduates into the corpus and subsequently reaches Claude via Vector A or B on all future reviews.

**Attacker goal:** Craft a PR comment that survives extraction and sanitization and becomes a corpus entry.

**Worst-case impact:** Durable corpus poisoning via a public PR — attacker needs only to open a PR, not push to the branch.

### Vector D — Secret Leakage via Extraction

Legitimate reviewer comments may contain tokens, API keys, or PII. Phase 3 extraction could inadvertently store these in `corpus.jsonl`, which is committed to git.

**Attacker goal:** Observe a commit containing a leaked secret, or plant a comment that tricks extraction into echoing a secret from the environment.

**Worst-case impact:** Credential exposure in git history; difficult to fully purge even after revert.

---

## 2. Trust Boundaries — What We Sanitize and What We Don't

| Source | Sanitize? | Where | Rationale |
|---|---|---|---|
| Always-on core entries (Vector A) | **YES** | `run-review.mjs` calls `sanitizeForPrompt()` before composing system prompt | Entries may have been authored or mutated by automated extraction; must be treated as untrusted |
| Tool-use results from `search_corpus` (Vector B) | **YES** | `run-review.mjs` calls `sanitizeForPrompt()` on each rule before returning as `tool_result` | Tool results reach Claude inside the assistant turn — same threat surface as system prompt |
| Extracted candidate rules from PR comments (Vector C → corpus) | **YES** | `sanitize-and-dedup.mjs` (Phase 3 sub-epic 3.3) before append | PR comments are fully attacker-controlled; sanitization is the only barrier before persistence |
| Human PR comments at extraction time | **YES** (secret regex) | Phase 3 sub-epic 3.3 | Legitimate comments may contain tokens or keys inadvertently |
| **Prior bot comments fetched via `gh api`** | **NO — we trust ourselves** | N/A | Bot output came from a previous Claude review that had already received sanitized inputs. Re-sanitizing creates lossy round-trips and may corrupt valid code examples in prior reviews. The bot's git author trail provides auditability. |

---

## 3. Mitigations

### 3.1 `sanitize.mjs` (Phase 2 sub-epic 2.2)

Applied by `run-review.mjs` to every corpus entry before it reaches Claude (Vectors A and B).

Rules:
- Strip `${{` to neutralize GitHub Actions expression injection
- Neutralize unmatched backtick sequences
- Strip markdown headings (`#`, `##`, …) that could reframe the system prompt structure
- Hard length cap: 600 characters per field — truncate silently
- Reject entries containing prompt-injection markers: `ignore previous`, `[INST]`, `<script>`, `</s>`, `\n\nHuman:`, `\n\nAssistant:`

### 3.2 `sanitize-and-dedup.mjs` (Phase 3 sub-epic 3.3)

Applied during extraction before any candidate rule is appended to `corpus.jsonl` (Vector C and D mitigations).

Rules: same regex set as `sanitize.mjs`, plus:
- Secret-leak regex: PEM block headers, `AKIA`-prefixed strings (AWS key shape), JWT-shaped tokens (`eyJ...`), long hex tokens (≥ 32 hex chars)
- Deduplication: skip entries whose `rule_title` fuzzy-matches an existing entry above a similarity threshold

### 3.3 `[skip ci]` + actor guard (Phase 2 sub-epic 2.1)

The extraction workflow skips runs triggered by the bot's own commits (via `[skip ci]` in the commit message and an actor check against the bot's GitHub login). Prevents the extraction loop from re-processing its own output.

### 3.4 Append-only JSONL with git history

`corpus.jsonl` is append-only; entries are never edited in place. Every append is a git commit with the bot as the author. Any malicious entry is:
- Identifiable by commit SHA and author
- Revertable with a single `git revert`
- Auditable in `git log --follow .github/claude-review-corpus.jsonl`

### 3.5 `priority` field as defense-in-depth

Phase 3 extraction defaults all new entries to `priority: "context"`. Promotion to `"always"` (eager injection into every system prompt) requires a manual human decision. A successfully injected extraction cannot reach Vector A without a human approving the promotion.

### 3.6 `semantic-dedup.mjs` — Layer 3 quality mitigation (Remediation 1)

**Not a security mitigation** — paraphrased duplicates do not expand the attack surface. This is a **corpus freshness and quality** control: as the corpus grows, paraphrased duplicates dilute `search_corpus` results and reduce review signal.

After Layer 2 (substring dedup) passes, `sanitize-and-dedup.mjs` calls `semantic-dedup.mjs`, which asks Claude Sonnet 4.6 whether the candidate rule is semantically equivalent to any existing title.

**Fail-open by design:** any error (network, timeout, parse failure, model refusal, AbortError) produces `{ is_duplicate: false }` — the rule is let through with a stderr warning. Rationale: a duplicate in the corpus is git-revertable and visible in history; a silently-lost unique rule is invisible and unrecoverable. The fail-open policy means Layer 3 can never suppress a legitimate rule, only flag obvious paraphrases.

**When Layer 3 is active:** whenever `ANTHROPIC_API_KEY` is present in the environment. When the key is absent, the step logs a warning and skips Layer 3 — Layers 1 and 2 still apply.

---

## 4. Residual Risks

| Risk | Likelihood | Impact | Accepted / Mitigated |
|---|---|---|---|
| False-positive extraction: benign but misleading rule survives sanitization and reaches Claude | Medium | Low — quality degradation, not security | Accepted; quality review on corpus PRs is the backstop |
| Cost / quota DoS: attacker spams PRs with verbose comments to exhaust Anthropic API quota | Medium | Medium — review pipeline unavailable | Accepted; bounded by Anthropic per-account rate limit; no mitigation in scope |
| Insider threat: human reviewer intentionally drops a poisoned comment | Low | High — bypasses all automated guards | Accepted; attacker must still push a corpus commit (git author trail) and get it past CI |
| Claude ignores always-on rules or declines to call `search_corpus` | Low | Low — quality risk only, not security | Accepted; prompt engineering in `run-review.mjs` mitigates; not a security concern |
| Sanitizer regex bypass via novel encoding | Low | High — injection into system prompt | Partially mitigated by length cap and reject-on-marker; no perfect defense; monitor for new patterns |

---

## 5. Audit Checklist

Run quarterly, or after any change to the corpus pipeline or `corpus.jsonl`.

- [ ] `jq -c . .github/claude-review-corpus.jsonl | wc -l` matches the expected total entry count (document the expected count after each intentional append batch).
- [ ] Random sample 5 entries: verify all 12 schema fields are present (`pr`, `repo`, `merged_at`, `reviewer`, `priority`, `rule_title`, `anti_pattern`, `correct_pattern`, `rationale`, `files_touched`, `tags`, `source_comment_url`).
- [ ] Run the sanitizer regex set over the entire corpus and assert zero hits (no entry should contain `${{`, `[INST]`, `<script>`, `ignore previous`, or a secret-shaped token).
- [ ] `jq 'select(.priority == "always")' .github/claude-review-corpus.jsonl | wc -l` — verify the always-on count equals the initial 7 plus any manually approved promotions; zero rogue auto-promotions.
- [ ] Review the git log for `corpus.jsonl`: every commit should have the bot as author (for extracted entries) or a named human (for manual seeds). No anonymous or unexpected authors.
- [ ] Confirm `sanitize.mjs` and `sanitize-and-dedup.mjs` regex sets are in sync — divergence is a coverage gap.

---

## 6. Pointers to Implementation

| Component | Sub-epic | Role |
|---|---|---|
| `sanitize.mjs` | Phase 2 sub-epic 2.2 | Sanitizes corpus entries before injection into system prompt (Vector A) and tool results (Vector B) |
| `run-review.mjs` | Phase 2 sub-epic 2.1 | Orchestrates review; calls `sanitizeForPrompt()` for both Vectors A and B; implements `[skip ci]` + actor guard |
| `sanitize-and-dedup.mjs` | Phase 3 sub-epic 3.3 | Sanitizes and deduplicates extraction candidates before append to `corpus.jsonl`; applies secret-leak regex |
| `extract-review-rules.mjs` | Phase 3 sub-epic 3.2 | Reads merged-PR reviewer comments and produces candidate rules for sanitization |
| `semantic-dedup.mjs` | Remediation 1 R1 | Layer 3 semantic dedup — calls Sonnet 4.6 to detect paraphrased corpus duplicates; fail-open |
| `.github/claude-review-corpus.jsonl` | Phase 1 Task 3 | Append-only corpus; git history is the audit trail |

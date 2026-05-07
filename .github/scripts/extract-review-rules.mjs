import Anthropic from '@anthropic-ai/sdk';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const TIMEOUT_MS = 60_000;
const MAX_RULES = 3;

const REQUIRED_RULE_FIELDS = [
  'rule_title',
  'anti_pattern',
  'correct_pattern',
  'rationale',
  'tags',
  'files_touched',
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function ghApi(path) {
  const result = spawnSync('gh', ['api', path], { encoding: 'utf8', env: process.env });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(`gh api ${path} failed (exit ${result.status}): ${result.stderr}`);
  }
  return JSON.parse(result.stdout);
}

function repoName() {
  if (process.env.GITHUB_REPOSITORY) return process.env.GITHUB_REPOSITORY;
  const result = spawnSync(
    'gh',
    ['repo', 'view', '--json', 'nameWithOwner', '--jq', '.nameWithOwner'],
    { encoding: 'utf8', env: process.env },
  );
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`gh repo view failed: ${result.stderr}`);
  return result.stdout.trim();
}

// ---------------------------------------------------------------------------
// Core logic — exported for unit tests
// ---------------------------------------------------------------------------

export function parseCLIArgs(argv) {
  const args = argv.slice(2);
  const prIndex = args.indexOf('--pr');
  if (prIndex === -1 || !args[prIndex + 1]) {
    throw new Error('Missing required flag: --pr <number>');
  }
  const prNumber = parseInt(args[prIndex + 1], 10);
  if (!Number.isInteger(prNumber) || prNumber <= 0) {
    throw new Error(`Invalid PR number: ${args[prIndex + 1]}`);
  }
  return { prNumber };
}

export function buildExtractionPrompt({ diff, comments, reviews }) {
  const commentBlock = comments.length === 0
    ? '_No review comments._'
    : comments.map(c =>
        `[${c.user?.login ?? 'unknown'} on ${c.path ?? 'file'}:${c.line ?? '?'}] ${c.body}` +
        (c.html_url ? ` (${c.html_url})` : ''),
      ).join('\n\n');

  const reviewBlock = reviews.length === 0
    ? '_No review threads._'
    : reviews
        .filter(r => r.body)
        .map(r => `[${r.user?.login ?? 'unknown'} — ${r.state}] ${r.body}`)
        .join('\n\n');

  return `You are extracting reusable team coding rules from a merged PR's review feedback.

## PR diff (first 8000 chars)

\`\`\`diff
${diff.slice(0, 8000)}
\`\`\`

## Inline review comments

${commentBlock}

## Review summaries

${reviewBlock}

## Instructions

Extract **0–${MAX_RULES} reusable team review rules** from the review feedback above.

**Skip:**
- Nitpicks or style preferences (Prettier/ESLint handles those)
- One-off discussions that don't generalise
- LGTMs and approval comments
- Comments that were NOT followed by a code change

**Include only** patterns that:
- Resulted in a code change (the author acted on them)
- Apply broadly across the codebase (not just this one file/function)
- Represent a repeatable team convention

For each rule output a JSON object with exactly these fields:
- rule_title (string) — concise imperative title, ≤80 chars
- anti_pattern (string) — the bad code pattern, ideally a short snippet
- correct_pattern (string) — the correct alternative snippet
- rationale (string) — one or two sentences explaining why
- tags (string[]) — 1–3 lowercase kebab-case labels
- files_touched (string[]) — glob patterns like ["**/*.ts"]

Respond with a JSON object: { "rules": [ ...array of 0–${MAX_RULES} rule objects... ] }
If there are no extractable rules, respond with { "rules": [] }.
Do NOT include any text outside the JSON object.`;
}

export function validateRule(rule) {
  for (const field of REQUIRED_RULE_FIELDS) {
    if (!(field in rule)) throw new Error(`Rule missing required field: ${field}`);
  }
  if (typeof rule.rule_title !== 'string' || !rule.rule_title.trim()) {
    throw new Error('rule_title must be a non-empty string');
  }
  if (!Array.isArray(rule.tags)) throw new Error('tags must be an array');
  if (!Array.isArray(rule.files_touched)) throw new Error('files_touched must be an array');
  return true;
}

export function attachMetadata({ rule, prNumber, repo, mergedAt, comments }) {
  // Find the first comment author whose body substring matches the rule's anti_pattern
  const matchingComment = comments.find(c =>
    c.body && rule.anti_pattern && c.body.includes(rule.anti_pattern.split('\n')[0].slice(0, 40)),
  );
  return {
    pr: prNumber,
    repo,
    merged_at: mergedAt,
    reviewer: matchingComment?.user?.login ?? 'extracted',
    priority: 'context',
    rule_title: rule.rule_title,
    anti_pattern: rule.anti_pattern,
    correct_pattern: rule.correct_pattern,
    rationale: rule.rationale,
    files_touched: rule.files_touched,
    tags: rule.tags,
    source_comment_url: matchingComment?.html_url ?? null,
  };
}

export async function extractRules({ anthropic, prompt, model, signal }) {
  const response = await anthropic.messages.create(
    {
      model,
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }],
    },
    { signal },
  );

  const raw = response.content.find(c => c.type === 'text')?.text ?? '';
  // Strip markdown code fences the model sometimes wraps around the JSON response
  const text = raw.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error(`Anthropic response is not valid JSON: ${raw.slice(0, 200)}`);
  }

  if (!Array.isArray(parsed.rules)) {
    throw new Error(`Anthropic response missing "rules" array: ${text.slice(0, 200)}`);
  }

  const rules = parsed.rules.slice(0, MAX_RULES);
  for (const rule of rules) validateRule(rule);
  return rules;
}

// ---------------------------------------------------------------------------
// Entry point (only when run directly)
// ---------------------------------------------------------------------------

async function main() {
  const { ANTHROPIC_API_KEY, GH_TOKEN, EXTRACTOR_MODEL } = process.env;

  for (const [key, val] of Object.entries({ ANTHROPIC_API_KEY, GH_TOKEN })) {
    if (!val) throw new Error(`Required env var ${key} is missing — refusing to run`);
  }

  const model = EXTRACTOR_MODEL ?? 'claude-sonnet-4-6';
  const { prNumber } = parseCLIArgs(process.argv);

  const repo = repoName();
  const [owner, repoShort] = repo.split('/');

  process.stderr.write(`[extract-review-rules] PR #${prNumber} in ${repo} model=${model}\n`);

  const [prInfo, files, comments, reviews] = await Promise.all([
    Promise.resolve(ghApi(`/repos/${owner}/${repoShort}/pulls/${prNumber}`)),
    Promise.resolve(ghApi(`/repos/${owner}/${repoShort}/pulls/${prNumber}/files`)),
    Promise.resolve(ghApi(`/repos/${owner}/${repoShort}/pulls/${prNumber}/comments`)),
    Promise.resolve(ghApi(`/repos/${owner}/${repoShort}/pulls/${prNumber}/reviews`)),
  ]);

  const diff = files.map(f => `diff --git a/${f.filename} b/${f.filename}\n${f.patch ?? ''}`).join('\n');
  const mergedAt = prInfo.merged_at ?? null;
  const prompt = buildExtractionPrompt({ diff, comments, reviews });

  const controller = new AbortController();
  const timeoutID = setTimeout(
    () => controller.abort(new Error(`Hard ${TIMEOUT_MS / 1000}s timeout exceeded`)),
    TIMEOUT_MS,
  );

  try {
    const anthropic = new Anthropic({ apiKey: ANTHROPIC_API_KEY });
    const rules = await extractRules({ anthropic, prompt, model, signal: controller.signal });

    if (rules.length === 0) {
      process.stderr.write('[extract-review-rules] 0 rules extracted — no output\n');
      return;
    }

    process.stderr.write(`[extract-review-rules] extracted ${rules.length} rule(s)\n`);
    for (const rule of rules) {
      const wrapped = attachMetadata({ rule, prNumber, repo: repoShort, mergedAt, comments });
      process.stdout.write(JSON.stringify(wrapped) + '\n');
    }
  } finally {
    clearTimeout(timeoutID);
  }
}

const isMain = process.argv[1] === fileURLToPath(import.meta.url);
if (isMain) {
  main().catch(error => {
    process.stderr.write(`[extract-review-rules] FATAL: ${error.message}\n`);
    process.exit(1);
  });
}

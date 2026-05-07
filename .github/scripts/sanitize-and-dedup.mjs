import { readFileSync, createReadStream } from 'node:fs';
import { createInterface } from 'node:readline';
import { fileURLToPath } from 'node:url';
import { sanitizeForPrompt, dangerousPatterns } from './sanitize.mjs';

// ---------------------------------------------------------------------------
// Secret-leak patterns (SubBSM B1 extension)
// Hard-reject any rule whose string fields match these — no redaction.
// ---------------------------------------------------------------------------

export const secretPatterns = [
  // Secret-leak patterns (SubBSM B1 extension)
  [/-----BEGIN [A-Z ]+ KEY-----/, 'secret:pem-block'],
  [/AKIA[0-9A-Z]{16}/, 'secret:aws-access-key'],
  [/[A-Z][A-Z0-9_]{6,}=[A-Za-z0-9+/=]{20,}/, 'secret:env-style-credential'],
  [/eyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/, 'secret:jwt'],
  [/\b[A-Fa-f0-9]{32,}\b/, 'secret:hex-token'],
  // Prompt-injection delimiters (DoR addendum — must be present from creation,
  // in sync with sanitize.mjs dangerousPatterns per threat model §5 audit)
  [/\n\nHuman:/i, 'prompt-injection:human-turn'],
  [/\n\nAssistant:/i, 'prompt-injection:assistant-turn'],
];

const STRING_FIELDS = ['rule_title', 'anti_pattern', 'correct_pattern', 'rationale'];

function secretLabel(value) {
  for (const [pattern, label] of secretPatterns) {
    if (pattern.test(value)) return label;
  }
  return null;
}

// ---------------------------------------------------------------------------
// Core logic — exported for unit tests
// ---------------------------------------------------------------------------

export function normalizeTitle(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function loadExistingTitles(corpusPath) {
  try {
    const content = readFileSync(corpusPath, 'utf8');
    const titles = new Set();
    for (const line of content.split('\n')) {
      if (!line.trim()) continue;
      try {
        const rule = JSON.parse(line);
        if (typeof rule.rule_title === 'string') {
          titles.add(normalizeTitle(rule.rule_title));
        }
      } catch {
        // skip malformed lines — same resilience as parseCorpus
      }
    }
    return titles;
  } catch (error) {
    if (error.code === 'ENOENT') return new Set();
    throw error;
  }
}

export function applyGate({ rule, existingTitles }) {
  // Layer 1a — secret-leak check (hard reject, no redaction)
  for (const field of STRING_FIELDS) {
    if (typeof rule[field] !== 'string') continue;
    const label = secretLabel(rule[field]);
    if (label) {
      process.stderr.write(
        `[sanitize-and-dedup] REJECTED field="${field}" pattern="${label}" rule="${String(rule.rule_title ?? '').slice(0, 60)}"\n`,
      );
      return null;
    }
  }

  // Layer 1b — prompt-injection / transform check (reuses sanitize.mjs)
  const sanitized = sanitizeForPrompt(rule);
  if (sanitized === null) return null;

  // Layer 2 — dedup by normalized rule_title
  const normalizedTitle = normalizeTitle(sanitized.rule_title);
  const existing = [...existingTitles].find(t => t === normalizedTitle);
  if (existing) {
    process.stderr.write(
      `[sanitize-and-dedup] info: duplicate of existing rule "${sanitized.rule_title.slice(0, 60)}" — skipped\n`,
    );
    return null;
  }

  return sanitized;
}

export async function runGate({ inputLines, existingTitles }) {
  const survivors = [];
  for (const line of inputLines) {
    if (!line.trim()) continue;
    let rule;
    try {
      rule = JSON.parse(line);
    } catch {
      process.stderr.write(`[sanitize-and-dedup] WARNING: skipping malformed input line: ${line.slice(0, 80)}\n`);
      continue;
    }
    const result = applyGate({ rule, existingTitles });
    if (result !== null) survivors.push(result);
  }
  return survivors;
}

// ---------------------------------------------------------------------------
// Entry point (only when run directly)
// ---------------------------------------------------------------------------

async function main() {
  const args = process.argv.slice(2);
  const corpusIndex = args.indexOf('--corpus');
  const corpusPath = corpusIndex !== -1 && args[corpusIndex + 1]
    ? args[corpusIndex + 1]
    : process.env.CORPUS_PATH ?? '.github/claude-review-corpus.jsonl';

  process.stderr.write(`[sanitize-and-dedup] corpus=${corpusPath}\n`);

  const existingTitles = loadExistingTitles(corpusPath);
  process.stderr.write(`[sanitize-and-dedup] existing entries: ${existingTitles.size}\n`);

  const lines = [];
  const rl = createInterface({ input: process.stdin, crlfDelay: Infinity });
  for await (const line of rl) lines.push(line);

  const survivors = await runGate({ inputLines: lines, existingTitles });

  process.stderr.write(`[sanitize-and-dedup] ${survivors.length} rule(s) passed gate\n`);
  for (const rule of survivors) {
    process.stdout.write(JSON.stringify(rule) + '\n');
  }
}

const isMain = process.argv[1] === fileURLToPath(import.meta.url);
if (isMain) {
  main().catch(error => {
    process.stderr.write(`[sanitize-and-dedup] FATAL: ${error.message}\n`);
    process.exit(1);
  });
}

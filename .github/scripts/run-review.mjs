import Anthropic from '@anthropic-ai/sdk';
import { readFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { sanitizeForPrompt } from './sanitize.mjs';

export const MAX_ITERATIONS = 8;
const TIMEOUT_MS = 120_000;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function exec(command, args) {
  const result = spawnSync(command, args, { encoding: 'utf8', env: process.env });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(' ')} exited ${result.status}: ${result.stderr}`);
  }
  return result.stdout;
}

// ---------------------------------------------------------------------------
// Core logic — exported for unit tests
// ---------------------------------------------------------------------------

export function parseCorpus(content) {
  const results = [];
  for (const [index, line] of content.split('\n').entries()) {
    if (!line.trim()) continue;
    try {
      results.push(JSON.parse(line));
    } catch (error) {
      process.stderr.write(
        `[parseCorpus] WARNING: skipping malformed JSONL at line ${index + 1}: ${error.message}\n`,
      );
    }
  }
  return results;
}

export function buildSystemPrompt({ repoBanner, alwaysOnRules, priorReviews }) {
  const base = `You are a senior NestJS/TypeScript engineer reviewing a pull request for the
**${repoBanner}**.

## Your review tasks

1. **Post a PR summary** as a top-level comment:
   - What changed (1-3 sentences)
   - Risk level: 🟢 Low / 🟡 Medium / 🔴 High
   - Key concerns (bullet list, skip if none)

2. **Post inline comments** for:
   - Bugs or logic errors
   - Layer violations (business logic in resolvers, DB access in application layer, etc.)
   - Missing Zod validation on external inputs (GraphQL args, webhook payloads)
   - GraphQL N+1 queries that should use a Dataloader
   - Unsafe database migrations
   - Violations of the project conventions listed below

## Architecture

Clean architecture with 4 strict layers per domain module:
- \`domain/\` — entities (with \`static create()\` factory), value objects, domain errors
- \`application/\` — use cases (\`*.usecase.ts\`), one responsibility per file
- \`infrastructure/\` — TypeORM repositories, migrations, event publishers
- \`delivery/\` — GraphQL resolvers, HTTP controllers, Pub/Sub handlers (\`*.handler.ts\`)

**Key rule**: resolvers delegate to use cases; no business logic in resolvers.

## Project conventions

**File naming**
- kebab-case for all files: \`auth-token.usecase.ts\`, \`user-profile.resolver.ts\`
- Suffix conventions: \`*.usecase.ts\`, \`*.resolver.ts\`, \`*.handler.ts\`, \`*.entity.ts\`, \`*.repository.ts\`

**Entities**
- Must use \`static create()\` factory for instantiation
- Setter methods return new instances (immutable style)
- TypeORM decorators only in \`domain/\` entities

**GraphQL**
- Resolvers call use cases, nothing else
- N+1 field resolvers must use a \`@DataLoader\` class
- Input validation via Zod schemas before reaching use cases

**Events**
- Publishers live in \`infrastructure/publisher/\`
- Subscribers live in \`delivery/pubsub/*.handler.ts\`
- Use \`EventEmitter2\` for intra-module events

**Path aliases**
- \`@/*\` → \`apps/gateway/src/*\`
- \`@app/client\`, \`@app/logger\`, \`@app/guards\`, \`@app/media\`
- Domain aliases: \`@identity/*\`, \`@payment/*\`, \`@fashion/*\`, \`@wardrobe/*\`

**Style** (Prettier config)
- Single quotes, no trailing commas, 120-char line width

## Do not flag
- \`dist/\` — compiled output
- Generated GraphQL schema (\`schema.graphql\`, \`*.generated.ts\`)
- Migration files — reviewed separately
- \`node_modules/\`, \`package-lock.json\`
- \`any\` type — explicitly permitted by ESLint config

Be constructive. Suggest fixes where possible. If the PR looks good, say so.`;

  const rulesSection = alwaysOnRules.length === 0
    ? '_No always-on rules configured._'
    : alwaysOnRules.map(r =>
        `- **${r.rule_title}**\n` +
        `  Anti-pattern: \`${r.anti_pattern.split('\n')[0].slice(0, 100)}\`\n` +
        `  Correct: \`${r.correct_pattern.split('\n')[0].slice(0, 100)}\`\n` +
        `  Why: ${r.rationale}`,
      ).join('\n');

  const priorSection = priorReviews.length === 0
    ? '_No prior reviews on this PR._'
    : priorReviews
        .map(c => `=== Prior review (created_at: ${c.created_at}) ===\n${c.body}`)
        .join('\n\n');

  return [
    base,
    '\n## Always-on team rules (apply to every review)\n',
    rulesSection,
    '\n## Your previous reviews on this PR\n',
    priorSection,
    '\nAcknowledge what was fixed since prior reviews. Flag what is new since the last review.',
    'If you suspect any pattern not in always-on rules, call `search_corpus(query, tags?)`.',
  ].join('\n');
}

export function executeTool({ name, input, contextRules }) {
  if (name === 'search_corpus') {
    const { query = '', tags, top_n = 5 } = input;
    const queryLower = query.toLowerCase();
    const tagFilter = Array.isArray(tags) && tags.length > 0
      ? tags.map(t => t.toLowerCase())
      : null;

    const matches = contextRules.filter(rule => {
      const haystack = [rule.rule_title, ...(rule.tags ?? []), rule.anti_pattern, rule.rationale]
        .join(' ')
        .toLowerCase();
      if (!haystack.includes(queryLower)) return false;
      if (tagFilter) {
        const ruleTags = (rule.tags ?? []).map(t => t.toLowerCase());
        return tagFilter.some(t => ruleTags.includes(t));
      }
      return true;
    });

    return matches.slice(0, top_n).map(r => sanitizeForPrompt(r)).filter(Boolean);
  }

  if (name === 'get_rule') {
    const rule = contextRules.find(r => r.rule_title === input.rule_title) ?? null;
    return rule ? sanitizeForPrompt(rule) : null;
  }

  throw new Error(`Unknown tool: ${name}`);
}

const TOOLS = [
  {
    name: 'search_corpus',
    description:
      'Search context-priority corpus rules for patterns relevant to the diff. Returns up to top_n matching rules.',
    input_schema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Keywords describing the pattern or concern' },
        tags: { type: 'array', items: { type: 'string' }, description: 'Optional tag filter' },
        top_n: { type: 'integer', description: 'Max results (default 5)' },
      },
      required: ['query'],
    },
  },
  {
    name: 'get_rule',
    description: 'Fetch a specific corpus rule by its exact rule_title.',
    input_schema: {
      type: 'object',
      properties: {
        rule_title: { type: 'string', description: 'Exact rule_title to retrieve' },
      },
      required: ['rule_title'],
    },
  },
];

export async function runAgenticLoop({ anthropic, system, diff, contextRules, model, signal }) {
  const messages = [{ role: 'user', content: diff }];

  for (let iteration = 0; iteration < MAX_ITERATIONS; iteration++) {
    const response = await anthropic.messages.create(
      { model, max_tokens: 4096, system, tools: TOOLS, messages },
      { signal },
    );
    messages.push({ role: 'assistant', content: response.content });

    if (response.stop_reason === 'end_turn') {
      return response.content.find(c => c.type === 'text')?.text ?? '';
    }

    if (response.stop_reason === 'tool_use') {
      const toolUses = response.content.filter(c => c.type === 'tool_use');
      const results = toolUses.map(tu => ({
        type: 'tool_result',
        tool_use_id: tu.id,
        content: JSON.stringify(executeTool({ name: tu.name, input: tu.input, contextRules })),
      }));
      messages.push({ role: 'user', content: results });
      continue;
    }

    throw new Error(`Unexpected stop_reason: ${response.stop_reason}`);
  }

  throw new Error(`Agentic loop exceeded MAX_ITERATIONS (${MAX_ITERATIONS})`);
}

// ---------------------------------------------------------------------------
// Entry point (only when run directly)
// ---------------------------------------------------------------------------

async function main() {
  const { ANTHROPIC_API_KEY, GH_TOKEN, PR_NUMBER, REPO_BANNER, REVIEWER_MODEL, CORPUS_PATH } =
    process.env;

  for (const [key, val] of Object.entries({
    ANTHROPIC_API_KEY, GH_TOKEN, PR_NUMBER, REPO_BANNER, REVIEWER_MODEL, CORPUS_PATH,
  })) {
    if (!val) throw new Error(`Required env var ${key} is missing — refusing to run`);
  }

  const diff = exec('gh', ['pr', 'diff', PR_NUMBER]);

  const repoPath =
    process.env.GITHUB_REPOSITORY ??
    exec('gh', ['repo', 'view', '--json', 'nameWithOwner', '--jq', '.nameWithOwner']).trim();
  const commentsJson = exec('gh', ['api', `/repos/${repoPath}/issues/${PR_NUMBER}/comments`]);
  const priorReviews = JSON.parse(commentsJson)
    .filter(c => c.user.login === 'github-actions[bot]')
    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  process.stderr.write(`[run-review] prior bot comments: ${priorReviews.length}\n`);

  const corpusContent = await readFile(CORPUS_PATH, 'utf8');
  const allRules = parseCorpus(corpusContent);
  const alwaysOnRules = allRules
    .filter(r => r.priority === 'always')
    .map(r => sanitizeForPrompt(r))
    .filter(Boolean);
  const contextRules = allRules.filter(r => r.priority === 'context');
  process.stderr.write(
    `[run-review] always-on: ${alwaysOnRules.length}, context: ${contextRules.length}\n`,
  );

  const system = buildSystemPrompt({ repoBanner: REPO_BANNER, alwaysOnRules, priorReviews });

  const controller = new AbortController();
  const timeoutId = setTimeout(
    () => controller.abort(new Error('Hard 120s timeout exceeded')),
    TIMEOUT_MS,
  );

  try {
    const anthropic = new Anthropic({ apiKey: ANTHROPIC_API_KEY });
    const text = await runAgenticLoop({
      anthropic,
      system,
      diff,
      contextRules,
      model: REVIEWER_MODEL,
      signal: controller.signal,
    });
    process.stdout.write(text);
  } finally {
    clearTimeout(timeoutId);
  }
}

const isMain = process.argv[1] === fileURLToPath(import.meta.url);
if (isMain) {
  main().catch(error => {
    process.stderr.write(`[run-review] FATAL: ${error.message}\n`);
    process.exit(1);
  });
}

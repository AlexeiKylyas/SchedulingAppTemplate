import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  parseCorpus,
  buildSystemPrompt,
  executeTool,
  runAgenticLoop,
  MAX_ITERATIONS,
} from './run-review.mjs';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const BASE_RULE = {
  pr: null, repo: 'SchedulingAppTemplate', merged_at: null, reviewer: 'manual-seed',
  priority: 'context',
  rule_title: 'Use object args for 3+ parameters',
  anti_pattern: 'send(user, channel, retryCount)',
  correct_pattern: 'send({ user, channel, retryCount })',
  rationale: 'Positional args are fragile.',
  files_touched: ['**/*.ts'], tags: ['api-design'], source_comment_url: null,
};

function makeResponse({ stopReason, text, toolUses = [] }) {
  const content = [];
  if (text) content.push({ type: 'text', text });
  for (const tu of toolUses) content.push({ type: 'tool_use', ...tu });
  return { stop_reason: stopReason, content };
}

function mockAnthropic(responses) {
  let call = 0;
  return {
    messages: {
      create: async (_params, options) => {
        if (options?.signal?.aborted) {
          const error = new Error('This operation was aborted');
          error.name = 'AbortError';
          throw error;
        }
        if (call >= responses.length) throw new Error('Unexpected extra API call');
        return responses[call++];
      },
    },
  };
}

// ---------------------------------------------------------------------------
// parseCorpus
// ---------------------------------------------------------------------------

test('parseCorpus: parses valid JSONL into array of objects', () => {
  const jsonl = JSON.stringify(BASE_RULE) + '\n' + JSON.stringify({ ...BASE_RULE, rule_title: 'B' });
  const result = parseCorpus(jsonl);
  assert.strictEqual(result.length, 2);
  assert.strictEqual(result[0].rule_title, BASE_RULE.rule_title);
  assert.strictEqual(result[1].rule_title, 'B');
});

test('parseCorpus: skips blank lines', () => {
  const jsonl = '\n' + JSON.stringify(BASE_RULE) + '\n\n';
  assert.strictEqual(parseCorpus(jsonl).length, 1);
});

// ---------------------------------------------------------------------------
// buildSystemPrompt
// ---------------------------------------------------------------------------

test('buildSystemPrompt: includes repoBanner in system text', () => {
  const system = buildSystemPrompt({ repoBanner: 'TestApp', alwaysOnRules: [], priorReviews: [] });
  assert.ok(system.includes('TestApp'));
});

test('buildSystemPrompt: shows "no prior reviews" when empty', () => {
  const system = buildSystemPrompt({ repoBanner: 'X', alwaysOnRules: [], priorReviews: [] });
  assert.ok(system.includes('No prior reviews'));
});

test('buildSystemPrompt: includes prior review body and created_at', () => {
  const review = { created_at: '2026-05-07T12:00:00Z', body: 'Looks good!' };
  const system = buildSystemPrompt({ repoBanner: 'X', alwaysOnRules: [], priorReviews: [review] });
  assert.ok(system.includes('Looks good!'));
  assert.ok(system.includes('2026-05-07T12:00:00Z'));
});

// ---------------------------------------------------------------------------
// executeTool
// ---------------------------------------------------------------------------

test('executeTool: search_corpus returns matching rules', () => {
  const result = executeTool({
    name: 'search_corpus',
    input: { query: 'object args' },
    contextRules: [BASE_RULE],
  });
  assert.strictEqual(result.length, 1);
  assert.strictEqual(result[0].rule_title, BASE_RULE.rule_title);
});

test('executeTool: search_corpus returns empty for non-matching query', () => {
  const result = executeTool({
    name: 'search_corpus',
    input: { query: 'zzznomatch' },
    contextRules: [BASE_RULE],
  });
  assert.strictEqual(result.length, 0);
});

test('executeTool: get_rule returns rule by exact title', () => {
  const result = executeTool({
    name: 'get_rule',
    input: { rule_title: BASE_RULE.rule_title },
    contextRules: [BASE_RULE],
  });
  assert.ok(result !== null);
  assert.strictEqual(result.rule_title, BASE_RULE.rule_title);
});

test('executeTool: get_rule returns null for unknown title', () => {
  const result = executeTool({
    name: 'get_rule',
    input: { rule_title: 'does not exist' },
    contextRules: [BASE_RULE],
  });
  assert.strictEqual(result, null);
});

// ---------------------------------------------------------------------------
// runAgenticLoop — no-tool path
// ---------------------------------------------------------------------------

test('runAgenticLoop: no-tool path returns text on end_turn', async () => {
  const anthropic = mockAnthropic([
    makeResponse({ stopReason: 'end_turn', text: '## Review\nLooks great!' }),
  ]);
  const result = await runAgenticLoop({
    anthropic, system: 'sys', diff: 'diff', contextRules: [], model: 'test-model', signal: new AbortController().signal,
  });
  assert.strictEqual(result, '## Review\nLooks great!');
});

// ---------------------------------------------------------------------------
// runAgenticLoop — single tool_use then end_turn
// ---------------------------------------------------------------------------

test('runAgenticLoop: single-tool path calls tool then returns text', async () => {
  const anthropic = mockAnthropic([
    makeResponse({
      stopReason: 'tool_use',
      toolUses: [{ id: 'tu_1', name: 'search_corpus', input: { query: 'object args' } }],
    }),
    makeResponse({ stopReason: 'end_turn', text: 'Done after tool' }),
  ]);
  const result = await runAgenticLoop({
    anthropic, system: 'sys', diff: 'diff', contextRules: [BASE_RULE], model: 'test-model', signal: new AbortController().signal,
  });
  assert.strictEqual(result, 'Done after tool');
});

// ---------------------------------------------------------------------------
// runAgenticLoop — multiple tool_uses in one turn
// ---------------------------------------------------------------------------

test('runAgenticLoop: multi-tool path handles multiple tool_use blocks in one response', async () => {
  const anthropic = mockAnthropic([
    makeResponse({
      stopReason: 'tool_use',
      toolUses: [
        { id: 'tu_1', name: 'search_corpus', input: { query: 'object args' } },
        { id: 'tu_2', name: 'get_rule', input: { rule_title: BASE_RULE.rule_title } },
      ],
    }),
    makeResponse({ stopReason: 'end_turn', text: 'Multi-tool done' }),
  ]);
  const result = await runAgenticLoop({
    anthropic, system: 'sys', diff: 'diff', contextRules: [BASE_RULE], model: 'test-model', signal: new AbortController().signal,
  });
  assert.strictEqual(result, 'Multi-tool done');
});

// ---------------------------------------------------------------------------
// runAgenticLoop — max iteration exhaustion
// ---------------------------------------------------------------------------

test('runAgenticLoop: throws after MAX_ITERATIONS without end_turn', async () => {
  const neverEnds = makeResponse({
    stopReason: 'tool_use',
    toolUses: [{ id: 'tu_1', name: 'search_corpus', input: { query: 'x' } }],
  });
  const responses = Array(MAX_ITERATIONS).fill(neverEnds);
  const anthropic = mockAnthropic(responses);
  await assert.rejects(
    runAgenticLoop({
      anthropic, system: 'sys', diff: 'diff', contextRules: [], model: 'test-model', signal: new AbortController().signal,
    }),
    /exceeded MAX_ITERATIONS/,
  );
});

// ---------------------------------------------------------------------------
// runAgenticLoop — timeout (already-aborted signal)
// ---------------------------------------------------------------------------

test('runAgenticLoop: throws when signal is already aborted', async () => {
  const controller = new AbortController();
  controller.abort(new Error('Hard 120s timeout exceeded'));
  const anthropic = mockAnthropic([]);
  await assert.rejects(
    runAgenticLoop({
      anthropic, system: 'sys', diff: 'diff', contextRules: [], model: 'test-model', signal: controller.signal,
    }),
    /aborted|timeout/i,
  );
});

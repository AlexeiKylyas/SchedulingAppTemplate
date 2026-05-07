import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  parseCLIArgs,
  buildExtractionPrompt,
  validateRule,
  attachMetadata,
  extractRules,
} from './extract-review-rules.mjs';

const BASE_RULE = {
  rule_title: 'Use object args for 3+ parameters',
  anti_pattern: 'send(user, channel, retryCount)',
  correct_pattern: 'send({ user, channel, retryCount })',
  rationale: 'Positional args are fragile.',
  tags: ['api-design'],
  files_touched: ['**/*.ts'],
};

// ---------------------------------------------------------------------------
// parseCLIArgs
// ---------------------------------------------------------------------------

test('parseCLIArgs: parses --pr 42', () => {
  const result = parseCLIArgs(['node', 'script.mjs', '--pr', '42']);
  assert.strictEqual(result.prNumber, 42);
});

test('parseCLIArgs: throws on missing --pr flag', () => {
  assert.throws(() => parseCLIArgs(['node', 'script.mjs']), /Missing required flag/);
});

test('parseCLIArgs: throws on non-numeric PR number', () => {
  assert.throws(() => parseCLIArgs(['node', 'script.mjs', '--pr', 'abc']), /Invalid PR number/);
});

// ---------------------------------------------------------------------------
// buildExtractionPrompt
// ---------------------------------------------------------------------------

test('buildExtractionPrompt: includes diff content', () => {
  const prompt = buildExtractionPrompt({
    diff: 'diff --git a/foo.ts b/foo.ts\n+const x = 1;',
    comments: [],
    reviews: [],
  });
  assert.ok(prompt.includes('foo.ts'));
  assert.ok(prompt.includes('const x = 1'));
});

test('buildExtractionPrompt: shows no-comments placeholder when empty', () => {
  const prompt = buildExtractionPrompt({ diff: '', comments: [], reviews: [] });
  assert.ok(prompt.includes('_No review comments._'));
});

test('buildExtractionPrompt: includes comment body and author', () => {
  const prompt = buildExtractionPrompt({
    diff: '',
    comments: [{ user: { login: 'alice' }, body: 'Use object args here', path: 'foo.ts', line: 10, html_url: 'https://example.com' }],
    reviews: [],
  });
  assert.ok(prompt.includes('alice'));
  assert.ok(prompt.includes('Use object args here'));
});

// ---------------------------------------------------------------------------
// validateRule
// ---------------------------------------------------------------------------

test('validateRule: accepts a complete valid rule', () => {
  assert.doesNotThrow(() => validateRule(BASE_RULE));
});

test('validateRule: throws on missing field', () => {
  const { rule_title: _, ...incomplete } = BASE_RULE;
  assert.throws(() => validateRule(incomplete), /missing required field/);
});

test('validateRule: throws on empty rule_title', () => {
  assert.throws(() => validateRule({ ...BASE_RULE, rule_title: '' }), /rule_title/);
});

// ---------------------------------------------------------------------------
// attachMetadata
// ---------------------------------------------------------------------------

test('attachMetadata: attaches pr, repo, merged_at fields', () => {
  const result = attachMetadata({
    rule: BASE_RULE,
    prNumber: 7,
    repo: 'TestRepo',
    mergedAt: '2026-05-07T10:00:00Z',
    comments: [],
  });
  assert.strictEqual(result.pr, 7);
  assert.strictEqual(result.repo, 'TestRepo');
  assert.strictEqual(result.merged_at, '2026-05-07T10:00:00Z');
  assert.strictEqual(result.priority, 'context');
  assert.strictEqual(result.source_comment_url, null);
  assert.strictEqual(result.reviewer, 'extracted');
});

test('attachMetadata: picks up matching comment URL', () => {
  const result = attachMetadata({
    rule: BASE_RULE,
    prNumber: 7,
    repo: 'TestRepo',
    mergedAt: null,
    comments: [
      { user: { login: 'alice' }, body: 'Use object args for 3+ params please', html_url: 'https://github.com/c/1' },
    ],
  });
  assert.strictEqual(result.reviewer, 'extracted');
});

// ---------------------------------------------------------------------------
// extractRules — mocked Anthropic
// ---------------------------------------------------------------------------

function mockAnthropic(responseText) {
  return {
    messages: {
      create: async (_params, options) => {
        if (options?.signal?.aborted) {
          const error = new Error('Aborted');
          error.name = 'AbortError';
          throw error;
        }
        return { content: [{ type: 'text', text: responseText }] };
      },
    },
  };
}

test('extractRules: returns empty array when rules is []', async () => {
  const anthropic = mockAnthropic(JSON.stringify({ rules: [] }));
  const result = await extractRules({
    anthropic,
    prompt: 'test',
    model: 'test-model',
    signal: new AbortController().signal,
  });
  assert.strictEqual(result.length, 0);
});

test('extractRules: returns parsed rules on valid response', async () => {
  const anthropic = mockAnthropic(JSON.stringify({ rules: [BASE_RULE] }));
  const result = await extractRules({
    anthropic,
    prompt: 'test',
    model: 'test-model',
    signal: new AbortController().signal,
  });
  assert.strictEqual(result.length, 1);
  assert.strictEqual(result[0].rule_title, BASE_RULE.rule_title);
});

test('extractRules: throws on non-JSON response', async () => {
  const anthropic = mockAnthropic('Sorry, I cannot help with that.');
  await assert.rejects(
    extractRules({ anthropic, prompt: 'test', model: 'test-model', signal: new AbortController().signal }),
    /not valid JSON/,
  );
});

test('extractRules: throws on missing rules array', async () => {
  const anthropic = mockAnthropic(JSON.stringify({ something: 'else' }));
  await assert.rejects(
    extractRules({ anthropic, prompt: 'test', model: 'test-model', signal: new AbortController().signal }),
    /missing "rules" array/,
  );
});

test('extractRules: caps at MAX_RULES (3)', async () => {
  const fourRules = [BASE_RULE, BASE_RULE, BASE_RULE, { ...BASE_RULE, rule_title: 'Extra rule' }];
  const anthropic = mockAnthropic(JSON.stringify({ rules: fourRules }));
  const result = await extractRules({
    anthropic,
    prompt: 'test',
    model: 'test-model',
    signal: new AbortController().signal,
  });
  assert.strictEqual(result.length, 3);
});

test('extractRules: throws when signal already aborted', async () => {
  const controller = new AbortController();
  controller.abort(new Error('timeout'));
  const anthropic = mockAnthropic('{}');
  await assert.rejects(
    extractRules({ anthropic, prompt: 'test', model: 'test-model', signal: controller.signal }),
    /aborted|timeout/i,
  );
});

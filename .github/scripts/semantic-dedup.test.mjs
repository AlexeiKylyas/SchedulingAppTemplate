import { test } from 'node:test';
import assert from 'node:assert/strict';
import { checkSemanticDuplicate } from './semantic-dedup.mjs';

const CANDIDATE = {
  rule_title: 'Wrap resolver logic in a use case',
  rationale: 'Keeps resolvers thin and testable.',
  anti_pattern: 'resolver calls repository directly',
};

const EXISTING_TITLES = [
  'Resolvers must delegate to use cases, never call repositories or domain services directly',
  'Validate all external string inputs at the resolver boundary with Zod',
];

function mockAnthropic(responseText) {
  return {
    messages: {
      create: async () => ({
        content: [{ type: 'text', text: responseText }],
      }),
    },
  };
}

function mockAnthropicThrows(error) {
  return {
    messages: {
      create: async () => { throw error; },
    },
  };
}

function captureStderr(fn) {
  let output = '';
  const original = process.stderr.write.bind(process.stderr);
  process.stderr.write = (chunk) => { output += String(chunk); return true; };
  return fn().finally(() => { process.stderr.write = original; }).then(result => ({ result, output }));
}

// ---------------------------------------------------------------------------
// Test 1: empty corpus → skips API, returns is_duplicate=false
// ---------------------------------------------------------------------------

test('checkSemanticDuplicate: empty corpus skips API and returns is_duplicate=false', async () => {
  let called = false;
  const anthropic = {
    messages: {
      create: async () => { called = true; return {}; },
    },
  };

  const result = await checkSemanticDuplicate({
    candidate: CANDIDATE,
    existingTitles: [],
    anthropic,
    model: 'test-model',
  });

  assert.strictEqual(called, false, 'messages.create must not be called for empty corpus');
  assert.strictEqual(result.is_duplicate, false);
  assert.strictEqual(result.duplicate_of, null);
  assert.strictEqual(result.reason, 'empty corpus');
});

// ---------------------------------------------------------------------------
// Test 2: is_duplicate=true path passes through
// ---------------------------------------------------------------------------

test('checkSemanticDuplicate: is_duplicate=true returned from API passes through', async () => {
  const duplicateTitle = EXISTING_TITLES[0];
  const anthropic = mockAnthropic(JSON.stringify({
    is_duplicate: true,
    duplicate_of: duplicateTitle,
    reason: 'Same directive about resolver delegation.',
  }));

  const result = await checkSemanticDuplicate({
    candidate: CANDIDATE,
    existingTitles: EXISTING_TITLES,
    anthropic,
    model: 'test-model',
  });

  assert.strictEqual(result.is_duplicate, true);
  assert.strictEqual(result.duplicate_of, duplicateTitle);
  assert.ok(typeof result.reason === 'string' && result.reason.length > 0);
});

// ---------------------------------------------------------------------------
// Test 3: is_duplicate=false path passes through
// ---------------------------------------------------------------------------

test('checkSemanticDuplicate: is_duplicate=false returned from API passes through', async () => {
  const anthropic = mockAnthropic(JSON.stringify({
    is_duplicate: false,
    duplicate_of: null,
    reason: 'Different topic — no match found.',
  }));

  const result = await checkSemanticDuplicate({
    candidate: CANDIDATE,
    existingTitles: EXISTING_TITLES,
    anthropic,
    model: 'test-model',
  });

  assert.strictEqual(result.is_duplicate, false);
  assert.strictEqual(result.duplicate_of, null);
  assert.ok(result.reason.length > 0);
});

// ---------------------------------------------------------------------------
// Test 4: API throws → fail-open + stderr warning
// ---------------------------------------------------------------------------

test('checkSemanticDuplicate: API throws → fail-open, reason starts with "fail-open:", stderr warning emitted', async () => {
  const anthropic = mockAnthropicThrows(new Error('network timeout'));

  const { result, output } = await captureStderr(() =>
    checkSemanticDuplicate({
      candidate: CANDIDATE,
      existingTitles: EXISTING_TITLES,
      anthropic,
      model: 'test-model',
    }),
  );

  assert.strictEqual(result.is_duplicate, false);
  assert.strictEqual(result.duplicate_of, null);
  assert.ok(result.reason.startsWith('fail-open:'), `reason should start with "fail-open:", got: ${result.reason}`);
  assert.ok(output.includes('[semantic-dedup] WARNING'), 'stderr should contain WARNING marker');
});

// ---------------------------------------------------------------------------
// Test 5: malformed JSON response → fail-open
// ---------------------------------------------------------------------------

test('checkSemanticDuplicate: malformed JSON response → fail-open', async () => {
  const anthropic = mockAnthropic('{ not valid json !!');

  const { result, output } = await captureStderr(() =>
    checkSemanticDuplicate({
      candidate: CANDIDATE,
      existingTitles: EXISTING_TITLES,
      anthropic,
      model: 'test-model',
    }),
  );

  assert.strictEqual(result.is_duplicate, false);
  assert.ok(result.reason.startsWith('fail-open:'));
  assert.ok(output.includes('[semantic-dedup] WARNING'));
});

// ---------------------------------------------------------------------------
// Test 6: valid JSON but duplicate_of not in existingTitles → fail-open
// ---------------------------------------------------------------------------

test('checkSemanticDuplicate: duplicate_of not in existingTitles → fail-open', async () => {
  const anthropic = mockAnthropic(JSON.stringify({
    is_duplicate: true,
    duplicate_of: 'Some hallucinated rule title not in corpus',
    reason: 'Close match.',
  }));

  const { result, output } = await captureStderr(() =>
    checkSemanticDuplicate({
      candidate: CANDIDATE,
      existingTitles: EXISTING_TITLES,
      anthropic,
      model: 'test-model',
    }),
  );

  assert.strictEqual(result.is_duplicate, false);
  assert.ok(result.reason.startsWith('fail-open:'));
  assert.ok(output.includes('[semantic-dedup] WARNING'));
});

// ---------------------------------------------------------------------------
// Test 7: AbortSignal fires → fail-open (AbortError treated as error, not duplicate)
// ---------------------------------------------------------------------------

test('checkSemanticDuplicate: AbortError from signal → fail-open', async () => {
  const abortError = new DOMException('The operation was aborted', 'AbortError');
  const anthropic = mockAnthropicThrows(abortError);

  const controller = new AbortController();
  controller.abort();

  const { result, output } = await captureStderr(() =>
    checkSemanticDuplicate({
      candidate: CANDIDATE,
      existingTitles: EXISTING_TITLES,
      anthropic,
      model: 'test-model',
      signal: controller.signal,
    }),
  );

  assert.strictEqual(result.is_duplicate, false);
  assert.strictEqual(result.duplicate_of, null);
  assert.ok(result.reason.startsWith('fail-open:'));
  assert.ok(output.includes('[semantic-dedup] WARNING'));
});

/**
 * Layer 3 semantic dedup: asks Sonnet 4.6 whether a candidate rule is a paraphrase
 * of any existing corpus rule. Fail-open on any error so no rule is silently lost.
 */

export async function checkSemanticDuplicate({
  candidate,
  existingTitles,
  anthropic,
  model = 'claude-sonnet-4-6',
  signal,
}) {
  if (existingTitles.length === 0) {
    return { is_duplicate: false, duplicate_of: null, reason: 'empty corpus' };
  }

  const numberedTitles = existingTitles
    .map((title, index) => `${index + 1}. ${title}`)
    .join('\n');

  const prompt =
    `You are auditing a candidate code-review rule against existing rules in our team corpus.\n` +
    `Determine if the candidate is semantically equivalent (same rule, different wording) to any existing rule.\n` +
    `Identical wording is also a duplicate. Subset/superset rules are duplicates if the core directive matches.\n` +
    `\n` +
    `CANDIDATE:\n` +
    `Title: ${candidate.rule_title}\n` +
    `Rationale: ${candidate.rationale ?? ''}\n` +
    `Anti-pattern (first 200 chars): ${candidate.anti_pattern?.slice(0, 200) ?? ''}\n` +
    `\n` +
    `EXISTING RULES:\n` +
    `${numberedTitles}\n` +
    `\n` +
    `Return JSON only — no prose, no markdown fences:\n` +
    `{ "is_duplicate": boolean, "duplicate_of": string|null, "reason": string }\n` +
    `\n` +
    `If is_duplicate is true, duplicate_of MUST be one of the existing titles verbatim.`;

  try {
    const response = await anthropic.messages.create(
      {
        model,
        max_tokens: 200,
        messages: [{ role: 'user', content: prompt }],
      },
      { signal },
    );

    const raw = response.content.find(c => c.type === 'text')?.text ?? '';
    // Strip markdown code fences the model sometimes wraps around the JSON response (mirrors extractRules)
    const text = raw.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');

    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      throw new Error(`response is not valid JSON: ${raw.slice(0, 200)}`);
    }

    if (typeof parsed.is_duplicate !== 'boolean') {
      throw new Error(`is_duplicate must be boolean, got ${JSON.stringify(parsed.is_duplicate)}`);
    }
    if (typeof parsed.reason !== 'string') {
      throw new Error(`reason must be string, got ${JSON.stringify(parsed.reason)}`);
    }
    if (parsed.duplicate_of != null && !existingTitles.includes(parsed.duplicate_of)) {
      throw new Error(`duplicate_of "${parsed.duplicate_of}" is not in existingTitles`);
    }

    return {
      is_duplicate: parsed.is_duplicate,
      duplicate_of: parsed.duplicate_of ?? null,
      reason: parsed.reason,
    };
  } catch (error) {
    process.stderr.write(
      `[semantic-dedup] WARNING: fail-open, ${error.message} — letting rule through\n`,
    );
    return { is_duplicate: false, duplicate_of: null, reason: 'fail-open: ' + error.message };
  }
}

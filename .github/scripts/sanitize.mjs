const FIELD_MAX = 600;

/** @type {Array<[RegExp, string]>} */
export const dangerousPatterns = [
  [/[\x00-\x08\x0E-\x1F]/, 'control-characters'],
  [/<script/i, 'html-script'],
  [/<iframe/i, 'html-iframe'],
  [/<object/i, 'html-object'],
  [/ignore previous/i, 'prompt-injection:ignore-previous'],
  [/system:/i, 'prompt-injection:system-colon'],
  [/\[INST\]/i, 'prompt-injection:inst'],
  [/<\/s>/i, 'prompt-injection:end-s'],
  [/<\/system>/i, 'prompt-injection:end-system'],
  [/\n\nHuman:/i, 'prompt-injection:human-turn'],
  [/\n\nAssistant:/i, 'prompt-injection:assistant-turn'],
];

function dangerLabel(value) {
  for (const [pattern, label] of dangerousPatterns) {
    if (pattern.test(value)) return label;
  }
  return null;
}

function applyTransforms(value) {
  let result = value.replace(/\$\{\{/g, '$\\{\\{');
  result = result.replace(/`{3,}/g, "'");
  result = result.split('\n').filter(line => !/^#/.test(line)).join('\n');
  if (result.length > FIELD_MAX) result = result.slice(0, FIELD_MAX) + '…';
  return result;
}

const STRING_FIELDS = ['rule_title', 'anti_pattern', 'correct_pattern', 'rationale'];

/**
 * Returns a sanitized copy of rule, or null if any field matches a dangerous pattern.
 * Writes a warning to stderr on rejection.
 * @param {object} rule
 * @returns {object|null}
 */
export function sanitizeForPrompt(rule) {
  const tags = Array.isArray(rule.tags) ? rule.tags.filter(t => typeof t === 'string') : [];

  for (const field of STRING_FIELDS) {
    if (typeof rule[field] !== 'string') continue;
    const label = dangerLabel(rule[field]);
    if (label) {
      process.stderr.write(
        `[sanitize] REJECTED field="${field}" pattern="${label}" rule="${String(rule.rule_title ?? '').slice(0, 60)}"\n`,
      );
      return null;
    }
  }
  for (const tag of tags) {
    const label = dangerLabel(tag);
    if (label) {
      process.stderr.write(
        `[sanitize] REJECTED tag="${tag}" pattern="${label}" rule="${String(rule.rule_title ?? '').slice(0, 60)}"\n`,
      );
      return null;
    }
  }

  const sanitized = { ...rule };
  for (const field of STRING_FIELDS) {
    if (typeof rule[field] === 'string') sanitized[field] = applyTransforms(rule[field]);
  }
  if (Array.isArray(rule.tags)) {
    sanitized.tags = rule.tags.map(tag => (typeof tag === 'string' ? applyTransforms(tag) : tag));
  }
  return sanitized;
}

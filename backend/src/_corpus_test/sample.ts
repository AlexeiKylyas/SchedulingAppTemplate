// CORPUS PILOT — synthetic anti-pattern fixtures for PR validation
// This file is excluded from backend/tsconfig.json compilation.
// DO NOT import or use in production code.

// ─── Pattern 1 (silent-fallback, always-on) ──────────────────────────────────
// Rule: "Fail loud on invalid values — replace ?? fallback with allowlist + throw"
// Anti-pattern: silent ?? fallback on a required env value

const channel = process.env.NOTIFICATION_CHANNEL ?? 'main';
console.log('Sending to', channel);

// ─── Pattern 5 (3+ args, always-on) ──────────────────────────────────────────
// Rule: "Use object args for 3+ parameters — never positional lists"
// Anti-pattern: function with 4 positional parameters

interface User {
  id: string;
  name: string;
}

function send(user: User, target: string, retryCount: number, force: boolean): void {
  console.log(user, target, retryCount, force);
}

// ─── Pattern 6 (single-fallback-layer, always-on) ────────────────────────────
// Rule: "One fallback layer only — avoid default params masking a downstream ?? chain"
// Anti-pattern: default parameter + downstream ?? creates two fallback sources

function resolveEnv(env: string = 'production'): string {
  return (process.env as Record<string, string>)[env] ?? 'fallback-value';
}

export { send, resolveEnv };

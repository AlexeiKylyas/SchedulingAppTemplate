// CORPUS PILOT — synthetic anti-pattern fixtures for PR validation
// This file is excluded from backend/tsconfig.json compilation.
// DO NOT import or use in production code.

// ─── Pattern 1 (FIXED) ───────────────────────────────────────────────────────
// Rule: "Fail loud on invalid values — replace ?? fallback with allowlist + throw"
// Fix: explicit allowlist + throw replaces silent ?? fallback

const ALLOWED_CHANNELS = ['main', 'alerts', 'deploys'] as const;
type Channel = typeof ALLOWED_CHANNELS[number];

const rawChannel = process.env.NOTIFICATION_CHANNEL;
if (!rawChannel || !(ALLOWED_CHANNELS as readonly string[]).includes(rawChannel)) {
  throw new Error(
    `Invalid or missing NOTIFICATION_CHANNEL: "${rawChannel}". Must be one of: ${ALLOWED_CHANNELS.join(', ')}.`,
  );
}
const channel = rawChannel as Channel;
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

// ─── Test 3: breaking API change (triggers context-priority agentic search) ───
// Rule (context-priority): "Document breaking API changes in CHANGELOG"
// A previously optional `limit` param is now required — breaking change, no CHANGELOG entry

interface Appointment {
  id: string;
  date: string;
}

// BREAKING CHANGE: `limit` was previously optional; now required without CHANGELOG update
export async function getAppointments(userId: string, limit: number): Promise<Appointment[]> {
  return [];
}

export { send, resolveEnv };

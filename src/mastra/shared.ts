// Current date/time for the system prompt. Resolved on each generate/stream
// so the value is always fresh (no stale hardcoded date).
const AGENT_TIMEZONE = process.env.AGENT_TIMEZONE;

export function currentDateParts(): {
  iso: string;
  year: string;
  readable: string;
} {
  const now = new Date();
  const iso = now.toISOString().split("T")[0];
  const year = String(now.getUTCFullYear());
  const readable = new Intl.DateTimeFormat("en-US", {
    ...(AGENT_TIMEZONE ? { timeZone: AGENT_TIMEZONE } : {}),
    dateStyle: "full",
    timeStyle: "long",
  }).format(now);
  return { iso, year, readable };
}

// Model defaults. Uses OpenRouter (OPENROUTER_API_KEY) so you can pick from
// hundreds of models including free tiers. Change via AGENT_MODEL env var.
// Good free options:
//   openrouter/google/gemini-2.5-flash
//   openrouter/meta-llama/llama-3.3-70b-instruct:free
//   openrouter/qwen/qwen3-coder:free
//   openrouter/openai/gpt-oss-120b:free
export const AGENT_MODEL =
  process.env.AGENT_MODEL ?? "openrouter/google/gemini-2.5-flash";

export function getDefaultMaxSteps(
  envVar: string,
  fallback: number,
): number {
  return Number(process.env[envVar]) || fallback;
}

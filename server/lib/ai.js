/**
 * AI helper — 3-model cascade fallback
 *
 * Priority order:
 *   1. Groq  — Llama 3.3 70B         (fast + smart, 14,400 req/day free)
 *   2. Groq  — DeepSeek R1 70B       (reasoning model, separate quota, 14,400/day)
 *   3. Cloudflare — Llama 3.1 8B     (100% free, no daily cap, different provider)
 *
 * If a model returns 429 (rate limit) or 503 (service down), the next one
 * is tried automatically — transparent to the user.
 *
 * Rate limit resets:
 *   Per-minute → every 60 seconds
 *   Per-day    → midnight UTC  (5:00 AM Pakistan time)
 *   Cloudflare → no daily cap (10,000 "neurons"/day, effectively unlimited)
 *
 * Env vars required:
 *   GROQ_API_KEY          — from console.groq.com (covers models 1 & 2)
 *   CLOUDFLARE_ACCOUNT_ID — from dash.cloudflare.com (right sidebar)
 *   CLOUDFLARE_API_TOKEN  — Workers AI token from dash.cloudflare.com/profile/api-tokens
 */

const { OpenAI } = require("openai");

// ── Groq client (models 1 & 2 — same key, separate quotas) ────────────────
const groq = process.env.GROQ_API_KEY
  ? new OpenAI({
      apiKey:  process.env.GROQ_API_KEY,
      baseURL: "https://api.groq.com/openai/v1",
    })
  : null;

// ── Cloudflare Workers AI client (model 3) ─────────────────────────────────
const cfClient = (process.env.CLOUDFLARE_ACCOUNT_ID && process.env.CLOUDFLARE_API_TOKEN)
  ? new OpenAI({
      apiKey:  process.env.CLOUDFLARE_API_TOKEN,
      baseURL: `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/ai/v1`,
    })
  : null;

// ── Model identifiers ──────────────────────────────────────────────────────
const MODEL_1 = "llama-3.3-70b-versatile";         // Groq — Llama 3.3 70B
const MODEL_2 = "deepseek-r1-distill-llama-70b";   // Groq — DeepSeek R1 70B
const MODEL_3 = "@cf/meta/llama-3.1-8b-instruct";  // Cloudflare — Llama 3.1 8B

// ── Rate-limit / service-down detector ────────────────────────────────────
function isSoftError(err) {
  const status = err?.status || err?.statusCode;
  const msg    = (err?.message || "").toLowerCase();
  return (
    status === 429 ||
    status === 503 ||
    status === 529 ||
    msg.includes("rate limit") ||
    msg.includes("quota") ||
    msg.includes("overloaded") ||
    msg.includes("unavailable") ||
    msg.includes("try again")
  );
}

// ── Shared chat call (OpenAI-compatible) ───────────────────────────────────
async function callModel(client, model, messages) {
  const res = await client.chat.completions.create({
    model,
    messages,
    max_tokens: 1024,
    temperature: 0.7,
  });
  return res.choices[0].message.content;
}

// ── Build message array ────────────────────────────────────────────────────
function buildMessages(prompt, history, system) {
  const msgs = [];
  if (system) msgs.push({ role: "system", content: system });
  if (history && Array.isArray(history)) {
    msgs.push(...history.map(m => ({
      role: m.role === "model" ? "assistant" : m.role,
      content: m.content,
    })));
  }
  msgs.push({ role: "user", content: prompt });
  return msgs;
}

// ── Public API ─────────────────────────────────────────────────────────────

/**
 * Single prompt — cascade through all 3 models.
 * @param {string} prompt
 * @returns {Promise<string>}
 */
async function aiComplete(prompt) {
  return aiChat(prompt, [], null);
}

/**
 * Multi-turn chat — cascade through all 3 models.
 * @param {string} message
 * @param {Array}  history  [{role, content}]
 * @param {string} [system] system instruction
 * @returns {Promise<string>}
 */
async function aiChat(message, history, system) {
  if (!message) throw new Error("message is required");

  const msgs = buildMessages(message, history, system);

  // 1️⃣  Groq — Llama 3.3 70B
  if (groq) {
    try {
      const text = await callModel(groq, MODEL_1, msgs);
      return text;
    } catch (err) {
      if (isSoftError(err)) {
        console.warn(`[AI] Llama 3.3 70B → ${err.status || err.message} — trying DeepSeek R1`);
      } else {
        throw err;
      }
    }
  }

  // 2️⃣  Groq — DeepSeek R1 70B  (separate daily quota)
  if (groq) {
    try {
      const text = await callModel(groq, MODEL_2, msgs);
      return text;
    } catch (err) {
      if (isSoftError(err)) {
        console.warn(`[AI] DeepSeek R1 → ${err.status || err.message} — trying Cloudflare`);
      } else {
        throw err;
      }
    }
  }

  // 3️⃣  Cloudflare Workers AI — Llama 3.1 8B  (no daily cap)
  if (cfClient) {
    try {
      const text = await callModel(cfClient, MODEL_3, msgs);
      return text;
    } catch (err) {
      if (isSoftError(err)) {
        console.warn(`[AI] Cloudflare → ${err.status || err.message} — all providers exhausted`);
      } else {
        throw err;
      }
    }
  }

  throw new Error(
    "All AI providers are currently unavailable. " +
    "Groq limits reset every minute and at 5:00 AM PKT. Please try again shortly."
  );
}

module.exports = { aiComplete, aiChat };

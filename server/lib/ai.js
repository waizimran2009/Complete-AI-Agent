/**
 * AI helper — 3-model cascade fallback
 *
 * Priority order:
 *   1. Groq  — Llama 3.3 70B         (fast + smart, 14,400 req/day free)
 *   2. Groq  — DeepSeek R1 70B       (reasoning model, separate quota)
 *   3. Cloudflare — Llama 3.1 8B     (100% free, no daily cap)
 *
 * If a model returns 429 / times out, the next one is tried automatically.
 *
 * Env vars required:
 *   GROQ_API_KEY          — from console.groq.com
 *   CLOUDFLARE_ACCOUNT_ID — from dash.cloudflare.com (right sidebar)
 *   CLOUDFLARE_API_TOKEN  — Workers AI token
 */

const { OpenAI } = require("openai");

// ── Groq client (models 1 & 2) ─────────────────────────────────────────────
const groq = process.env.GROQ_API_KEY
  ? new OpenAI({
      apiKey:     process.env.GROQ_API_KEY,
      baseURL:    "https://api.groq.com/openai/v1",
      maxRetries: 0,
    })
  : null;

// ── Cloudflare Workers AI client (model 3) ─────────────────────────────────
const cfClient = (process.env.CLOUDFLARE_ACCOUNT_ID && process.env.CLOUDFLARE_API_TOKEN)
  ? new OpenAI({
      apiKey:     process.env.CLOUDFLARE_API_TOKEN,
      baseURL:    `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/ai/v1`,
      maxRetries: 0,
    })
  : null;

// ── Model identifiers ──────────────────────────────────────────────────────
const MODEL_1 = "llama-3.3-70b-versatile";         // Groq — Llama 3.3 70B
const MODEL_2 = "deepseek-r1-distill-llama-70b";   // Groq — DeepSeek R1 70B
const MODEL_3 = "@cf/meta/llama-3.1-8b-instruct";  // Cloudflare — Llama 3.1 8B

// ── Rate-limit / service-down detector ────────────────────────────────────
function isSoftError(err) {
  const status = err?.status || err?.statusCode;
  if (status && status < 500 && status !== 429) return false;
  const msg  = (err?.message || "").toLowerCase();
  const name = (err?.name    || "").toLowerCase();
  return (
    status === 429 ||
    status === 503 ||
    status === 529 ||
    msg.includes("rate limit") ||
    msg.includes("quota") ||
    msg.includes("overloaded") ||
    msg.includes("unavailable") ||
    msg.includes("try again") ||
    msg.includes("timeout") ||
    msg.includes("timed out") ||
    msg.includes("econnreset") ||
    msg.includes("econnrefused") ||
    msg.includes("enotfound") ||
    msg.includes("network") ||
    name.includes("timeout") ||
    err?.code === "ETIMEDOUT" ||
    err?.code === "ECONNRESET"
  );
}

// ── Shared chat call — Promise.race guarantees the timeout always fires ────
const GROQ_TIMEOUT_MS = 5000;   // Groq is fast — 5 s is plenty
const CF_TIMEOUT_MS   = 12000;  // Cloudflare cold-starts can take 8-10 s

async function callModel(client, model, messages, timeoutMs) {
  const timer = new Promise((_, reject) =>
    setTimeout(() => reject(Object.assign(new Error("Model timeout"), { code: "ETIMEDOUT" })), timeoutMs)
  );
  const call = client.chat.completions.create({
    model,
    messages,
    max_tokens: 1024,
    temperature: 0.7,
  });
  const res = await Promise.race([call, timer]);
  const content = res.choices?.[0]?.message?.content;
  if (!content) throw Object.assign(new Error("Empty response from model"), { status: 503 });
  return content;
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

async function aiComplete(prompt) {
  return aiChat(prompt, [], null);
}

async function aiChat(message, history, system) {
  if (!message) throw new Error("message is required");

  const msgs = buildMessages(message, history, system);

  // Track whether Groq itself is broken (auth/forbidden) so we skip MODEL_2
  // immediately instead of wasting another 5 s on the same bad key.
  let groqBroken = false;

  // 1️⃣  Groq — Llama 3.3 70B
  if (groq) {
    try {
      return await callModel(groq, MODEL_1, msgs, GROQ_TIMEOUT_MS);
    } catch (err) {
      const s = err?.status || err?.statusCode;
      groqBroken = (s === 401 || s === 403 || s === 400);
      console.warn(`[AI] Llama 3.3 → ${s || err.message} — trying next`);
    }
  }

  // 2️⃣  Groq — DeepSeek R1 70B (skip if Groq auth is broken)
  if (groq && !groqBroken) {
    try {
      return await callModel(groq, MODEL_2, msgs, GROQ_TIMEOUT_MS);
    } catch (err) {
      console.warn(`[AI] DeepSeek → ${err?.status || err.message} — trying Cloudflare`);
    }
  }

  // 3️⃣  Cloudflare Workers AI — Llama 3.1 8B (longer timeout for cold starts)
  if (cfClient) {
    try {
      return await callModel(cfClient, MODEL_3, msgs, CF_TIMEOUT_MS);
    } catch (err) {
      console.warn(`[AI] Cloudflare → ${err?.status || err.message} — all providers exhausted`);
    }
  }

  throw new Error(
    "All AI providers are currently unavailable. Groq limits reset at 5:00 AM PKT. Please try again shortly."
  );
}

module.exports = { aiComplete, aiChat };

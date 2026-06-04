/**
 * AI helper — 4-model cascade fallback
 *
 * Priority order:
 *   1. Gemini — gemini-2.0-flash        (primary, fast + generous free tier)
 *   2. Groq   — Llama 3.3 70B           (fallback, 14,400 req/day free)
 *   3. Groq   — DeepSeek R1 70B         (fallback, separate quota)
 *   4. Cloudflare — Llama 3.1 8B        (last resort, no daily cap)
 *
 * If a model returns 429 (rate limit) or times out, the next one is tried.
 *
 * Env vars required:
 *   GEMINI_API_KEY        — from aistudio.google.com (primary AI)
 *   GROQ_API_KEY          — from console.groq.com (fallback)
 *   CLOUDFLARE_ACCOUNT_ID — from dash.cloudflare.com (last resort)
 *   CLOUDFLARE_API_TOKEN  — Workers AI token
 */

const { OpenAI } = require("openai");

// ── Gemini client (model 1 — primary) ─────────────────────────────────────
const gemini = process.env.GEMINI_API_KEY
  ? new OpenAI({
      apiKey:     process.env.GEMINI_API_KEY,
      baseURL:    "https://generativelanguage.googleapis.com/v1beta/openai/",
      maxRetries: 0,
    })
  : null;

// ── Groq client (models 2 & 3 — same key, separate quotas) ────────────────
const groq = process.env.GROQ_API_KEY
  ? new OpenAI({
      apiKey:     process.env.GROQ_API_KEY,
      baseURL:    "https://api.groq.com/openai/v1",
      maxRetries: 0,
    })
  : null;

// ── Cloudflare Workers AI client (model 4 — last resort) ──────────────────
const cfClient = (process.env.CLOUDFLARE_ACCOUNT_ID && process.env.CLOUDFLARE_API_TOKEN)
  ? new OpenAI({
      apiKey:     process.env.CLOUDFLARE_API_TOKEN,
      baseURL:    `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/ai/v1`,
      maxRetries: 0,
    })
  : null;

// ── Model identifiers ──────────────────────────────────────────────────────
const MODEL_GEMINI = "gemini-2.0-flash";               // Google Gemini 2.0 Flash
const MODEL_1      = "llama-3.3-70b-versatile";        // Groq — Llama 3.3 70B
const MODEL_2      = "deepseek-r1-distill-llama-70b";  // Groq — DeepSeek R1 70B
const MODEL_3      = "@cf/meta/llama-3.1-8b-instruct"; // Cloudflare — Llama 3.1 8B

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
const MODEL_TIMEOUT_MS = 7000; // 7 s per model → 4 providers = 28 s max cascade

async function callModel(client, model, messages) {
  const timer = new Promise((_, reject) =>
    setTimeout(() => reject(Object.assign(new Error("Model timeout"), { code: "ETIMEDOUT" })), MODEL_TIMEOUT_MS)
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

  // 1️⃣  Gemini 2.0 Flash (primary)
  if (gemini) {
    try {
      return await callModel(gemini, MODEL_GEMINI, msgs);
    } catch (err) {
      if (isSoftError(err)) {
        console.warn(`[AI] Gemini → ${err.status || err.message} — trying Groq`);
      } else {
        throw err;
      }
    }
  }

  // 2️⃣  Groq — Llama 3.3 70B
  if (groq) {
    try {
      return await callModel(groq, MODEL_1, msgs);
    } catch (err) {
      if (isSoftError(err)) {
        console.warn(`[AI] Llama 3.3 → ${err.status || err.message} — trying DeepSeek`);
      } else {
        throw err;
      }
    }
  }

  // 3️⃣  Groq — DeepSeek R1 70B
  if (groq) {
    try {
      return await callModel(groq, MODEL_2, msgs);
    } catch (err) {
      if (isSoftError(err)) {
        console.warn(`[AI] DeepSeek → ${err.status || err.message} — trying Cloudflare`);
      } else {
        throw err;
      }
    }
  }

  // 4️⃣  Cloudflare Workers AI — Llama 3.1 8B
  if (cfClient) {
    try {
      return await callModel(cfClient, MODEL_3, msgs);
    } catch (err) {
      if (isSoftError(err)) {
        console.warn(`[AI] Cloudflare → ${err.status || err.message} — all providers exhausted`);
      } else {
        throw err;
      }
    }
  }

  throw new Error(
    "All AI providers timed out. Please try again in a moment."
  );
}

module.exports = { aiComplete, aiChat };

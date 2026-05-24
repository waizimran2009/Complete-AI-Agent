/**
 * AI helper — 3-model cascade fallback
 *
 * Priority order:
 *   1. Groq  — Llama 3.3 70B   (best quality, 14,400 req/day free)
 *   2. Gemini — 1.5 Flash       (Google, 1,500 req/day free)
 *   3. Groq  — Llama 3.1 8B    (fast, SEPARATE quota: 14,400 req/day)
 *
 * If a model returns 429 (rate limit) or 503 (unavailable) the next one
 * is tried automatically. The first successful response wins.
 *
 * Rate limit resets:
 *   Per-minute → every 60 seconds
 *   Per-day    → midnight UTC (5:00 AM Pakistan time)
 */

const { OpenAI } = require("openai");
const { GoogleGenerativeAI } = require("@google/generative-ai");

// ── Clients ────────────────────────────────────────────────────────────────
const groq = process.env.GROQ_API_KEY
  ? new OpenAI({ apiKey: process.env.GROQ_API_KEY, baseURL: "https://api.groq.com/openai/v1" })
  : null;

const genAI = process.env.GEMINI_API_KEY
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

// ── Model identifiers ──────────────────────────────────────────────────────
const GROQ_70B  = "llama-3.3-70b-versatile";  // primary   — best quality
const GROQ_8B   = "llama-3.1-8b-instant";      // tertiary  — separate quota
const GEMINI_M  = "gemini-1.5-flash";

// ── Rate-limit / unavailable detector ─────────────────────────────────────
function isSoftError(err) {
  const status = err?.status || err?.statusCode;
  const msg    = (err?.message || "").toLowerCase();
  return (
    status === 429 ||
    status === 503 ||
    msg.includes("rate limit") ||
    msg.includes("quota") ||
    msg.includes("overloaded") ||
    msg.includes("unavailable")
  );
}

// ── Individual model calls ─────────────────────────────────────────────────
async function tryGroq(messages, model) {
  const res = await groq.chat.completions.create({
    model,
    messages,
    max_tokens: 1024,
    temperature: 0.7,
  });
  return res.choices[0].message.content;
}

async function tryGemini(prompt, history, systemInstruction) {
  const model = genAI.getGenerativeModel({
    model: GEMINI_M,
    ...(systemInstruction ? { systemInstruction } : {}),
  });
  if (history && history.length > 0) {
    const chat = model.startChat({
      history: history.map(m => ({
        role: m.role === "assistant" ? "model" : m.role,
        parts: [{ text: m.content }],
      })),
    });
    const result = await chat.sendMessage(prompt);
    return result.response.text();
  }
  const result = await model.generateContent(prompt);
  return result.response.text();
}

// ── Public API ─────────────────────────────────────────────────────────────

/**
 * Run a single prompt through the model cascade.
 * @param {string} prompt
 * @returns {Promise<string>}
 */
async function aiComplete(prompt) {
  if (!prompt) throw new Error("prompt is required");

  const userMsg = [{ role: "user", content: prompt }];

  // 1️⃣  Groq — Llama 3.3 70B
  if (groq) {
    try {
      return await tryGroq(userMsg, GROQ_70B);
    } catch (err) {
      if (isSoftError(err)) {
        console.warn(`[AI] Groq 70B soft error (${err.status || err.message}) — trying Gemini`);
      } else {
        throw err;
      }
    }
  }

  // 2️⃣  Gemini — 1.5 Flash
  if (genAI) {
    try {
      return await tryGemini(prompt, null, null);
    } catch (err) {
      if (isSoftError(err)) {
        console.warn(`[AI] Gemini soft error (${err.status || err.message}) — trying Groq 8B`);
      } else {
        throw err;
      }
    }
  }

  // 3️⃣  Groq — Llama 3.1 8B (separate daily quota)
  if (groq) {
    try {
      return await tryGroq(userMsg, GROQ_8B);
    } catch (err) {
      if (isSoftError(err)) {
        console.warn(`[AI] Groq 8B soft error — all providers exhausted`);
      } else {
        throw err;
      }
    }
  }

  throw new Error("All AI providers are currently rate-limited or unavailable. Please try again in a minute.");
}

/**
 * Run a chat conversation through the model cascade.
 * Supports system instructions and multi-turn history.
 * @param {string}   message
 * @param {Array}    history  — [{role:'user'|'model'|'assistant', content:'...'}]
 * @param {string}   [system] — system instruction / persona
 * @returns {Promise<string>}
 */
async function aiChat(message, history, system) {
  if (!message) throw new Error("message is required");

  const buildGroqMessages = () => {
    const msgs = [];
    if (system) msgs.push({ role: "system", content: system });
    if (history && Array.isArray(history)) {
      msgs.push(...history.map(m => ({
        role: m.role === "model" ? "assistant" : m.role,
        content: m.content,
      })));
    }
    msgs.push({ role: "user", content: message });
    return msgs;
  };

  // 1️⃣  Groq — Llama 3.3 70B
  if (groq) {
    try {
      return await tryGroq(buildGroqMessages(), GROQ_70B);
    } catch (err) {
      if (isSoftError(err)) {
        console.warn(`[AI] Groq 70B soft error (${err.status || err.message}) — trying Gemini`);
      } else {
        throw err;
      }
    }
  }

  // 2️⃣  Gemini — 1.5 Flash
  if (genAI) {
    try {
      return await tryGemini(message, history, system);
    } catch (err) {
      if (isSoftError(err)) {
        console.warn(`[AI] Gemini soft error (${err.status || err.message}) — trying Groq 8B`);
      } else {
        throw err;
      }
    }
  }

  // 3️⃣  Groq — Llama 3.1 8B
  if (groq) {
    try {
      return await tryGroq(buildGroqMessages(), GROQ_8B);
    } catch (err) {
      if (isSoftError(err)) {
        console.warn(`[AI] Groq 8B soft error — all providers exhausted`);
      }
      throw err;
    }
  }

  throw new Error("All AI providers are currently rate-limited or unavailable. Please try again in a minute.");
}

module.exports = { aiComplete, aiChat };

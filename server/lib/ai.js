/**
 * Shared AI helper — uses Groq (Llama 3.3 70B) when GROQ_API_KEY is set,
 * falls back to Gemini 1.5 Flash when only GEMINI_API_KEY is set.
 *
 * Usage:  const { aiComplete } = require("../lib/ai");
 *         const text = await aiComplete("Write a summary of...");
 */

const { OpenAI } = require("openai");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const groq = process.env.GROQ_API_KEY
  ? new OpenAI({ apiKey: process.env.GROQ_API_KEY, baseURL: "https://api.groq.com/openai/v1" })
  : null;

const genAI = process.env.GEMINI_API_KEY
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

const GROQ_MODEL   = "llama-3.3-70b-versatile";
const GEMINI_MODEL = "gemini-1.5-flash";

/**
 * Run a single prompt through whichever AI provider is configured.
 * @param {string} prompt
 * @returns {Promise<string>}
 */
async function aiComplete(prompt) {
  if (!prompt) throw new Error("prompt is required");

  if (groq) {
    const res = await groq.chat.completions.create({
      model: GROQ_MODEL,
      messages: [{ role: "user", content: prompt }],
      max_tokens: 1024,
      temperature: 0.7,
    });
    return res.choices[0].message.content;
  }

  if (genAI) {
    const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });
    const result = await model.generateContent(prompt);
    return result.response.text();
  }

  throw new Error("No AI provider configured. Set GROQ_API_KEY or GEMINI_API_KEY.");
}

module.exports = { aiComplete, GROQ_MODEL, GEMINI_MODEL };

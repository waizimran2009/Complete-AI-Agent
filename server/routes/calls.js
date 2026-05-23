const express = require("express");
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { createClient } = require("@supabase/supabase-js");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

function getSupabase() {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) return null;
  return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
}

// GET /api/calls/number — return configured Twilio number
router.get("/number", (req, res) => {
  res.json({
    number: process.env.TWILIO_PHONE_NUMBER || null,
    configured: !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN),
  });
});

// POST /api/calls/webhook — Twilio calls this when a call comes in (TwiML)
router.post("/webhook", (req, res) => {
  const company = process.env.COMPANY_NAME || "our company";
  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Joanna">
    Hello! Thank you for calling ${company}. I am Aria, your AI assistant.
    Please briefly describe what you need help with, and I will assist you.
  </Say>
  <Gather input="speech" action="/api/calls/respond" timeout="8" speechTimeout="2">
    <Say voice="Polly.Joanna">Go ahead, I am listening.</Say>
  </Gather>
  <Say voice="Polly.Joanna">I did not catch that. Please call back and try again.</Say>
</Response>`;
  res.set("Content-Type", "text/xml");
  res.send(twiml);
});

// POST /api/calls/respond — Twilio sends speech result, AI generates reply
router.post("/respond", async (req, res) => {
  const speech = req.body?.SpeechResult || "";
  const callSid = req.body?.CallSid || "";
  const company = process.env.COMPANY_NAME || "our company";
  const services = process.env.COMPANY_SERVICES || "various services";

  let reply = "Thank you for calling. I will transfer your call to a team member shortly.";

  if (speech) {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent(
        `You are Aria, the AI phone receptionist for ${company}, which offers ${services}.\n` +
        `A caller said: "${speech}"\n` +
        `Respond naturally as a receptionist in 1-2 sentences. Be helpful and professional.`
      );
      reply = result.response.text().trim();
    } catch (_) {}

    const sb = getSupabase();
    if (sb) {
      await sb.from("call_logs").insert({
        call_sid: callSid,
        caller_speech: speech,
        ai_response: reply,
        status: "completed",
      }).catch(() => {});
    }
  }

  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Joanna">${reply.replace(/[<>&"]/g, c => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;" })[c])}</Say>
  <Gather input="speech" action="/api/calls/respond" timeout="8" speechTimeout="2">
    <Say voice="Polly.Joanna">Is there anything else I can help you with?</Say>
  </Gather>
  <Say voice="Polly.Joanna">Thank you for calling. Have a great day!</Say>
  <Hangup/>
</Response>`;
  res.set("Content-Type", "text/xml");
  res.send(twiml);
});

// GET /api/calls/logs
router.get("/logs", async (req, res) => {
  const sb = getSupabase();
  if (!sb) return res.json({ logs: [] });
  const { data, error } = await sb
    .from("call_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ logs: data || [] });
});

module.exports = router;

const express = require("express");
const router = express.Router();
const { createClient } = require("@supabase/supabase-js");
const { aiComplete } = require("../lib/ai");

function getSupabase() {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) return null;
  return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
}

// GET /api/calls/number — return configured Twilio number
router.get("/number", (req, res) => {
  res.json({
    number: process.env.TWILIO_PHONE_NUMBER || null,
    configured: !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER),
  });
});

// POST /api/calls/outbound — Aria calls the user's phone number
router.post("/outbound", async (req, res) => {
  const { to } = req.body;
  if (!to) return res.status(400).json({ error: "Phone number is required" });

  const sid  = process.env.TWILIO_ACCOUNT_SID;
  const auth = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_PHONE_NUMBER;

  if (!sid || !auth || !from) {
    return res.status(503).json({
      error: "Twilio is not configured. Add TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER to your .env file.",
    });
  }

  // Normalize to E.164 format
  let phone = to.replace(/[\s\-().]/g, "");
  if (!phone.startsWith("+")) {
    if (phone.startsWith("0") && phone.length === 11) {
      phone = "+92" + phone.slice(1); // Pakistani local number
    } else if (phone.length === 10) {
      phone = "+1" + phone; // US default
    } else {
      phone = "+" + phone;
    }
  }

  if (!/^\+[1-9]\d{6,14}$/.test(phone)) {
    return res.status(400).json({
      error: "Invalid number. Use international format: +1 555 123 4567 or +92 300 1234567",
    });
  }

  const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get("host")}`;

  try {
    const twilio = require("twilio");
    const client = twilio(sid, auth);
    const call = await client.calls.create({
      from,
      to: phone,
      url: `${baseUrl}/api/calls/webhook`,
    });
    res.json({ success: true, callSid: call.sid, message: `Aria is calling ${phone} — answer your phone!` });
  } catch (err) {
    console.error("Outbound call error:", err.message);
    res.status(500).json({ error: err.message || "Call failed. Check your Twilio credentials." });
  }
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
  <Gather input="speech" action="/api/calls/respond" timeout="8" speechTimeout="4">
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
      reply = await aiComplete(
        `You are Aria, the AI phone receptionist for ${company}, which offers ${services}.\n` +
        `A caller said: "${speech}"\n` +
        `Respond naturally as a receptionist in 1-2 sentences. Be helpful and professional.`
      );
      reply = reply.trim();
    } catch (err) {
      console.error("AI speech response error:", err.message);
    }

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
  <Gather input="speech" action="/api/calls/respond" timeout="8" speechTimeout="4">
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

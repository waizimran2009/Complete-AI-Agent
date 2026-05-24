const express = require("express");
const router = express.Router();
const { createClient } = require("@supabase/supabase-js");
const { aiComplete } = require("../lib/ai");

function getOpenAI() {
  if (!process.env.OPENAI_API_KEY) return null;
  const { OpenAI } = require("openai");
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

function getSupabase() {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) return null;
  return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
}

// POST /api/posts/generate — generate LinkedIn post text
router.post("/generate", async (req, res) => {
  const { goal, brief, channels } = req.body;
  if (!brief) return res.status(400).json({ error: "brief required" });

  const goalLabels = {
    hiring: "We're hiring",
    launch: "Product launch",
    thought: "Thought piece",
    milestone: "Milestone",
    case: "Case study",
  };

  try {
    const prompt = `Write a LinkedIn post for a software company.\n\nPost type: ${goalLabels[goal] || goal}.\nBrief: ${brief}\n\nRules:\n- 5-7 short paragraphs, each 1-2 sentences\n- Strong hook on line 1\n- Light emoji where natural (2-3 max)\n- End with one clear CTA\n- 3-5 hashtags at the bottom\n- No markdown, plain text only\n- 200 words max`;
    const text = await aiComplete(prompt);
    res.json({ text: text.trim() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/posts/generate-image — generate post image via DALL-E
router.post("/generate-image", async (req, res) => {
  const { goal, brief } = req.body;

  const openai = getOpenAI();
  if (!openai) {
    return res.json({ imageUrl: null, note: "OpenAI not configured" });
  }

  const goalDescriptions = {
    hiring: "professional office environment, diverse team, modern tech startup",
    launch: "glowing futuristic product, neon lights, tech innovation",
    thought: "abstract neural network, digital brain, code visualization",
    milestone: "celebration, confetti, achievement trophy, team success",
    case: "customer success story, handshake, business growth chart",
  };

  try {
    const imagePrompt = `LinkedIn post illustration: ${goalDescriptions[goal] || "professional business"}, ${brief.slice(0, 100)}, dark corporate aesthetic, high quality, 4k`;
    const image = await openai.images.generate({
      model: "dall-e-3",
      prompt: imagePrompt,
      size: "1024x1024",
      quality: "standard",
      n: 1,
    });
    res.json({ imageUrl: image.data[0].url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/posts/save — save post to history
router.post("/save", async (req, res) => {
  const { title, content, goal, imageUrl, channels, status } = req.body;
  const sb = getSupabase();
  if (!sb) return res.json({ saved: false });

  const { error } = await sb.from("post_logs").insert({
    title,
    content,
    goal,
    image_url: imageUrl,
    channels,
    status: status || "draft",
  });
  if (error) return res.status(500).json({ error: error.message });
  res.json({ saved: true });
});

// GET /api/posts/history
router.get("/history", async (req, res) => {
  const sb = getSupabase();
  if (!sb) return res.json({ posts: [] });
  const { data, error } = await sb
    .from("post_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ posts: data || [] });
});

module.exports = router;

import express from "express";
import fetch from "node-fetch";

const router = express.Router();

// memory store (userID → { history: [...], lastActive })
const memory = new Map();
const MEMORY_LIMIT = 3; // keep last 3 user+ai pairs
const MEMORY_TIMEOUT = 60 * 1000; // 1 minute

// periodically clean expired memory
setInterval(() => {
  const now = Date.now();
  for (const [key, data] of memory.entries()) {
    if (now - data.lastActive > MEMORY_TIMEOUT) memory.delete(key);
  }
}, 30 * 1000);

// === MAIN ENDPOINT ===
// /[PROMPT]?user=[USER]&model=[MODEL]
router.get("/:prompt", async (req, res) => {
  const user = req.query.user;
  const prompt = req.params.prompt || "";
  const model = (req.query.model || "openai").toLowerCase();

  // 🚫 User check
  if (!user) {
    return res.send(
      "please check farabi.me/howtouse. USER field is empty."
    );
  }

  // 🚫 Model check
  const allowedModels = ["openai", "normal", "roblox"];
  if (!allowedModels.includes(model)) {
    return res.send(
      "please check farabi.me/howtouse. free tiers only have model openai, normal, and roblox."
    );
  }

  // === Select instruction based on model ===
  const instructions = {
    roblox: `
You are a Roblox AI made by OpenAI, modified by Ariyan Farabi. Friendly, professional, Gen Z style. Always reply clearly and shorter and Use lowercase.
Rules: Kid-safe, no swearing, no adult or violent content. Talk about Roblox stuff only, Avoid hacks, exploits, or unsafe links. Use lowercase chill tone ("yo", "bro", "wbu", etc.). Use emojis.
`,
    normal: `
You are a AI chat assistant made by OpenAI, modified by Ariyan Farabi. Speak in lowercase most of the time, chill Gen Z tone. Always be clear, kind, and short. Avoid adult or unsafe topics. Be general-purpose, simple, and fun.
`,
    openai: `
You are an OpenAI-based assistant modified by Ariyan Farabi. Be professional but reply in easy language, chill, and short. Kid-safe, no adult or harmful topics. Keep lowercase responses unless needed. Always positive and helpful.
`,
  };

  const instruction = instructions[model];

  // === Restore memory ===
  const data = memory.get(user) || { history: [], lastActive: Date.now() };
  let history = data.history.slice(-MEMORY_LIMIT * 2);

  const chatHistoryText = history
    .map(msg => `${msg.isUser ? "User" : "Assistant"}: ${msg.text}`)
    .join("\n");

  const fullPrompt = `${instruction}\n${chatHistoryText}\nUser: ${prompt}\nAssistant:`;

  try {
    // Pollinations API call (always openai)
    const url = `https://text.pollinations.ai/${encodeURIComponent(
      fullPrompt
    )}?model=openai`;

    const resp = await fetch(url, {
      method: "GET",
      headers: { Accept: "text/plain", "Cache-Control": "no-cache" },
    });

    if (!resp.ok) throw new Error(`AI response failed (${resp.status})`);

    const text = (await resp.text()).trim();
    if (!text) throw new Error("Empty response");

    // update memory
    history.push({ isUser: true, text: prompt });
    history.push({ isUser: false, text });
    if (history.length > MEMORY_LIMIT * 2)
      history = history.slice(-MEMORY_LIMIT * 2);

    memory.set(user, { history, lastActive: Date.now() });

    // 🟢 Only return reply text
    res.send(text);
  } catch (err) {
    res.send(`error: ${err.message}`);
  }
});

export default router;

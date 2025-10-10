import express from "express";
import fetch from "node-fetch";

const router = express.Router();

// memory store (userID → { history: [...], lastActive })
const memory = new Map();
const MEMORY_LIMIT = 3; // keep 3 message pairs
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

  // 🚫 Missing user check
  if (!user) {
    return res.send(
      "please check farabi.me/howtouse. USER field is empty."
    );
  }

  // 🚫 Invalid model check
  const allowedModels = ["openai", "normal", "roblox"];
  if (!allowedModels.includes(model)) {
    return res.send(
      "please check farabi.me/howtouse. free tiers only have model openai, normal, and roblox."
    );
  }

  // Restore memory
  const data = memory.get(user) || { history: [], lastActive: Date.now() };
  let history = data.history.slice(-MEMORY_LIMIT * 2);

  // 🎯 Base instructions per model
  let instruction = "";
  if (model === "roblox") {
    instruction = `
You are a Roblox AI made by OpenAI, modified by Ariyan Farabi (Ariyxxnnn).
Friendly, professional, Gen Z style. Always reply clearly and shorter.
Rules:
- Kid-safe, no swearing, no adult or violent content.
- Talk about Roblox features, avatars, badges, and studio basics.
- Avoid hacks, exploits, or unsafe links.
- Use lowercase chill tone ("yo", "bro", "wbu", etc.).
`;
  } else if (model === "normal") {
    instruction = `
You are a normal AI assistant created by Ariyan Farabi (Ariyxxnnn).
Speak clearly, friendly, and short. Use natural casual tone.
Avoid dark or adult content. Be general, helpful, and safe.
`;
  } else if (model === "openai") {
    instruction = `
You are OpenAI’s original assistant but with Ariyan Farabi’s short, clear, friendly tone.
Reply fast, helpful, and human-like.
Avoid unnecessary long explanations or sensitive content.
`;
  }

  // Build chat history
  const chatHistoryText = history
    .map(msg => `${msg.isUser ? "User" : "Assistant"}: ${msg.text}`)
    .join("\n");

  const fullPrompt = `${instruction}\n${chatHistoryText}\nUser: ${prompt}\nAssistant:`;

  try {
    // Pollinations API call
    const url = `https://text.pollinations.ai/${encodeURIComponent(
      fullPrompt
    )}?model=${model}`;

    const resp = await fetch(url, {
      method: "GET",
      headers: { Accept: "text/plain", "Cache-Control": "no-cache" }
    });

    if (!resp.ok) throw new Error(`AI response failed (${resp.status})`);
    const text = (await resp.text()).trim();
    if (!text) throw new Error("Empty response");

    // Update memory
    history.push({ isUser: true, text: prompt });
    history.push({ isUser: false, text });
    if (history.length > MEMORY_LIMIT * 2)
      history = history.slice(-MEMORY_LIMIT * 2);

    memory.set(user, { history, lastActive: Date.now() });

    // ✅ Only send the AI reply text
    res.send(text);
  } catch (err) {
    res.send(`error: ${err.message}`);
  }
});

export default router;

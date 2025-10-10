import express from "express";
import fetch from "node-fetch";

const router = express.Router();

// Memory store: userID → { history: [...], lastActive }
const memory = new Map();
const MEMORY_LIMIT = 3; // last 3 user+AI pairs
const MEMORY_TIMEOUT = 60 * 1000; // 1 minute

// Clean expired memory every 30s
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
  if (!user) return res.send("please check farabi.me/howtouse. USER field is empty.");

  // 🚫 Model check
  const allowedModels = ["openai", "normal", "roblox"];
  if (!allowedModels.includes(model)) {
    return res.send(
      "please check farabi.me/howtouse. free tiers only have model openai, normal, and roblox."
    );
  }

  // === Shortened instructions per model ===
  const instructions = {
    roblox: "Roblox AI, friendly, clear, short. Kid-safe. Talk Roblox only. Use lowercase and emojis. Reply only what user asked.",
    normal: "Friendly AI assistant, chill Gen Z tone. Clear, short, simple. Avoid adult/unsafe topics. Reply only what user asked.",
    openai: "OpenAI assistant, clear, short, professional but easy. Kid-safe. Reply only what user asked.",
  };
  const instruction = instructions[model];

  // Restore memory
  const data = memory.get(user) || { history: [], lastActive: Date.now() };
  let history = data.history.slice(-MEMORY_LIMIT * 2);
  const chatHistoryText = history.map(msg => `${msg.isUser ? "User" : "Assistant"}: ${msg.text}`).join("\n");

  const fullPrompt = `${instruction}\n${chatHistoryText}\nUser: ${prompt}\nAssistant:`;

  try {
    // Pollinations API call (always openai)
    const url = `https://text.pollinations.ai/${encodeURIComponent(fullPrompt)}?model=openai`;
    const resp = await fetch(url, { method: "GET", headers: { Accept: "text/plain", "Cache-Control": "no-cache" } });

    if (!resp.ok) throw new Error(`AI response failed (${resp.status})`);
    const text = (await resp.text()).trim();
    if (!text) throw new Error("Empty response");

    // Update memory
    history.push({ isUser: true, text: prompt });
    history.push({ isUser: false, text });
    if (history.length > MEMORY_LIMIT * 2) history = history.slice(-MEMORY_LIMIT * 2);
    memory.set(user, { history, lastActive: Date.now() });

    // Only reply text
    res.send(text);
  } catch (err) {
    res.send(`error: ${err.message}`);
  }
});

export default router;

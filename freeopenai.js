import express from "express";
import fetch from "node-fetch";

const router = express.Router();

// Memory store (optional)
const memory = new Map();
const MEMORY_LIMIT = 3; // last 3 user+AI pairs
const MEMORY_TIMEOUT = 60 * 1000; // 1 minute

// Cleanup expired memory every 30s
setInterval(() => {
  const now = Date.now();
  for (const [key, data] of memory.entries()) {
    if (now - data.lastActive > MEMORY_TIMEOUT) memory.delete(key);
  }
}, 30 * 1000);

// Public GET endpoint: /{prompt}?user=123&model=openai
router.get("/:prompt", async (req, res) => {
  const prompt = req.params.prompt || "";
  const user = req.query.user || `guest_${Math.floor(Math.random() * 100000)}`;
  const model = (req.query.model || "openai").toLowerCase();

  const allowedModels = ["openai", "normal", "roblox"];
  if (!allowedModels.includes(model)) return res.send(`Invalid model. Choose one of: ${allowedModels.join(", ")}`);

  const instructions = {
    roblox: "Roblox AI, friendly, clear, kid-safe, lowercase & emojis. Reply only what user asked.",
    normal: "Friendly AI assistant, chill Gen Z tone. Clear, short, simple. Avoid adult topics.",
    openai: "OpenAI assistant, clear, short, professional but easy. Kid-safe."
  };

  const instruction = instructions[model];

  // Restore memory
  const data = memory.get(user) || { history: [], lastActive: Date.now() };
  let history = data.history.slice(-MEMORY_LIMIT * 2);
  const chatHistory = history.map(m => `${m.isUser ? "User" : "Assistant"}: ${m.text}`).join("\n");

  const fullPrompt = `${instruction}\n${chatHistory}\nUser: ${prompt}\nAssistant:`;

  try {
    // Call Pollinations API
    const url = `https://text.pollinations.ai/${encodeURIComponent(fullPrompt)}?model=openai`;
    const resp = await fetch(url, { headers: { Accept: "text/plain", "Cache-Control": "no-cache" } });
    if (!resp.ok) throw new Error(`AI response failed (${resp.status})`);

    const text = (await resp.text()).trim();
    if (!text) throw new Error("Empty response");

    // Update memory
    history.push({ isUser: true, text: prompt });
    history.push({ isUser: false, text });
    if (history.length > MEMORY_LIMIT * 2) history = history.slice(-MEMORY_LIMIT * 2);
    memory.set(user, { history, lastActive: Date.now() });

    // Respond plain text
    res.send(text);
  } catch (err) {
    res.send(`error: ${err.message}`);
  }
});

export default router;

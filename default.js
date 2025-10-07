import express from "express";
import fetch from "node-fetch";

const router = express.Router();

async function getAI(userPrompt) {
  const instruction = `you are an ai chatbot made by openai, modified by ariyan farabi.
be friendly, simple, and safe. always respond clearly and politely.
prioritize the latest user prompt first.`;

  const fullPrompt = `${instruction}\nuser: ${userPrompt}\nassistant:`;
  const url = `https://text.pollinations.ai/${encodeURIComponent(fullPrompt)}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000); // 10 sec timeout

  try {
    const resp = await fetch(url, {
      method: "GET",
      headers: { "accept": "text/plain", "cache-control": "no-cache" },
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!resp.ok) throw new Error(`pollinations api error: ${resp.status} ${resp.statusText}`);
    const text = await resp.text();
    if (!text.trim()) throw new Error("empty ai response");

    return text.trim();
  } catch (err) {
    console.error("❌ AI request failed:", err.message);
    return `AI request failed: ${err.message}`;
  }
}

// ✅ Route: /prompt/[PROMPT]
router.get("/:prompt", async (req, res) => {
  const prompt = req.params.prompt;
  if (!prompt) return res.status(400).send("missing prompt");

  const result = await getAI(prompt);
  res.send(result);
});

// ✅ Optional: /prompt?prompt=hello
router.get("/", async (req, res) => {
  const prompt = req.query.prompt;
  if (!prompt) return res.status(400).send("missing prompt");

  const result = await getAI(prompt);
  res.send(result);
});

export default router;

import express from "express";
import fetch from "node-fetch";

const app = express();

async function getAI(userPrompt) {
  const instruction = `you are an ai chatbot made by openai, modified by ariyan farabi.
be friendly, simple, and safe. always respond clearly and politely.
prioritize the latest user prompt first.`;

  const fullPrompt = `${instruction}\nuser: ${userPrompt}\nassistant:`;

  const url = `https://text.pollinations.ai/${encodeURIComponent(fullPrompt)}`;

  try {
    const resp = await fetch(url, {
      method: "GET",
      headers: { "accept": "text/plain", "cache-control": "no-cache" },
    });

    if (!resp.ok) throw new Error(`pollinations api error: ${resp.status} ${resp.statusText}`);

    const text = await resp.text();

    if (!text || text.trim().length === 0) throw new Error("empty ai response");

    return text.trim().toLowerCase();
  } catch (err) {
    console.error("ai request failed:", err);
    return `ai request failed: ${err.message}`;
  }
}

app.get("*", async (req, res) => {
  const prompt = req.query.prompt || req.path.slice(1);
  if (!prompt) {
    res.status(400).send("missing prompt");
    return;
  }

  const result = await getAI(prompt);
  res.send(result);
});

export default app;

import fetch from "node-fetch";

export async function getAI(userKey, userPrompt, useMemory, conversationMemory, MEMORY_LIMIT) {
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

    if (useMemory) {
      let history = conversationMemory.get(userKey)?.history || [];
      history.push({ isUser: true, text: userPrompt });
      history.push({ isUser: false, text: text.trim() });
      if (history.length > MEMORY_LIMIT * 2) {
        history = history.slice(-MEMORY_LIMIT * 2);
      }
      conversationMemory.set(userKey, { history, lastActive: Date.now() });
    }

    return { text: text.trim(), used: "base pollinations" };
  } catch (err) {
    console.error("ai request failed:", err);
    return { text: `ai request failed: ${err.message}`, used: "error-handler" };
  }
}

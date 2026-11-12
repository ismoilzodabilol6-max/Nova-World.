import "dotenv/config";
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;
const MODEL = process.env.OPENAI_MODEL || "gpt-6-luna";

app.use(express.json({ limit: "32kb" }));
app.use(express.static(path.join(__dirname, "public")));

app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

app.post("/api/chat", async (req, res) => {
  const key = process.env.OPENAI_API_KEY;

  if (!key) {
    return res.status(503).json({
      error: "Калиди API дар файли .env нест."
    });
  }

  const messages = req.body?.messages;

  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: "Саволро навис." });
  }

  try {
    const result = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${key}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: MODEL,
        instructions: "Ту NOVA ҳастӣ. Ба саволҳои гуногун бо забони корбар ҷавоб деҳ. Агар корбар тоҷикӣ нависад, бо тоҷикӣ ҷавоб деҳ. Фаҳмо ва дӯстона фаҳмон.",
        input: messages.slice(-12),
        tools: [{ type: "web_search" }],
        max_output_tokens: 1200
      })
    });

    const data = await result.json();

    if (!result.ok) {
      return res.status(502).json({
        error: data.error?.message || "Хатои OpenAI API"
      });
    }

    const answer = typeof data.output_text === "string"
  ? data.output_text.trim()
  : (data.output || [])
      .filter(item => item.type === "message")
      .flatMap(item => item.content || [])
      .filter(item => item.type === "output_text")
      .map(item => item.text || "")
      .join("\n")
      .trim();

    if (!answer.trim()) {
      return res.status(502).json({ error: "AI ҷавоб надод." });
    }

    res.json({ reply: answer });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Пайвасти интернетро санҷ." });
  }
});

app.listen(PORT, () => {
  console.log("NOVA фаъол аст: http://localhost:" + PORT);
});
87
ло
лэон
огнпееквуцфйыувкаепнргод

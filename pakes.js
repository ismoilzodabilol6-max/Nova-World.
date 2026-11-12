
import "dotenv/config";
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = Number(process.env.PORT) || 3000;
const MODEL = process.env.OPENAI_MODEL || "gpt-6-luna";

app.use(express.json({ limit: "32kb" }));
app.use(express.static(path.join(__dirname, "public")));

app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    aiConfigured: Boolean(process.env.OPENAI_API_KEY)
  });
});

app.post("/api/chat", async (req, res) => {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return res.status(503).json({
      error: "Калиди API дар файли .env нест."
    });
  }

  const incoming = req.body?.messages;

  if (!Array.isArray(incoming) || incoming.length === 0) {
    return res.status(400).json({ error: "Саволро навис." });
  }

  const messages = incoming.slice(-12).map((m) => ({
    role: m.role === "assistant" ? "assistant" : "user",
    content: String(m.content || "").slice(0, 6000)
  })).filter((m) => m.content.trim());

  try {
    const response = await fetch(
      "https://api.openai.com/v1/responses",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: MODEL,
          instructions:
            "Ту NOVA ҳастӣ. Ба саволҳои гуногун ҷавоб деҳ. " +
            "Агар корбар тоҷикӣ нависад, бо тоҷикӣ ҷавоб деҳ. " +
            "Фаҳмо, дӯстона ва дуруст ҷавоб деҳ. " +
            "Ба омӯзиш, илм, таърих, технология, бозиҳо ва код кӯмак кун.",
          input: messages,
          tools: [{ type: "web_search" }],
          max_output_tokens: 1200
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("API error:", data.error?.message);
      return res.status(502).json({
        error: data.error?.message || "Хатои API."
      });
    }

    const answer = data.output_text?.trim();

    if (!answer) {
      return res.status(502).json({
        error: "AI ҷавоб надод."
      });
    }

    res.json({ reply: answer });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Ба AI пайваст нашуд. Интернетро санҷ."
    });
  }
});

app.listen(PORT, () => {
  console.log(`NOVA фаъол аст: http://localhost:${PORT}`);
});

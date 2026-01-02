import express from "express";
import OpenAI from "openai";
import "dotenv/config";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());

//limit each IP tp make 20 request per 15 minutes
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
});

app.use("/api/", limiter);

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENAI_API_KEY,
  //   defaultHeaders: {
  //     "HTTP-Referer": "http://localhost:4200", // Optional
  //     "X-Title": "Nexus AI Hub",               // Optional
  //   }
});
app.get("/api/health", (req, res) => {
  res.status(200).send("OK");
});
app.post("/api/chat", async (req, res) => {
  try {
    const { message, model } = req.body;

    const response = await openai.chat.completions.create({
      model: model || "xiaomi/mimo-v2-flash:free", //
      messages: [{ role: "user", content: message }],
    });

    res.json({ reply: response.choices[0].message.content });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "AI Bridge failed" });
  }
});

const PORT = 3000;
app.listen(PORT, () => console.log(`AI Bridge is running on port ${PORT}`));

import dotenv from "dotenv";
dotenv.config();

import cors from "cors";
import express from "express";
import { GoogleGenAI } from "@google/genai";

const app = express();

app.use(cors({
  origin: "http://localhost:5173"
}));

app.use(express.json({ limit: "10mb" }));

app.use(express.static("."));

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

app.get("/health", (req, res) => {
  res.send("Server is running");
});

app.post("/predict-digit", async (req, res) => {
  try {
    const { image } = req.body;

    if (!image) {
      return res.status(400).json({ error: "No image provided" });
    }

    const match = image.match(/^data:(image\/png|image\/jpeg);base64,(.+)$/);

    if (!match) {
      return res.status(400).json({ error: "Invalid image format" });
    }

    const mimeType = match[1];
    const base64Data = match[2];

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            {
              text:
                "This image contains exactly one handwritten digit (0-9). " +
                "Return ONLY the digit. No words, no explanation."
            },
            {
              inlineData: {
                mimeType,
                data: base64Data,
              },
            },
          ],
        },
      ],
    });

    const text = (response.text || "").trim();

    if (!/^[0-9]$/.test(text)) {
      return res.status(500).json({
        error: "Invalid response from model",
        raw: text,
      });
    }

    res.json({ digit: text });

  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ error: "Prediction failed" });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
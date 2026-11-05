import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Initialize Gemini client lazily/safely
function getGenAIClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is missing.");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// Health check API
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

// AI Polish / Easy Assistant Endpoint
app.post("/api/ai-polish", async (req, res) => {
  try {
    const { questionTitle, rawText, fieldType } = req.body;
    if (!rawText || typeof rawText !== "string") {
      return res.status(400).json({ error: "rawText parameter is required." });
    }

    const ai = getGenAIClient();
    
    const prompt = `
당신은 지적장애 및 정신장애인의 취업을 돕는 정성스러운 이력서 작성 지원 AI 도우미입니다.
신청자가 다음과 같이 단답형이나 구어체, 또는 간단하게 작성한 문장을 정갈하고 정중하며 긍정적인 이력서용 문장으로 다듬어 주세요.

[질문 항목]: ${questionTitle || fieldType || "자기소개/장점"}
[작성자가 입력한 내용]: "${rawText}"

지침:
1. 작성자의 본래 생각과 사실을 훼손하지 않고 유지하세요.
2. 이력서에 어울리는 바르고 정중하며 적극적인 표준 한국어 문장으로 다듬어 주세요.
3. 보기 쉽게 1~2개의 명확한 문장으로 완성해 주세요.
4. 부가 설명이나 인사말 없이, 완결된 이력서 문장만 결과로 출력하세요.
    `.trim();

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
    });

    const polishedText = response.text?.trim() || rawText;
    res.json({ polishedText });
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    res.status(500).json({ 
      error: error.message || "문장 다듬기 중 오류가 발생했습니다.",
      fallback: req.body?.rawText || "" 
    });
  }
});



async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

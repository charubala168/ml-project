import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialize Gemini AI client
let aiClient: GoogleGenAI | null = null;
function getGeminiAI(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
}

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// AI Exam Revision Breakdown Endpoint
app.post("/api/ai-breakdown", async (req, res) => {
  const { examTitle, subject, topics, targetGrade, availableHours, studentMood } = req.body;

  try {
    const ai = getGeminiAI();
    if (!ai) {
      // Heuristic fallback if Gemini API key is not configured
      return res.json({
        success: true,
        source: "fallback",
        plan: generateFallbackPlan(examTitle, subject, topics, availableHours),
      });
    }

    const prompt = `You are an expert academic advisor and study planner. 
Generate a focused, structured exam revision schedule and task breakdown for a student.

Exam: ${examTitle}
Subject: ${subject}
Topics/Syllabus: ${topics && topics.length > 0 ? topics.join(", ") : "Comprehensive overview"}
Target Grade: ${targetGrade || "A"}
Available Study Hours: ${availableHours || 6} hours
Current Student State/Mood: ${studentMood || "focused"}

Respond with a valid JSON array of revision tasks. Each item MUST have:
- "name": string (concise, actionable revision task name, e.g. "Active Recall: Cell Signaling Pathways")
- "mins": number (estimated minutes, between 25 and 60)
- "pri": "high" | "med" | "low"
- "category": "Revision" | "Practice Exam" | "Flashcards" | "Problem Set" | "Summary Notes"
- "tips": string (one short, powerful study technique tip, e.g. "Feynman technique: explain aloud without notes")

Return ONLY the raw JSON array (no markdown code blocks, no preamble).`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
    });

    const text = response.text || "";
    // Clean potential markdown blocks
    const cleaned = text.replace(/```json\n?|\n?```/g, "").trim();
    try {
      const parsed = JSON.parse(cleaned);
      return res.json({ success: true, source: "gemini", plan: parsed });
    } catch {
      return res.json({
        success: true,
        source: "fallback",
        plan: generateFallbackPlan(examTitle, subject, topics, availableHours),
      });
    }
  } catch (err: any) {
    console.error("Gemini API error:", err?.message || err);
    return res.json({
      success: true,
      source: "fallback",
      plan: generateFallbackPlan(examTitle, subject, topics, availableHours),
    });
  }
});

// Heuristic fallback generator
function generateFallbackPlan(
  examTitle: string,
  subject: string,
  topics?: string[],
  availableHours?: number
) {
  const topicList = topics && topics.length > 0
    ? topics
    : ["Core Fundamentals & Key Formulas", "High-Yield Practice Questions", "Past Paper Simulation", "Weak Area Target Review"];

  const categories = ["Revision", "Practice Exam", "Problem Set", "Flashcards", "Summary Notes"] as const;

  return topicList.map((topic, i) => ({
    name: `${subject ? `[${subject}] ` : ""}Mastery: ${topic}`,
    mins: i === 0 ? 45 : i === topicList.length - 1 ? 50 : 35,
    pri: i === 0 || i === topicList.length - 1 ? "high" : "med",
    category: categories[i % categories.length],
    tips: i % 2 === 0
      ? "Use active recall: write down everything you remember before checking notes."
      : "Time-box yourself on 3 practice problems under timed conditions.",
  }));
}

// Vite middleware setup
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
    console.log(`Study Planner Server running on http://localhost:${PORT}`);
  });
}

startServer();

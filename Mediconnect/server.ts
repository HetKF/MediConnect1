import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", service: "MediConnect Hospital Command Center API" });
  });

  // Server-side Gemini AI Operations Advisor endpoint
  app.post("/api/ai-ops-advisor", async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(200).json({
          success: false,
          error: "GEMINI_API_KEY is not configured.",
          fallbackInsight: "MediConnect Local Rule-Based Heuristic: Prioritize emergency transfers to ICU B, prepare reserve O2 manifolds, and expedite Step-down telemetry discharges."
        });
      }

      const { prompt, operationalState } = req.body;
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const systemInstruction = `You are the chief AI Clinical Operations Officer for CityCare Multi-Speciality Hospital, powering MediConnect's Command Center. 
Your role is to analyze hospital operational telemetry (bed occupancy, ED admissions, ICU load, Oxygen reserves, ECMO availability, OT surgical schedules, and bottlenecks) and provide sharp, actionable, evidence-based recommendations.
Format responses cleanly with clear headings, bullet points, risk tiers (Critical/High/Moderate), and specific department action items. Keep the tone clinical, decisive, and calm.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: `Current Hospital Status:\n${JSON.stringify(operationalState || {}, null, 2)}\n\nQuery/Scenario: ${prompt || "Generate immediate priority resource allocation actions for the current shift."}`,
        config: {
          systemInstruction,
          temperature: 0.3,
        }
      });

      res.json({
        success: true,
        analysis: response.text,
      });
    } catch (err: any) {
      console.error("Error in AI Ops Advisor:", err);
      res.status(500).json({
        success: false,
        error: err.message || "Failed to generate AI operational analysis.",
        fallbackInsight: "MediConnect Offline Diagnostic: Critical bottlenecks detected in ICU A (92% occupancy) and ED Surge (+24%). Immediate action: Activate overflow bay 4 and dispatch 12 O2 reserve cylinders to Block B."
      });
    }
  });

  // Vite middleware for development or static file serving for production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`MediConnect Command Center Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import * as genai from "@google/genai";
import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const getMailTransporter = () => {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) return null;
  return nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT || 465),
    secure: process.env.SMTP_PORT === "465",
    auth: { user, pass },
    tls: { rejectUnauthorized: false }
  });
};

app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", ai: !!process.env.GEMINI_API_KEY });
});

app.post("/api/ai/notify-event", async (req, res) => {
  const { event } = req.body;
  const aiKey = process.env.GEMINI_API_KEY;
  const results = [];

  try {
    const transporter = getMailTransporter();
    
    // AI Content generation
    let emailHtml = `<p>Notificação de Evento EAV: ${event?.title}</p>`;
    if (aiKey) {
      try {
        const client = new genai.GoogleGenAI({ apiKey: aiKey });
        const model = client.models.get("gemini-1.5-flash");
        const result = await model.generateContent({
          contents: [{ role: "user", parts: [{ text: `Escreva um e-mail sobre o evento ${event?.title}. Retorne HTML.` }] }]
        });
        emailHtml = result.text || emailHtml;
      } catch (e) {
        console.error("AI Error:", e);
      }
    }

    // Attempt to send
    if (transporter && event) {
      try {
        await transporter.sendMail({
          from: process.env.SMTP_FROM || process.env.SMTP_USER,
          to: "esribeirojunior@gmail.com",
          subject: `[EAV] ${event.title}`,
          html: emailHtml
        });
        results.push({ status: "sent", to: "esribeirojunior@gmail.com" });
      } catch (err) {
        console.error("Mail Error:", err);
      }
    }

    res.json({ success: true, notifications: results });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: "spa" });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(process.cwd(), "dist")));
    app.get("*", (req, res) => res.sendFile(path.join(process.cwd(), "dist", "index.html")));
  }
  app.listen(PORT, "0.0.0.0", () => console.log(`Server running on port ${PORT}`));
}

startServer();

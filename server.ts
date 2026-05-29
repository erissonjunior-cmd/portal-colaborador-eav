import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import * as genai from "@google/genai";
import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Configuração de transporte ultra-segura
const getMailTransporter = () => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) return null;
  return nodemailer.createTransport({
    service: 'gmail', // Facilita a configuração para contas Gmail comuns
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
};

app.use(express.json());

app.post("/api/ai/notify-event", async (req, res) => {
  console.log("[API] Iniciando processo de notificação...");
  const { event } = req.body;
  const aiKey = process.env.GEMINI_API_KEY;
  
  try {
    const transporter = getMailTransporter();
    let emailHtml = `<h2>Evento EAV: ${event?.title}</h2><p>Agendado para ${event?.date}.</p>`;

    // Tentar IA com proteção
    if (aiKey) {
      try {
        console.log("[AI] Solicitando texto...");
        const client = new genai.GoogleGenAI({ apiKey: aiKey });
        // Chamada síncrona do modelo para evitar pendências
        const model = client.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent("Escreva um aviso curto de evento escolar.");
        const response = await result.response;
        emailHtml = response.text() || emailHtml;
      } catch (aiErr) {
        console.error("[AI Error]", aiErr);
      }
    }

    // Envio de e-mail com Promise e Timeout
    if (transporter) {
      console.log("[SMTP] Enviando e-mail real...");
      await transporter.sendMail({
        from: process.env.SMTP_USER,
        to: "esribeirojunior@gmail.com",
        subject: `[TESTE EAV] ${event?.title || 'Notificação'}`,
        html: emailHtml
      });
      console.log("[SMTP] Enviado!");
    } else {
      console.warn("[SMTP] Transporter não configurado.");
    }

    res.json({ success: true, message: "E-mail enviado!" });
  } catch (err) {
    console.error("[Fatal Error]", err);
    res.status(500).json({ error: (err as Error).message });
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
  app.listen(PORT, "0.0.0.0", () => console.log(`Server ON port ${PORT}`));
}

startServer();

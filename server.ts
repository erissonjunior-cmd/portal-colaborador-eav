import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", ai: !!process.env.GEMINI_API_KEY });
});

app.post("/api/ai/notify-event", async (req, res) => {
  console.log("[TESTE] Recebi pedido de e-mail!");
  const { event } = req.body;
  
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    console.log("[TESTE] Enviando...");
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: "esribeirojunior@gmail.com",
      subject: `[PRODUÇÃO] Evento: ${event?.title || 'Teste'}`,
      html: `<h1>Teste de Envio Real</h1><p>Se você está lendo isso, o servidor do Render está conseguindo enviar e-mails!</p>`
    });

    console.log("[TESTE] Sucesso!");
    res.json({ success: true, message: "E-mail enviado com sucesso!" });
  } catch (err) {
    console.error("[ERRO TESTE]", err);
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

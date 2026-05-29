import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// SMTP Selection logic
const getMailTransporter = () => {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) return null;

  return nodemailer.createTransport({
    host,
    port: Number(port || 465),
    secure: port === "465",
    auth: { user, pass },
    tls: { rejectUnauthorized: false }
  });
};

app.use(express.json());

// API health
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", api_key: !!process.env.GEMINI_API_KEY });
});

// API Notify
app.post("/api/ai/notify-event", async (req, res) => {
  const { event, sectorEmails } = req.body;
  const aiKey = process.env.GEMINI_API_KEY;
  let results = [];

  try {
    const transporter = getMailTransporter();
    const demands = event.demands || [{ sectorName: "Geral", responsiblePerson: "Equipe", demandDescription: "Apoio logístico" }];

    for (const demand of demands) {
      let subject = `[EAV Notificação] ${event.title}`;
      let htmlBody = `<p>Notificação automática para o setor ${demand.sectorName}.</p>`;
      
      // Try AI if key exists
      if (aiKey) {
        try {
          const genAI = new GoogleGenAI({ apiKey: aiKey });
          const model = genAI.models.get("gemini-1.5-flash");
          const result = await model.generateContent({
             contents: [{ role: "user", parts: [{ text: `Escreva um e-mail formal em português sobre o evento "${event.title}" para o setor "${demand.sectorName}". Retorne apenas o corpo em HTML.` }] }]
          });
          htmlBody = result.text || htmlBody;
        } catch (e) { 
          console.error("AI Error:", e);
        }
      }

      // Determine recipient
      const recipient = (sectorEmails && sectorEmails[demand.sectorName] && sectorEmails[demand.sectorName][0]) || "ti@escolaamericana.com.br";

      // Send mail
      if (transporter) {
        try {
          await transporter.sendMail({
            from: process.env.SMTP_FROM || `"Portal EAV" <${process.env.SMTP_USER}>`,
            to: recipient,
            subject: subject,
            html: htmlBody
          });
        } catch (mailErr) {
          console.error("Mail Error:", mailErr);
        }
      }

      results.push({
        recipientEmail: recipient,
        status: transporter ? "success" : "simulated",
        isSimulated: !transporter
      });
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
  app.listen(PORT, "0.0.0.0", () => console.log(`Server on port ${PORT}`));
}

startServer();

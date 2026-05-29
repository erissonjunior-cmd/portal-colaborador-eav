import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

// Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', ai: !!process.env.GEMINI_API_KEY });
});

// Endpoint de envio
app.post('/api/ai/notify-event', async (req, res) => {
  const { event } = req.body;
  console.log("[SMTP] Tentando enviar e-mail para esribeirojunior@gmail.com...");
  
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: 'esribeirojunior@gmail.com',
      subject: `[PRODUÇÃO EAV] Teste: ${event?.title || 'Notificação'}`,
      html: `<h2>Portal do Colaborador EAV</h2><p>Servidor Vivo e Conectado!</p>`
    });

    console.log("[SMTP] Sucesso!");
    res.json({ success: true });
  } catch (err) {
    console.error("[SMTP ERROR]", err);
    res.status(500).json({ error: err.message });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor ESM rodando na porta ${PORT}`);
});

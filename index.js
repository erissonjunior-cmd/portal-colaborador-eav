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

app.get('/api/status', (req, res) => {
  res.json({
    online: true,
    email_config: !!process.env.SMTP_USER,
    ai_config: !!process.env.GEMINI_API_KEY
  });
});

app.post('/api/dispatch', async (req, res) => {
  const { event, recipient } = req.body;
  console.log(`[DISPATCH] Iniciando: ${event?.title}`);

  try {
    let finalHtml = `<h2>${event?.title}</h2><p>Data: ${event?.date}</p>`;
    
    // IA - Com proteção absoluta contra falhas de rede
    if (process.env.GEMINI_API_KEY) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;
        const aiResponse = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: `Escreva um e-mail para o evento ${event?.title}. Retorne APENAS HTML.` }] }]
          })
        });

        if (aiResponse.ok) {
          const data = await aiResponse.json();
          if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
            finalHtml = data.candidates[0].content.parts[0].text;
          }
        }
      } catch (aiErr) {
        console.error("AI Bypass:", aiErr.message);
      }
    }

    // SMTP - Com proteção absoluta
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        throw new Error("Credenciais SMTP ausentes no Render.");
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    await transporter.sendMail({
      from: `"Portal EAV" <${process.env.SMTP_USER}>`,
      to: recipient || 'esribeirojunior@gmail.com',
      subject: `[EAV] ${event?.title}`,
      html: finalHtml
    });

    res.json({ success: true, notifications: [{ id: Date.now().toString(), status: 'success', eventTitle: event?.title, htmlBody: finalHtml, recipientEmail: recipient }] });

  } catch (error) {
    console.error("Erro no Dispatch:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

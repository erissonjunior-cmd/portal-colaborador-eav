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
  const log = (msg) => console.log(`[DISPATCH] ${msg}`);

  try {
    log(`Iniciando fluxo para: ${recipient || 'esribeirojunior@gmail.com'}`);

    let finalHtml = `<h2>${event?.title || 'Comunicado Escolar'}</h2><p>Agendado para: ${event?.date}</p>`;
    
    // CHAMADA DIRETA AO GOOGLE (Sem SDK travando)
    if (process.env.GEMINI_API_KEY) {
      try {
        log("Solicitando IA via API Direta...");
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;
        
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: `Escreva um e-mail formal sobre o evento "${event?.title}". Retorne apenas o corpo em HTML.` }] }]
          })
        });

        const data = await response.json();
        if (data.candidates && data.candidates[0].content.parts[0].text) {
          finalHtml = data.candidates[0].content.parts[0].text;
          log("IA respondeu com sucesso!");
        }
      } catch (aiErr) {
        log(`IA Direct falhou: ${aiErr.message}`);
      }
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
      subject: `[EAV] Notificação: ${event?.title || 'Comunicado'}`,
      html: finalHtml
    });

    log("Envio concluído!");
    res.json({ success: true, notifications: [{ id: `m-${Date.now()}`, status: 'success', eventTitle: event?.title, sentAt: new Date().toISOString(), htmlBody: finalHtml, recipientEmail: recipient || 'esribeirojunior@gmail.com', subject: `[EAV] Notificação: ${event?.title}`, isSimulated: false, recipientSector: 'Geral' }] });

  } catch (error) {
    log(`ERRO: ${error.message}`);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 HUB EAV ONLINE NA PORTA ${PORT}`);
});

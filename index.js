import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import nodemailer from 'nodemailer';
import { GoogleGenAI } from "@google/genai";
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

// NOVO: Rota de Status Consolidada
app.get('/api/status', (req, res) => {
  res.json({
    online: true,
    email_config: !!process.env.SMTP_USER,
    ai_config: !!process.env.GEMINI_API_KEY,
    environment: process.env.NODE_ENV || 'production'
  });
});

// NOVO: Motor de Disparo Reformulado
app.post('/api/dispatch', async (req, res) => {
  const { event, recipient } = req.body;
  const log = (msg) => console.log(`[DISPATCH] ${msg}`);

  try {
    log(`Iniciando fluxo para: ${recipient || 'esribeirojunior@gmail.com'}`);

    // 1. Geração de Conteúdo via IA (Se disponível)
    let finalHtml = `<h2>${event?.title || 'Comunicado Escolar'}</h2><p>Agendado para: ${event?.date}</p>`;
    
    if (process.env.GEMINI_API_KEY) {
      try {
        log("Solicitando IA...");
        const genAI = new GoogleGenAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const prompt = `Escreva um e-mail formal e elegante sobre o evento "${event?.title}" para ser enviado pela Escola Americana. Use HTML inline elegante.`;
        const result = await model.generateContent(prompt);
        const response = await result.response;
        finalHtml = response.text() || finalHtml;
      } catch (aiErr) {
        log(`IA falhou: ${aiErr.message}. Usando template padrão.`);
      }
    }

    // 2. Conexão e Envio via SMTP
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
      subject: `[EAV] Notificação: ${event?.title || 'Assunto Geral'}`,
      html: finalHtml
    });

    log("Envio concluído com sucesso!");
    res.json({ 
      success: true, 
      notifications: [{
        id: `mail-${Date.now()}`,
        eventId: event?.id,
        eventTitle: event?.title,
        recipientEmail: recipient || 'esribeirojunior@gmail.com',
        recipientSector: 'TI/Operacional',
        status: 'success',
        sentAt: new Date().toISOString(),
        htmlBody: finalHtml,
        subject: `[EAV] Notificação: ${event?.title || 'Assunto Geral'}`,
        isSimulated: false
      }]
    });

  } catch (error) {
    log(`ERRO FATAL: ${error.message}`);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Serve frontend para qualquer outra rota
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 NOVO HUB EAV ONLINE NA PORTA ${PORT}`);
});

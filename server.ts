import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config();

const app = express();
const PORT = 3000;

// Lazy SMTP transporter selection
const getMailTransporter = () => {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port: Number(port || 587),
    secure: port === "465",
    auth: {
      user,
      pass,
    },
    tls: {
      // Allow self-signed or standard certificates common on private school servers
      rejectUnauthorized: false
    }
  });
};


// Body parser middleware
app.use(express.json());

// Helper to construct contact email addresses for EAV school departments
const getSectorEmail = (sectorName: string): string => {
  const normalized = sectorName
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove diacritics
    .replace(/[^a-z0-9]/g, "-") // replace symbols with hyphen
    .replace(/-+/g, "-") // remove multiple hyphens
    .replace(/^-|-$/g, ""); // trim hyphens

  return `${normalized || "contato"}@escolaamericana.com.br`;
};

// Lazy initialization of GenAI Client
const getGenAIClient = () => {
  const key = process.env.GEMINI_API_KEY;
  if (!key || key.includes("MY_GEMINI_API_KEY")) {
    return null;
  }
  return new GoogleGenAI({
    apiKey: key,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
};

// API: Health probe
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "ok", 
    timestamp: new Date().toISOString(),
    api_key_configured: !!process.env.GEMINI_API_KEY && !process.env.GEMINI_API_KEY.includes("MY_GEMINI_API_KEY")
  });
});

// API: Generate notification drafts using Gemini AI
app.post("/api/ai/notify-event", async (req, res) => {
  try {
    const { event, sectorEmails } = req.body;
    if (!event) {
      return res.status(400).json({ error: "Dados do evento não foram fornecidos." });
    }

    const ai = getGenAIClient();
    const demands = event.demands || [];

    // If there are no demands, we can still generate a general advisory broadcast
    const demandsToProcess = demands.length > 0 
      ? demands 
      : [{ sectorName: "Todos os Setores (Geral)", responsiblePerson: "Colaboradores EAV", demandDescription: "Fique por dentro do cronograma do evento escolar e apoie na logística local se necessário." }];

    const results = [];

    for (const demand of demandsToProcess) {
      // Extract base sector name (e.g. "TI (Gustavo)" -> "TI") to match sectorEmails dictionary keys
      let baseSector = demand.sectorName;
      if (sectorEmails) {
        for (const sector of Object.keys(sectorEmails)) {
          if (demand.sectorName.startsWith(sector)) {
            baseSector = sector;
            break;
          }
        }
      }

      // Determine emails addresses to use, falling back to standard dynamically generated address if empty
      const emailsList = sectorEmails && sectorEmails[baseSector] && sectorEmails[baseSector].length > 0
        ? sectorEmails[baseSector]
        : [getSectorEmail(demand.sectorName)];

      for (const email of emailsList) {
        let subject = `[EAV Notificação de IA] Alinhamento Logístico: ${event.title}`;
        let htmlBody = "";
        let isSimulated = false;

        // Base mock template in case GenAI Client is missing with brand-original Escola Americana de Vitória colors
        const fallbackHtml = `
          <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #E6E1DA; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
            <div style="background-color: #0F1D3A; padding: 24px; color: white;">
              <p style="margin: 0; font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; color: #E6E1DA;">Escola Americana de Vitória</p>
              <h2 style="margin: 6px 0 0 0; font-family: Georgia, serif; font-size: 20px; font-weight: bold;">Notificação Operacional de Evento</h2>
            </div>
            <div style="padding: 24px; background-color: #FAF9F6; color: #1E293B; line-height: 1.6;">
              <p style="margin-top: 0; font-size: 14px;">Prezado(a) <strong>${demand.responsiblePerson || "Colaborador"}</strong>,</p>
              <p style="font-size: 14px;">Gostaríamos de notificar que o setor <strong>${event.responsibleSector}</strong> agendou um evento institucional na Escola Americana de Vitória (EAV). Sua equipe no setor de <strong>${demand.sectorName}</strong> foi solicitada como parceira estratégica para a logística.</p>
              
              <div style="background-color: white; border: 1px solid #E6E1DA; border-radius: 6px; padding: 18px; margin: 20px 0; font-size: 13.5px;">
                <h3 style="margin-top: 0; color: #0F1D3A; font-size: 15px; border-bottom: 1px solid #E6E1DA; padding-bottom: 8px; font-family: Georgia, serif; font-weight: bold;">Ficha de Informações Técnicas</h3>
                <p style="margin: 8px 0;"><strong>Nome do Evento:</strong> ${event.title}</p>
                <p style="margin: 8px 0;"><strong>Data de Execução:</strong> ${event.date}</p>
                <p style="margin: 8px 0;"><strong>Horário de Reserva:</strong> das ${event.startTime}h às ${event.endTime}h</p>
                <p style="margin: 8px 0;"><strong>Unidade Campus:</strong> Campus ${event.campus || "Vitória"}</p>
                <p style="margin: 8px 0;"><strong>Local Físico:</strong> ${event.location}</p>
                <p style="margin: 8px 0;"><strong>Estimativa de Público:</strong> ${event.audienceEstimate || "Sem estimativa registrada"}</p>
              </div>

              <div style="background-color: #FAF9F6; border-left: 4px solid #A31E32; padding: 16px; margin: 20px 0; font-size: 14px; border-radius: 4px;">
                <strong style="color: #A31E32; display: block; margin-bottom: 4px;">Sua Atribuição / Demanda Demandada:</strong>
                <p style="margin: 0; font-style: italic;">"${demand.demandDescription}"</p>
              </div>

              <p style="font-size: 13px; color: #64748B;">Este e-mail está configurado para ser entregue nas caixas de correio cadastradas para as comunicações automáticas de <strong>${demand.sectorName}</strong>.</p>
              <p style="font-size: 14px; margin-top: 15px; margin-bottom: 0;">Atenciosamente,<br/><strong style="color: #0F1D3A;">Portal do Colaborador EAV (Hub IA)</strong><br/><span style="font-size: 12px; color: #64748B;">Escola Americana de Vitória</span></p>
            </div>
            <div style="background-color: #E6E1DA; padding: 12px 24px; text-align: center; font-size: 11px; color: #1E293B; border-top: 1px solid #E6E1DA;">
              &copy; 2026 Escola Americana de Vitória - Sistema de Informação Integrado
            </div>
          </div>
        `;

        if (ai) {
          try {
            // Real call to Gemini API using GoogleGenAI SDK
            const prompt = `Você é o Assistente de Orquestração por IA da Escola Americana de Vitória (EAV).
            Escreva uma notificação por e-mail formal, cativante e de alta precisão técnica em português para o setor "${demand.sectorName}" (Responsável da atividade: ${demand.responsiblePerson}) sobre um evento escolar agendado.
            
            Detalhes completos do evento:
            - Título do Evento: "${event.title}"
            - Setor Solicitante do Evento: "${event.responsibleSector}" (Solicitado por: ${event.requester || "Suporte de Gestão"})
            - Data do Evento: ${event.date}
            - Horário de Reserva: das ${event.startTime}h às ${event.endTime}h
            - Campus: Campus ${event.campus || "Vitória"}
            - Local do Evento: ${event.location}
            - Objetivo Pedagógico/Institucional: "${event.objective}"
            - Público Estimado: ${event.audienceEstimate}
            
            O setor recebendo esta mensagem (${demand.sectorName}) deve apoiar executando esta demanda logística específica:
            "${demand.demandDescription}"
            
            Instruções de Estilo e Conteúdo:
            1. Retorne um e-mail com assunto profissional que comece com "[EAV Notificação IA]".
            2. Comece saudando formalmente o responsável "${demand.responsiblePerson}" e a equipe de "${demand.sectorName}".
            3. Escreva um parágrafo que explique as especificidades fundamentais da operação e por que o trabalho deles é indispensável para o sucesso deste evento escolar.
            4. Adicione uma tabela ou bloco de resumo em HTML estilizado para que eles batam o olho e vejam todos os horários e locais perfeitamente.
            5. Use cores institucionais nos estilos inline HTML (Azul Escuro Real: #0F1D3A, Vermelho Borgonha: #A31E32, Fundo Claro: #FAF9F6, Escrito Escuro: #1E293B).
            6. Termine com uma assinatura formal recomendada do Portal Integrado de IA da EAV de Vitória.
            
            ATENÇÃO: Retorne estritamente um código JSON válido contendo exatamente as chaves "subject" (uma string) e "htmlBody" (o corpo do e-mail em HTML limpo, bem estilizado inline). NÃO retorne markdown ao redor ou fora do objeto JSON.`;

            const response = await ai.models.generateContent({
              model: "gemini-3.5-flash",
              contents: prompt,
              config: {
                responseMimeType: "application/json",
                responseSchema: {
                  type: Type.OBJECT,
                  properties: {
                    subject: { type: Type.STRING },
                    htmlBody: { type: Type.STRING }
                  },
                  required: ["subject", "htmlBody"]
                }
              }
            });

            if (response.text) {
              const parsed = JSON.parse(response.text.trim());
              subject = parsed.subject || subject;
              htmlBody = parsed.htmlBody || fallbackHtml;
            } else {
              htmlBody = fallbackHtml;
              isSimulated = true;
            }
          } catch (apiError) {
            console.error("Gemini call failed, falling back to rich simulation template:", apiError);
            htmlBody = fallbackHtml;
            isSimulated = true;
          }
        } else {
          // Safe interactive preview fallback when no GEMINI_API_KEY is configured
          htmlBody = fallbackHtml;
          isSimulated = true;
        }

        // If an SMTP transporter is configured, dispatch the real email
        let sentRealEmail = false;
        let smtpError: string | null = null;
        const transporter = getMailTransporter();
        
        if (transporter) {
          try {
            console.log(`[SMTP] Disparando e-mail real para: ${email}`);
            await transporter.sendMail({
              from: process.env.SMTP_FROM || `"Portal EAV (Sistemas Internos)" <notificacoes@escolaamericana.com.br>`,
              to: email,
              subject: subject,
              html: htmlBody
            });
            sentRealEmail = true;
          } catch (err: any) {
            console.error(`[SMTP] Falha no disparo do e-mail real para ${email}:`, err);
            smtpError = err.message || String(err);
          }
        }

        results.push({
          id: `mail-${Math.random().toString(36).substr(2, 9)}`,
          eventId: event.id,
          eventTitle: event.title,
          recipientSector: demand.sectorName,
          recipientPerson: demand.responsiblePerson,
          recipientEmail: email,
          subject,
          htmlBody,
          sentAt: new Date().toISOString(),
          status: transporter ? (sentRealEmail ? "success" : "failed") : "success",
          isSimulated: !sentRealEmail,
          smtpError
        });
      }
    }

    res.json({ success: true, notifications: results });
  } catch (error: any) {
    console.error("Endpoint error:", error);
    res.status(500).json({ error: error.message || "Erro interno ao processar as notificações por IA." });
  }
});

// Serve frontend assets
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
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`EAV Collaborator Server running dynamically on http://0.0.0.0:${PORT}`);
  });
}

startServer();

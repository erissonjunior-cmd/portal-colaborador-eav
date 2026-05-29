/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Send, 
  Mail, 
  User, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Eye, 
  RefreshCw, 
  Layers, 
  ShieldCheck, 
  Building, 
  Clipboard, 
  MailCheck,
  Search,
  Check,
  ChevronRight,
  Trash2
} from 'lucide-react';
import { SchoolEvent, SectorEmails } from '../types';

interface AiNotificationHubProps {
  events: SchoolEvent[];
  sectorEmails: SectorEmails;
}

export interface AiMailLog {
  id: string;
  eventId: string;
  eventTitle: string;
  recipientSector: string;
  recipientPerson: string;
  recipientEmail: string;
  subject: string;
  htmlBody: string;
  sentAt: string;
  status: 'success' | 'failed';
  isSimulated: boolean;
  smtpError?: string;
}

export default function AiNotificationHub({ events, sectorEmails }: AiNotificationHubProps) {
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [logs, setLogs] = useState<AiMailLog[]>([]);
  const [selectedLogId, setSelectedLogId] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMess, setErrorMess] = useState<string>('');
  const [successMess, setSuccessMess] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [apiStatusChecked, setApiStatusChecked] = useState<boolean | null>(null);

  // Load initial logs or cached history
  useEffect(() => {
    const cached = localStorage.getItem('eav_ai_mail_logs');
    if (cached) {
      const parsedLogs = JSON.parse(cached);
      setLogs(parsedLogs);
      if (parsedLogs.length > 0) {
        setSelectedLogId(parsedLogs[0].id);
      }
    } else {
      // Pre-populate with realistic EAV history for an elegant first-look
      const initialLogs: AiMailLog[] = [
        {
          id: 'initial-1',
          eventId: '1',
          eventTitle: 'Alinhamento Técnico: NASA Science Trip',
          recipientSector: 'TI',
          recipientPerson: 'Professor Gustavo Fortes',
          recipientEmail: 'ti@escolaamericana.com.br',
          subject: '[EAV Notificação de IA] Alinhamento Técnico de TI: NASA Science Trip',
          htmlBody: `
            <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #E5E1DA; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
              <div style="background-color: #3E5C52; padding: 24px; color: white;">
                <p style="margin: 0; font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; color: #E7C286;">Portal do Colaborador EAV</p>
                <h2 style="margin: 6px 0 0 0; font-family: Georgia, serif; font-size: 20px; font-weight: bold;">Notificação Operacional de Evento</h2>
              </div>
              <div style="padding: 24px; background-color: #FCFBFA; color: #2C2C2C; line-height: 1.6;">
                <p style="margin-top: 0; font-size: 14px;">Prezado(a) <strong>Professor Gustavo Fortes</strong>,</p>
                <p style="font-size: 14px;">A diretoria pedagógica agendou a palestra de alinhamento com os pais sobre a viagem à NASA. Sua equipe de <strong>TI</strong> foi listada como coparceira estratégica para a infraestrutura.</p>
                
                <div style="background-color: white; border: 1px solid #E5E1DA; border-radius: 6px; padding: 18px; margin: 20px 0; font-size: 13.5px;">
                  <h3 style="margin-top: 0; color: #3E5C52; font-size: 15px; border-bottom: 1px solid #F0EDE9; padding-bottom: 8px; font-family: Georgia, serif;">Ficha do Evento</h3>
                  <p style="margin: 8px 0;"><strong>Nome do Evento:</strong> Realimentação da Missão NASA</p>
                  <p style="margin: 8px 0;"><strong>Data de Execução:</strong> 29/05/2026</p>
                  <p style="margin: 8px 0;"><strong>Horário de Reserva:</strong> 08:00h às 09:30h</p>
                  <p style="margin: 8px 0;"><strong>Campus:</strong> Campus Vitória</p>
                  <p style="margin: 8px 0;"><strong>Local Físico:</strong> Multiuso Arts Center</p>
                </div>

                <div style="background-color: #FAF8F5; border-left: 4px solid #DF7A27; padding: 16px; margin: 20px 0; font-size: 14px; border-radius: 4px;">
                  <strong style="color: #DF7A27; display: block; margin-bottom: 4px;">Demanda de TI a ser Executada:</strong>
                  <p style="margin: 0; font-style: italic;">"Preparar e testar 3 microfones lapela sem fio, projetor multimídia calibrado com a apresentação de slides de suporte e realizar passagem de som técnica às 07:30h."</p>
                </div>

                <p style="font-size: 14px;">Contamos com a presteza e o padrão de excelência técnica habitual da equipe de TI do Campus Vitória para enriquecer a experiência das famílias visitantes.</p>
                <p style="font-size: 14px; margin-bottom: 0;">Atenciosamente,<br/><strong style="color: #3E5C52;">Portal do Colaborador EAV (Hub IA)</strong><br/><span style="font-size: 12px; color: #8F8B83;">Escola Americana de Vitória</span></p>
              </div>
            </div>
          `,
          sentAt: new Date(Date.now() - 3600000 * 2.5).toISOString(),
          status: 'success',
          isSimulated: true
        },
        {
          id: 'initial-2',
          eventId: '2',
          eventTitle: 'Briefing Pedagógico: Admissions Day',
          recipientSector: 'Coordenação de Marketing',
          recipientPerson: 'Renata Vasconcellos',
          recipientEmail: 'coordenacao-de-marketing@escolaamericana.com.br',
          subject: '[EAV Notificação de IA] Briefing Comunicacional: Admissions Day (Campus Álvares)',
          htmlBody: `
            <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #E5E1DA; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
              <div style="background-color: #DF7A27; padding: 24px; color: white;">
                <p style="margin: 0; font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; color: white;">Portal do Colaborador EAV</p>
                <h2 style="margin: 6px 0 0 0; font-family: Georgia, serif; font-size: 20px; font-weight: bold;">Alinhamento Estratégico de Comunicação</h2>
              </div>
              <div style="padding: 24px; background-color: #FCFBFA; color: #2C2C2C; line-height: 1.6;">
                <p style="margin-top: 0; font-size: 14px;">Prezada <strong>Renata Vasconcellos</strong>,</p>
                <p style="font-size: 14px;">O setor escolar acadêmico agendou o Admissions Day internacional. Sua equipe foi designada para apoiar na identidade visual do campus.</p>
                
                <div style="background-color: white; border: 1px solid #E5E1DA; border-radius: 6px; padding: 18px; margin: 20px 0; font-size: 13.5px;">
                  <h3 style="margin-top: 0; color: #DF7A27; font-size: 15px; border-bottom: 1px solid #F0EDE9; padding-bottom: 8px; font-family: Georgia, serif;">Ficha do Admissions Day</h3>
                  <p style="margin: 8px 0;"><strong>Data de Execução:</strong> 30/05/2026</p>
                  <p style="margin: 8px 0;"><strong>Horário de Reserva:</strong> 10:00h às 12:00h</p>
                  <p style="margin: 8px 0;"><strong>Campus:</strong> Campus Álvares</p>
                  <p style="margin: 8px 0;"><strong>Local de Recepção:</strong> Auditório Principal</p>
                </div>

                <div style="background-color: #FAF8F5; border-left: 4px solid #3E5C52; padding: 16px; margin: 20px 0; font-size: 14px; border-radius: 4px;">
                  <strong style="color: #3E5C52; display: block; margin-bottom: 4px;">Demanda de Marketing Solicitada:</strong>
                  <p style="margin: 0; font-style: italic;">"Instalar banners institucionais bilíngues no hall de entrada e preparar as sacolas ecológicas de presentes (EAV Welcome Kit) para entrega física aos pais na abertura."</p>
                </div>

                <p style="font-size: 14px; margin-bottom: 0;">Atenciosamente,<br/><strong style="color: #3E5C52;">Portal de IA - Escola Americana de Vitória</strong></p>
              </div>
            </div>
          `,
          sentAt: new Date(Date.now() - 3600000 * 24).toISOString(),
          status: 'success',
          isSimulated: true
        }
      ];
      setLogs(initialLogs);
      setSelectedLogId(initialLogs[0].id);
      localStorage.setItem('eav_ai_mail_logs', JSON.stringify(initialLogs));
    }

    // Default choice
    if (events.length > 0) {
      setSelectedEventId(events[0].id);
    }

    // Check backend API status
    fetch('/api/status')
      .then(r => r.json())
      .then(data => {
        setApiStatusChecked(data.ai_config);
      })
      .catch(() => setApiStatusChecked(false));
  }, [events]);

  const saveLogs = (newLogs: AiMailLog[]) => {
    setLogs(newLogs);
    localStorage.setItem('eav_ai_mail_logs', JSON.stringify(newLogs));
  };

  const handleClearHistory = () => {
    if (confirm("Tem certeza que deseja limpar o histórico de e-mails enviados pela IA? Isso não excluirá seus eventos.")) {
      saveLogs([]);
      setSelectedLogId('');
    }
  };

  const handleSendAiNotifications = async () => {
    if (!selectedEventId) {
      setErrorMess("Por favor, selecione um evento válido para processar.");
      return;
    }

    const eventToNotify = events.find(e => e.id === selectedEventId);
    if (!eventToNotify) {
      setErrorMess("Erro: Evento não localizado.");
      return;
    }

    setIsProcessing(true);
    setErrorMess('');
    setSuccessMess('');

    try {
      const response = await fetch('/api/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          event: eventToNotify, 
          recipient: 'esribeirojunior@gmail.com' 
        })
      });

      if (!response.ok) {
        throw new Error("Erro na comunicação com o servidor de IA.");
      }

      const responseData = await response.json();
      if (responseData.success && responseData.notifications) {
        const newNotifications: AiMailLog[] = responseData.notifications;
        const updatedLogs = [...newNotifications, ...logs];
        saveLogs(updatedLogs);
        
        if (newNotifications.length > 0) {
          setSelectedLogId(newNotifications[0].id);
          const wasSimulated = newNotifications.some(n => n.isSimulated);
          if (wasSimulated) {
            setSuccessMess(`IA gerou ${newNotifications.length} e-mails e simulações com sucesso usando modelo sandbox local em português.`);
          } else {
            setSuccessMess(`IA Gemini gerou e enviou com sucesso ${newNotifications.length} e-mails operacionais customizados para os setores demandados.`);
          }
        }
      } else {
        throw new Error(responseData.error || "Ocorreu uma falha inexplicável no orquestrador de IA.");
      }
    } catch (err: any) {
      setErrorMess(`Erro Técnico: ${err.message || 'Falha na resposta do servidor'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const selectedLog = logs.find(l => l.id === selectedLogId);

  // Filters logs according to search query
  const filteredLogs = logs.filter(log => {
    const q = searchTerm.toLowerCase();
    return log.eventTitle.toLowerCase().includes(q) || 
           log.recipientSector.toLowerCase().includes(q) ||
           log.recipientPerson.toLowerCase().includes(q) ||
           log.subject.toLowerCase().includes(q);
  });

  return (
    <div className="max-w-[1240px] mx-auto px-4 sm:px-6 space-y-8" id="ai-hub-container">
      
      {/* 1. Header with AI Branding */}
      <div className="bg-white p-6 sm:p-8 rounded-lg border border-gray-100 shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2.5">
              <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-brand-orange text-white p-1">
                <Sparkles className="w-4.5 h-4.5 animate-pulse" />
              </span>
              <h1 className="font-serif text-3xl font-bold text-brand-blue tracking-tight leading-none">
                Notificações por IA
              </h1>
            </div>
            <p className="text-gray-500 text-xs sm:text-sm max-w-2xl font-sans">
              Utilize o <strong>EAV Mail Assistant (Gemini AI)</strong> para ler a ficha técnica do seu evento, compor comunicados personalizados sob medida em português e simular/disparar ordens de trabalho automáticas diretamente para os e-mails dos setores envolvidos.
            </p>
          </div>

          {/* Gemini API Key Status Card */}
          <div className="flex items-center space-x-3 bg-neutral-50 border border-gray-200 p-3 px-4 rounded-xl text-xs font-sans">
            <div className="space-y-0.5">
              <div className="flex items-center space-x-2 font-bold text-gray-700">
                <ShieldCheck className="w-4.5 h-4.5 text-brand-blue" />
                <span>Status da Conexão Gemini</span>
              </div>
              <div className="text-[10px] text-gray-400">
                {apiStatusChecked === true ? (
                  <span className="text-brand-green font-semibold">● API Principal do Gemini Conectada</span>
                ) : apiStatusChecked === false ? (
                  <span className="text-amber-500 font-semibold">● Modo Sandbox (Simulador EAV Local Ativo)</span>
                ) : (
                  <span>Verificando conexão da IA...</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Interactive Orquestrator Trigger & Dispatcher */}
      <div className="bg-white border border-gray-150 rounded-lg p-5 sm:p-6 font-sans space-y-5 shadow-xs">
        <h3 className="font-serif font-bold text-lg text-brand-blue flex items-center gap-2">
          <Building className="w-5 h-5 text-brand-orange" />
          <span>Disparador de Fluxo Operacional IA</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-end">
          <div className="md:col-span-8 space-y-2">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
              Selecione o Evento Criado no Portal:
            </label>
            <select
              id="ai-event-select"
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="w-full text-xs sm:text-sm bg-neutral-50 border border-gray-300 rounded-lg px-3 py-2.5 focus:bg-white focus:ring-1 focus:ring-brand-blue outline-hidden text-gray-800 font-medium cursor-pointer"
            >
              <option value="" disabled>Escolha um evento da lista institucional para a IA ler...</option>
              {events.map(ev => (
                <option key={ev.id} value={ev.id}>
                  Ref: {ev.id} - {ev.title} (Campus {ev.campus || 'Vitória'} - {ev.date})
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-4 shrink-0">
            <button
              id="ai-dispatch-notifications-btn"
              disabled={isProcessing || !selectedEventId}
              onClick={handleSendAiNotifications}
              className={`w-full font-bold text-xs sm:text-sm py-2.5 px-4 rounded-lg transition-all shadow-xs inline-flex items-center justify-center space-x-2 cursor-pointer ${
                isProcessing || !selectedEventId
                  ? 'bg-gray-150 border border-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-brand-orange hover:bg-brand-orange/95 text-white active:scale-[0.99]'
              }`}
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span>IA Processando Ficha EAV...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Escrever & Disparar Notificações IA</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Info alerts */}
        {errorMess && (
          <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded text-xs text-red-700 flex items-center space-x-2">
            <AlertCircle className="w-4.5 h-4.5 shrink-0" />
            <span>{errorMess}</span>
          </div>
        )}

        {successMess && (
          <div className="bg-green-50/20 border-l-4 border-brand-green p-3 rounded text-xs text-brand-green flex items-center space-x-2">
            <CheckCircle className="w-4.5 h-4.5 shrink-0" />
            <span>{successMess}</span>
          </div>
        )}

        {!apiStatusChecked && apiStatusChecked !== null && (
          <div className="bg-amber-50/15 border border-amber-200 p-3 rounded-lg text-xs text-gray-600 flex items-start space-x-2">
            <AlertCircle className="w-4.5 h-4.5 text-brand-orange shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-gray-700">Dica do Hub de Comunicação da Escola:</p>
              <p className="mt-0.5 leading-relaxed text-gray-500">
                A chave <code>GEMINI_API_KEY</code> não foi localizada no seu painel de Segredos. O sistema ativou o <strong>Ambiente de Simulação de IA (Sandbox)</strong>. A IA funcionará simulando perfeitamente a geração de relatórios logísticos específicos e e-mails operacionais em português para demonstração. Para utilizar a IA verdadeira com raciocínio ao vivo de dados pedagógicos, configure sua chave no menu lateral **Settings &gt; Secrets**!
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 3. Dual-Panel Communication Console (Outbox logs + Real HTML Display) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Hand: In-box logging */}
        <div className="lg:col-span-5 bg-white border border-gray-150 rounded-lg overflow-hidden flex flex-col h-[520px] shadow-xs">
          
          {/* Header & search */}
          <div className="p-4 border-b border-gray-150 space-y-3 shrink-0">
            <div className="flex items-center justify-between">
              <h4 className="font-serif font-bold text-sm text-brand-blue flex items-center gap-1.5">
                <MailCheck className="w-4.5 h-4.5 text-brand-blue" />
                <span>Histórico de Envios por IA</span>
              </h4>
              <button 
                id="clear-logs-btn"
                onClick={handleClearHistory}
                disabled={logs.length === 0}
                className="text-[10px] text-red-550 border border-red-100 hover:bg-neutral-50 px-2 py-1 rounded-md font-semibold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                title="Limpar log de envios"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
            
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-2 top-2.5" />
              <input 
                id="search-ai-logs"
                type="text" 
                placeholder="Filtrar histórico por setor ou assunto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full text-xs pl-8 pr-3 py-1.5 border border-gray-200 rounded bg-neutral-50 focus:bg-white focus:ring-1 focus:ring-brand-blue outline-hidden transition-all text-gray-700"
              />
            </div>
          </div>

          {/* List content */}
          <div className="flex-1 overflow-y-auto divide-y divide-gray-100 bg-neutral-50/20 font-sans">
            {filteredLogs.length > 0 ? (
              filteredLogs.map(log => {
                const isSelected = log.id === selectedLogId;
                const dateObj = new Date(log.sentAt);
                const timeStr = dateObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                const dateStr = dateObj.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });

                return (
                  <div
                    key={log.id}
                    id={`log-item-${log.id}`}
                    onClick={() => setSelectedLogId(log.id)}
                    className={`p-3.5 text-left cursor-pointer transition-all flex items-start gap-3.5 ${
                      isSelected 
                        ? 'bg-neutral-100/50 border-r-4 border-r-brand-blue' 
                        : 'hover:bg-neutral-50'
                    }`}
                  >
                    <div className="p-1.5 bg-brand-cream text-brand-blue rounded-lg shrink-0 mt-0.5">
                      <Mail className="w-4 h-4" />
                    </div>
                    
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center justify-between gap-1.5 text-[10px]">
                        <span className="font-bold text-brand-blue uppercase tracking-wider">{log.recipientSector}</span>
                        <span className="text-gray-400 font-mono text-[9px]">{dateStr} {timeStr}</span>
                      </div>
                      <p className="text-xs font-semibold text-gray-800 line-clamp-1">{log.eventTitle}</p>
                      <p className="text-[10px] text-gray-400 truncate leading-normal" title={log.recipientEmail}>
                        Para: {log.recipientEmail}
                      </p>
                      
                      <div className="flex items-center gap-1.5 pt-0.5">
                        <span className="text-[9px] bg-green-50 border border-green-200 text-brand-green px-1.5 py-0.2 rounded-xs font-bold shrink-0">
                          Disparado
                        </span>
                        {log.isSimulated && (
                          <span className="text-[8px] bg-amber-50 text-amber-500 border border-amber-100 px-1 py-0.2 rounded-xs font-bold shrink-0">
                            Sandbox
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-20 px-4 space-y-2">
                <AlertCircle className="w-8 h-8 text-gray-300 mx-auto" />
                <h5 className="font-bold text-xs text-gray-650">Nenhum envio localizado</h5>
                <p className="text-[11px] text-gray-400 max-w-[200px] mx-auto">Selecione um evento escolar acima e clique no botão para que a IA gere as correspondências técnicos.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Hand: HTML Render Frame */}
        <div className="lg:col-span-7 bg-white border border-gray-150 rounded-lg overflow-hidden flex flex-col h-[520px] shadow-xs">
          
          {selectedLog ? (
            <div className="flex flex-col h-full bg-[#FCFBFA]">
              
              {/* Fake Email Envelope Headers */}
              <div className="p-4 sm:p-5 border-b border-gray-150 bg-white space-y-3 font-sans shrink-0">
                <div className="flex items-center justify-between text-xs border-b border-dashed border-gray-150 pb-2">
                  <div className="flex items-center gap-1.5">
                    {selectedLog.isSimulated ? (
                      <>
                        <span className="w-2.5 h-2.5 bg-amber-500 rounded-full animate-pulse" />
                        <span className="font-bold text-amber-600">E-mail Simulado (Sandbox)</span>
                      </>
                    ) : (
                      <>
                        <span className="w-2.5 h-2.5 bg-brand-green rounded-full shadow-xs" />
                        <span className="font-bold text-brand-green">Enviado com Sucesso via SMTP</span>
                      </>
                    )}
                  </div>
                  <span className="text-gray-400 font-mono text-[10px]">ID de Postagem: {selectedLog.id}</span>
                </div>
                
                <table className="w-full text-xs">
                  <tbody>
                    <tr>
                      <td className="font-bold text-gray-400 pr-3 py-1 w-14">DE:</td>
                      <td className="text-brand-blue font-semibold">Portal do Colaborador EAV &lt;ai-assistant@escolaamericana.com.br&gt;</td>
                    </tr>
                    <tr>
                      <td className="font-bold text-gray-400 pr-3 py-1">PARA:</td>
                      <td className="text-gray-700 font-medium">
                        {selectedLog.recipientPerson} &lt;<span className="text-brand-orange hover:underline">{selectedLog.recipientEmail}</span>&gt;
                      </td>
                    </tr>
                    <tr>
                      <td className="font-bold text-gray-400 pr-3 py-1">ASSUNTO:</td>
                      <td className="text-gray-800 font-bold">{selectedLog.subject}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Alert box when simulated */}
              {selectedLog.isSimulated && (
                <div className="mx-4 mt-3 bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs font-sans text-amber-900 space-y-1.5 shrink-0">
                  <div className="flex items-center gap-1.5 font-bold">
                    <AlertCircle className="w-4.5 h-4.5 text-brand-orange" />
                    <span>Por que você não recebeu este e-mail?</span>
                  </div>
                  <p className="text-gray-600 leading-relaxed text-[11px]">
                    Este e-mail foi <strong>gerado em português pela IA</strong> para visualização e homologação de layout. Para fazer os disparos reais para qualquer e-mail (corporativos ou pessoais como <code>{selectedLog.recipientEmail}</code>), você precisa configurar os dados do seu provedor de e-mails em **Settings &gt; Secrets** (menu lateral esquerdo do AI Studio).
                  </p>
                  <div className="text-[10px] text-gray-500 pt-1 font-semibold space-y-1">
                    <p>Substitua ou configure as seguintes variáveis no painel de Segredos (Secrets):</p>
                    <div className="grid grid-cols-2 gap-2 text-[9px] font-mono bg-white p-2 border border-amber-100 rounded">
                      <div><code>SMTP_HOST</code> (ex: smtp.gmail.com)</div>
                      <div><code>SMTP_PORT</code> (ex: 587 ou 465)</div>
                      <div><code>SMTP_USER</code> (seu e-mail de disparo)</div>
                      <div><code>SMTP_PASS</code> (senha de aplicativo)</div>
                    </div>
                  </div>
                </div>
              )}

              {selectedLog.smtpError && (
                <div className="mx-4 mt-3 bg-red-50 border border-red-200 rounded-lg p-3 text-xs font-sans text-red-900 space-y-1 shrink-0">
                  <div className="flex items-center gap-1.5 font-bold">
                    <AlertCircle className="w-4.5 h-4.5 text-red-550" />
                    <span>Erro de Conexão no Envio Real (SMTP):</span>
                  </div>
                  <p className="text-gray-650 leading-relaxed text-[11px]">
                    A tentativa de envio falhou porque o servidor SMTP retornou o erro abaixo (verifique suas credenciais em Secrets):
                  </p>
                  <pre className="p-2 bg-red-100/50 rounded font-mono text-[9px] text-red-700 overflow-x-auto font-bold">
                    {selectedLog.smtpError}
                  </pre>
                </div>
              )}

              {/* Real HTML preview box */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#FCFBFA]">
                <div 
                  className="bg-white rounded p-1 shadow-xs mx-auto max-w-[550px]"
                  style={{ minHeight: '320px' }}
                  dangerouslySetInnerHTML={{ __html: selectedLog.htmlBody }}
                />
              </div>

              <div className="p-3 bg-white border-t border-gray-150 text-[10px] text-center text-gray-400 font-mono py-2 shrink-0">
                Comunicado logística gerado nativamente pelo EAV Mail Assistant (Modelo: gemini-3.5-flash)
              </div>

            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full space-y-3.5 text-center p-8 bg-neutral-50/50">
              <div className="w-14 h-14 bg-brand-cream rounded-full flex items-center justify-center text-brand-orange text-xl shadow-xs border border-amber-100">
                <Mail className="w-6 h-6 shrink-0" />
              </div>
              <h4 className="font-serif font-bold text-gray-850 text-base">Visualizador de E-mails Inteligente</h4>
              <p className="text-xs text-gray-500 max-w-sm leading-relaxed">
                Selecione qualquer e-mail enviado ou simulado no menu lateral de histórico para renderizar em tempo real a folha de comunicação interna desenhada sob demanda pela nossa IA.
              </p>
            </div>
          )}

        </div>

      </div>

      {/* 4. Help and Technical FAQ footer disclaimer */}
      <div className="bg-[#FAF8F5] border border-gray-200 rounded-lg p-5 font-sans flex flex-col md:flex-row gap-5">
        <Sparkles className="w-8 h-8 text-brand-orange shrink-0 mt-0.5 animate-pulse" />
        <div className="space-y-1.5 text-xs text-gray-650">
          <h5 className="font-bold text-brand-blue uppercase tracking-wider text-[11px]">Como funciona o roteamento por IA do Portal do Colaborador EAV?</h5>
          <p className="leading-relaxed text-zinc-650">
            A IA faz análises táticas integradas. Quando um formulário corporativo de evento escolar é submetido, mapeado com pendências específicas para diferentes setores da instituição, nosso orquestrador realiza varreduras sob demanda. 
            Ele mapeia cada atividade, busca o nome do líder designado do setor e escreve automaticamente uma notificação por e-mail profissional, contendo pauta detalhada, horários reservados e orientações. 
          </p>
          <p className="leading-relaxed text-gray-400 text-[11px] pt-1">
            * Nota de Simulação: O sistema emite relatórios funcionais de e-mail e salva registros operacionais para aprovação manual dos líderes no campus.
          </p>
        </div>
      </div>

    </div>
  );
}

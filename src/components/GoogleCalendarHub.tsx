/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Sparkles, 
  CheckCircle, 
  MapPin, 
  Clock, 
  RefreshCw, 
  LogOut, 
  ChevronRight, 
  CalendarDays, 
  UserCheck, 
  FolderSync, 
  ArrowRightLeft,
  AlertCircle,
  Plus,
  Compass,
  Check,
  Send,
  CalendarCheck
} from 'lucide-react';
import { SchoolEvent } from '../types';
import { googleSignIn, logout, initAuth, getAccessToken } from '../firebase';
import { User } from 'firebase/auth';

interface GoogleCalendarHubProps {
  events: SchoolEvent[];
}

interface ExternalCalendarEvent {
  id: string;
  summary: string;
  start?: { dateTime?: string; date?: string };
  end?: { dateTime?: string; date?: string };
  location?: string;
  htmlLink?: string;
}

export default function GoogleCalendarHub({ events }: GoogleCalendarHubProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [needsAuth, setNeedsAuth] = useState<boolean>(true);
  const [isLoadingAuth, setIsLoadingAuth] = useState<boolean>(true);
  
  // External events fetched from Google Calendar
  const [googleEvents, setGoogleEvents] = useState<ExternalCalendarEvent[]>([]);
  const [isLoadingGoogleEvents, setIsLoadingGoogleEvents] = useState<boolean>(false);
  const [externalError, setExternalError] = useState<string>('');

  // Sync state tracking (event ID -> synchronized event ID on Google Calendar)
  const [syncedEventMap, setSyncedEventMap] = useState<Record<string, string>>(() => {
    const cached = localStorage.getItem('eav_synced_calendar_events_map');
    return cached ? JSON.parse(cached) : {};
  });

  // UI state
  const [syncingEventId, setSyncingEventId] = useState<string>('');
  const [previewEvent, setPreviewEvent] = useState<SchoolEvent | null>(null);
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false);
  const [notificationMessage, setNotificationMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Initialize Auth state
  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setCurrentUser(user);
        setAccessToken(token);
        setNeedsAuth(false);
        setIsLoadingAuth(false);
      },
      () => {
        setCurrentUser(null);
        setAccessToken(null);
        setNeedsAuth(true);
        setIsLoadingAuth(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Fetch upcoming events from Google Calendar once authenticated
  useEffect(() => {
    if (accessToken) {
      fetchGoogleEvents();
    }
  }, [accessToken]);

  const fetchGoogleEvents = async () => {
    if (!accessToken) return;
    setIsLoadingGoogleEvents(true);
    setExternalError('');
    try {
      const timeMin = new Date().toISOString();
      const response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events?maxResults=8&orderBy=startTime&singleEvents=true&timeMin=${encodeURIComponent(timeMin)}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` }
        }
      );
      if (!response.ok) {
        throw new Error('Falha ao sincronizar agenda do Google.');
      }
      const data = await response.json();
      setGoogleEvents(data.items || []);
    } catch (err: any) {
      console.error(err);
      setExternalError('Não foi possível buscar eventos futuros. Verifique seu token de acesso.');
    } finally {
      setIsLoadingGoogleEvents(false);
    }
  };

  const handleSignIn = async () => {
    setExternalError('');
    try {
      const result = await googleSignIn();
      if (result) {
        setCurrentUser(result.user);
        setAccessToken(result.accessToken);
        setNeedsAuth(false);
        setNotificationMessage({
          type: 'success',
          text: `Bem-vindo, ${result.user.displayName || 'Colaborador EAV'}! Conta conectada com sucesso.`
        });
      }
    } catch (error: any) {
      setExternalError('Falha ao autenticar com o Google. Certifique-se de que permitiu o pop-up.');
    }
  };

  const handleSignOut = async () => {
    try {
      await logout();
      setCurrentUser(null);
      setAccessToken(null);
      setNeedsAuth(true);
      setGoogleEvents([]);
      setNotificationMessage({
        type: 'success',
        text: 'Sessão encerrada com segurança. As credenciais do Google foram removidas.'
      });
    } catch (err) {
      console.error(err);
    }
  };

  // Turn EAV date & time into valid ISO standard date
  const parseEavDateTime = (dateStr: string, timeStr: string) => {
    // dateStr example: "29/05/2026"
    // timeStr example: "08:00h" or "08:00"
    try {
      const parts = dateStr.split('/');
      if (parts.length !== 3) return new Date();
      const day = parts[0];
      const month = parts[1];
      const year = parts[2];
      
      const cleanTime = timeStr.replace('h', '').replace(' ', '').trim();
      const timeParts = cleanTime.split(':');
      const hour = timeParts[0] || '08';
      const minute = timeParts[1] || '00';

      return new Date(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute));
    } catch (e) {
      return new Date();
    }
  };

  // Sync event function with strict workspace guidelines for mutation confirmations
  const handleInitiateSync = (event: SchoolEvent) => {
    setPreviewEvent(event);
    setShowConfirmation(true);
  };

  const executeGoogleCalendarSync = async () => {
    if (!previewEvent || !accessToken) return;
    
    setShowConfirmation(false);
    setSyncingEventId(previewEvent.id);
    setNotificationMessage(null);

    const eventStart = parseEavDateTime(previewEvent.date, previewEvent.startTime);
    const eventEnd = parseEavDateTime(previewEvent.date, previewEvent.endTime);

    // Format description text
    const description = `=== PORTAL DO COLABORADOR EAV ===
Setor Solicitante: ${previewEvent.requester}
Setor Responsável: ${previewEvent.responsibleSector}
Campus Unidade: Campus ${previewEvent.campus || 'Vitória'}
Objetivo Pedagógico: ${previewEvent.objective}
Público Alvo: ${previewEvent.targetAudience} (Estimativa: ${previewEvent.audienceEstimate})

Setores Envolvidos Avisados: ${previewEvent.sectorsInvolved?.join(', ') || 'Nenhum'}

Demanda Técnica Operacional Cadastrada:
${previewEvent.demands?.map(d => `- [${d.sectorName}] ${d.responsiblePerson}: ${d.demandDescription}`).join('\n') || 'Nenhuma pauta específica registrada.'}

Gerado automaticamente pelo Assistente de Agenda da Escola Americana de Vitória.`;

    const gcalPayload = {
      summary: `[EAV] ${previewEvent.title}`,
      location: `${previewEvent.location} - Campus ${previewEvent.campus || 'Vitória'}`,
      description: description,
      start: {
        dateTime: eventStart.toISOString(),
        timeZone: 'America/Sao_Paulo'
      },
      end: {
        dateTime: eventEnd.toISOString(),
        timeZone: 'America/Sao_Paulo'
      }
    };

    try {
      const response = await fetch(
        'https://www.googleapis.com/calendar/v3/calendars/primary/events',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(gcalPayload)
        }
      );

      if (!response.ok) {
        throw new Error('Falha ao enviar evento para o servidor do Google.');
      }

      const createdEvent = await response.json();
      
      // Update local storage tracking mapping
      const updatedMap = { ...syncedEventMap, [previewEvent.id]: createdEvent.id };
      setSyncedEventMap(updatedMap);
      localStorage.setItem('eav_synced_calendar_events_map', JSON.stringify(updatedMap));

      setNotificationMessage({
        type: 'success',
        text: `Evento "${previewEvent.title}" sincronizado com sucesso na sua Google Agenda principal!`
      });

      // Fetch fresh google events list
      fetchGoogleEvents();
    } catch (err: any) {
      setNotificationMessage({
        type: 'error',
        text: `Falha na sincronização: ${err.message || 'Erro de comunicação.'}`
      });
    } finally {
      setSyncingEventId('');
      setPreviewEvent(null);
    }
  };

  return (
    <div className="max-w-[1240px] mx-auto px-4 sm:px-6 space-y-8 animate-fadeIn" id="google-calendar-hub">
      
      {/* Welcome Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-lg border border-gray-100 shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2.5">
              <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-brand-blue text-white p-1">
                <CalendarDays className="w-4.5 h-4.5 animate-pulse" />
              </span>
              <h1 className="font-serif text-3xl font-bold text-brand-blue tracking-tight leading-none">
                Google Agenda
              </h1>
            </div>
            <p className="text-gray-500 text-xs sm:text-sm max-w-2xl font-sans">
              Conecte sua conta corporativa da <strong>Escola Americana de Vitória</strong> para agendar eventos de forma automatizada, sincronizar grades horárias e inspecionar sua agenda ao vivo sem sair de seu terminal escolar.
            </p>
          </div>

          {!needsAuth && currentUser && (
            <div className="flex items-center space-x-3 bg-[#F7F5F2] border border-gray-200 p-2.5 px-4 rounded-xl shrink-0">
              {currentUser.photoURL ? (
                <img 
                  src={currentUser.photoURL} 
                  alt="Avatar" 
                  referrerPolicy="no-referrer"
                  className="w-10 h-10 rounded-full border border-gray-300 shadow-2xs" 
                />
              ) : (
                <div className="w-10 h-10 bg-brand-blue text-white rounded-full flex items-center justify-center font-bold text-sm">
                  {currentUser.displayName?.substring(0, 2).toUpperCase() || 'EAV'}
                </div>
              )}
              <div className="font-sans">
                <div className="text-xs font-bold text-gray-850 flex items-center gap-1">
                  <UserCheck className="w-3.5 h-3.5 text-brand-green" />
                  <span>Conectado</span>
                </div>
                <div className="text-[10px] text-gray-500 truncate max-w-[150px]" title={currentUser.email || ''}>
                  {currentUser.email}
                </div>
              </div>
              <button
                id="gcal-signout-btn"
                onClick={handleSignOut}
                className="ml-2 p-1.5 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-lg transition-all cursor-pointer"
                title="Encerrar conexão"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Global alert feedback */}
      {notificationMessage && (
        <div className={`p-4 rounded-lg border text-xs flex items-center space-x-2.5 shadow-2x font-sans animate-slideDown ${
          notificationMessage.type === 'success' 
            ? 'bg-green-50/20 border-green-200 text-brand-green' 
            : 'bg-red-50/20 border-red-200 text-red-650'
        }`}>
          <CheckCircle className="w-5 h-5 shrink-0" />
          <span className="font-medium">{notificationMessage.text}</span>
        </div>
      )}

      {/* Authentication Gateway view (if needed) */}
      {needsAuth ? (
        <div className="bg-white border border-[#E5E1DA] rounded-2xl p-8 sm:p-12 text-center max-w-xl mx-auto shadow-sm space-y-6">
          <div className="w-16 h-16 bg-[#3E5C52]/5 text-brand-blue rounded-full flex items-center justify-center mx-auto border border-brand-blue/10">
            <ArrowRightLeft className="w-7 h-7" />
          </div>
          
          <div className="space-y-2">
            <h3 className="font-serif font-bold text-xl text-brand-blue">Sincronização de Calendário</h3>
            <p className="text-gray-500 text-xs sm:text-sm font-sans max-w-sm mx-auto leading-relaxed">
              Autentique-se com sua conta para autorizar o Portal do Colaborador a agendar compromissos e ler seus compromissos futuros.
            </p>
          </div>

          {isLoadingAuth ? (
            <div className="flex items-center justify-center space-x-2 text-xs text-gray-400">
              <RefreshCw className="w-4 h-4 animate-spin text-brand-blue" />
              <span>Verificando credenciais armazenadas...</span>
            </div>
          ) : (
            <div className="pt-2">
              <button 
                id="gcal-signin-btn"
                onClick={handleSignIn}
                className="gsi-material-button w-full sm:w-auto inline-flex items-center justify-center cursor-pointer active:scale-[0.99] transition-transform"
              >
                <div className="gsi-material-button-state"></div>
                <div className="gsi-material-button-content-wrapper">
                  <div className="gsi-material-button-icon">
                    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" style={{ display: "block" }}>
                      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                      <path fill="none" d="M0 0h48v48H0z"></path>
                    </svg>
                  </div>
                  <span className="gsi-material-button-contents text-xs font-bold text-gray-700">Conectar Google Agenda</span>
                </div>
              </button>
            </div>
          )}

          {externalError && (
            <div className="bg-red-50 border border-red-100 p-3 rounded-lg text-xs text-red-700 flex items-center space-x-2 justify-center font-sans">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{externalError}</span>
            </div>
          )}
        </div>
      ) : (
        /* Workspace Active Two-Column Sync Console */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Side: School events awaiting sync */}
          <div className="lg:col-span-7 bg-white border border-gray-150 rounded-lg overflow-hidden flex flex-col min-h-[500px] shadow-xs">
            <div className="p-4 sm:p-5 border-b border-gray-150 bg-white font-sans shrink-0">
              <h3 className="font-serif font-bold text-base text-brand-blue flex items-center gap-2">
                <FolderSync className="w-5 h-5 text-brand-orange" />
                <span>Sincronizar Eventos Acadêmicos</span>
              </h3>
              <p className="text-gray-400 text-xs mt-1">
                Selecione os formulários de eventos aprovados pela direção tática da EAV para cadastrar como compromisso corporativo oficial.
              </p>
            </div>

            <div className="divide-y divide-gray-100 flex-1 overflow-y-auto font-sans">
              {events.length > 0 ? (
                events.map(ev => {
                  const isSynced = !!syncedEventMap[ev.id];
                  const isPendingSync = syncingEventId === ev.id;

                  return (
                    <div 
                      key={ev.id}
                      id={`sync-card-${ev.id}`}
                      className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-neutral-50/40 transition-colors"
                    >
                      <div className="space-y-1.5 min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full select-none ${
                            ev.status === 'approved' 
                              ? 'bg-green-50 text-brand-green border border-green-100'
                              : ev.status === 'rejected'
                              ? 'bg-red-50 text-red-600 border border-red-100'
                              : 'bg-amber-50 text-brand-orange border border-amber-100'
                          }`}>
                            Ref: {ev.id} - {ev.status === 'approved' ? 'Aprovado' : ev.status === 'rejected' ? 'Negado' : 'Em Análise'}
                          </span>
                          
                          {isSynced && (
                            <span className="text-[9px] bg-blue-50 text-brand-blue border border-blue-150 px-2 py-0.5 rounded-full font-bold inline-flex items-center gap-1 shadow-2xs">
                              <Check className="w-3 h-3 text-brand-blue" />
                              <span>Sincronizado</span>
                            </span>
                          )}
                        </div>

                        <h4 className="text-xs sm:text-sm font-bold text-gray-800 tracking-tight leading-snug">{ev.title}</h4>
                        
                        <div className="flex flex-wrap items-center gap-3 text-[10px] sm:text-xs text-gray-400 font-mono">
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-3.5 h-3.5 text-brand-orange" />
                            <span>{ev.date}</span>
                          </div>
                          <span>|</span>
                          <div className="flex items-center space-x-1">
                            <Clock className="w-3.5 h-3.5 text-brand-blue" />
                            <span>{ev.startTime}h - {ev.endTime}h</span>
                          </div>
                          <span>|</span>
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-3.5 h-3.5 text-brand-green" />
                            <span className="truncate max-w-[120px]">{ev.location}</span>
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0">
                        {isSynced ? (
                          <button
                            id={`sync-btn-retry-${ev.id}`}
                            disabled={isPendingSync}
                            onClick={() => handleInitiateSync(ev)}
                            className="bg-white hover:bg-neutral-50 border border-gray-200 text-gray-500 hover:text-gray-700 font-bold text-xs px-3.5 py-2 rounded-lg shadow-2xs transition-all flex items-center space-x-1.5 cursor-pointer active:scale-[0.98]"
                          >
                            <RefreshCw className="w-3.5 h-3.5 text-gray-400" />
                            <span>Reenviar</span>
                          </button>
                        ) : (
                          <button
                            id={`sync-btn-start-${ev.id}`}
                            disabled={isPendingSync}
                            onClick={() => handleInitiateSync(ev)}
                            className="bg-brand-orange hover:bg-brand-orange/95 text-white font-bold text-xs px-4 py-2 rounded-lg shadow-2xs transition-all flex items-center space-x-1.5 cursor-pointer active:scale-[0.98]"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add Google Calendar</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-24 text-gray-400">
                  <AlertCircle className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-xs">Nenhum evento registrado no portal.</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Side: Google Calendar Live Stream Feed (Pull) */}
          <div className="lg:col-span-5 bg-white border border-gray-150 rounded-lg overflow-hidden flex flex-col min-h-[500px] shadow-xs">
            <div className="p-4 sm:p-5 border-b border-gray-150 bg-white font-sans shrink-0 flex items-center justify-between">
              <div className="space-y-0.5">
                <h3 className="font-serif font-bold text-base text-brand-blue flex items-center gap-2">
                  <Compass className="w-5 h-5 text-brand-blue" />
                  <span>Agenda Atual do Google</span>
                </h3>
                <p className="text-gray-400 text-[10px]">
                  Visualização ao vivo com seus próximos compromissos profissionais no calendário.
                </p>
              </div>

              <button
                id="refresh-google-agenda"
                onClick={fetchGoogleEvents}
                disabled={isLoadingGoogleEvents}
                className="p-1 px-2 text-[10px] border border-gray-200 rounded hover:bg-neutral-50 text-gray-500 flex items-center gap-1 transition-all cursor-pointer font-sans"
                title="Sincronizar feed ao vivo"
              >
                <RefreshCw className={`w-3 h-3 ${isLoadingGoogleEvents ? 'animate-spin' : ''}`} />
                <span>Atualizar</span>
              </button>
            </div>

            {/* Event results lists */}
            <div className="divide-y divide-gray-100 flex-1 overflow-y-auto font-sans bg-neutral-50/25">
              {isLoadingGoogleEvents ? (
                <div className="flex flex-col items-center justify-center p-20 text-gray-450 space-y-2">
                  <RefreshCw className="w-6 h-6 animate-spin text-brand-blue" />
                  <span className="text-xs font-medium">Buscando compromissos da conta...</span>
                </div>
              ) : externalError ? (
                <div className="p-8 text-center text-xs text-red-500">
                  {externalError}
                </div>
              ) : googleEvents.length > 0 ? (
                googleEvents.map(gev => {
                  // Get formatting timestamp
                  let dateDisplay = 'Sem data';
                  let timeDisplay = 'Dia inteiro';
                  if (gev.start?.dateTime) {
                    const startD = new Date(gev.start.dateTime);
                    dateDisplay = startD.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
                    timeDisplay = startD.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) + 'h';
                  } else if (gev.start?.date) {
                    const [y, m, d] = gev.start.date.split('-');
                    dateDisplay = `${d}/${m}`;
                  }

                  return (
                    <div 
                      key={gev.id} 
                      className="p-4 hover:bg-white select-text transition-colors flex items-start gap-3.5 text-left"
                    >
                      <div className="p-1.5 shrink-0 bg-brand-cream text-brand-blue rounded-lg mt-0.5">
                        <CalendarCheck className="w-4 h-4" />
                      </div>
                      
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center justify-between text-[10px] text-gray-400 font-mono">
                          <span>{dateDisplay}</span>
                          <span>{timeDisplay}</span>
                        </div>
                        <h5 className="text-xs font-bold text-gray-700 leading-snug line-clamp-2">{gev.summary || '(Sem Título)'}</h5>
                        {gev.location && (
                          <div className="text-[10px] text-gray-400 flex items-center gap-1.5 pt-0.5">
                            <MapPin className="w-3 h-3 text-neutral-400" />
                            <span className="truncate">{gev.location}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-24 text-gray-450 space-y-2">
                  <CalendarRange className="w-8 h-8 text-gray-300 mx-auto" />
                  <h5 className="font-bold text-xs text-gray-700">Agenda livre!</h5>
                  <p className="text-[10px] max-w-[200px] mx-auto leading-relaxed">Você não possui compromissos agendados para as próximas horas.</p>
                </div>
              )}
            </div>
          </div>

        </div>
      )}

      {/* Confirmation Drawer Dialog / Modal (Strictly required by Workspace Security Rules for modifications) */}
      {showConfirmation && previewEvent && (
        <div className="fixed inset-0 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-gray-100 font-sans animate-in zoom-in-95 duration-200">
            
            <div className="p-6 bg-[#3E5C52] text-white space-y-1">
              <span className="text-[10px] font-bold text-brand-cream uppercase tracking-wider">Confirmação de Agendamento Secundário</span>
              <h3 className="font-serif text-lg font-bold">Adicionar à Google Agenda Principal?</h3>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
                Este fluxo irá gerar um novo compromisso institucional oficial em nome da <strong>Escola Americana de Vitória (EAV)</strong> na sua Google Agenda principal com os seguintes dados:
              </p>

              <div className="bg-neutral-50 rounded-xl p-4 border border-gray-150 text-xs text-gray-700 space-y-3 shadow-inner">
                <div className="grid grid-cols-3 font-semibold pb-1.5 border-b border-dashed border-gray-200">
                  <span className="text-gray-400">Título:</span>
                  <span className="col-span-2 text-brand-blue font-bold">[EAV] {previewEvent.title}</span>
                </div>
                <div className="grid grid-cols-3 font-semibold pb-1.5 border-b border-dashed border-gray-200">
                  <span className="text-gray-400">Data e Hora:</span>
                  <span className="col-span-2 text-gray-800 font-mono">{previewEvent.date} (dás {previewEvent.startTime}h às {previewEvent.endTime}h)</span>
                </div>
                <div className="grid grid-cols-3 font-semibold pb-1.5 border-b border-dashed border-gray-200">
                  <span className="text-gray-400">Localização:</span>
                  <span className="col-span-2 text-gray-800">{previewEvent.location} - Campus {previewEvent.campus || 'Vitória'}</span>
                </div>
                <div className="grid grid-cols-3 font-semibold">
                  <span className="text-gray-400">Participantes:</span>
                  <span className="col-span-2 text-gray-500 italic">EAV Board, TI, Líder de {previewEvent.responsibleSector}</span>
                </div>
              </div>

              <div className="text-[11px] text-gray-400 bg-amber-50/20 border border-amber-100/50 p-2.5 rounded-lg flex items-start space-x-1.5">
                <AlertCircle className="w-4 h-4 text-brand-orange mt-0.5 shrink-0" />
                <span>
                  O Portal do Colaborador agendará e criará este compromisso com base nos termos concedidos por você no login inicial de permissão.
                </span>
              </div>
            </div>

            <div className="bg-neutral-50 px-6 py-4 flex items-center justify-end space-x-3 border-t border-gray-100">
              <button
                id="confirm-sync-cancel"
                onClick={() => {
                  setShowConfirmation(false);
                  setPreviewEvent(null);
                }}
                className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-gray-700 hover:bg-neutral-100 border border-transparent rounded-lg transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button
                id="confirm-sync-submit"
                onClick={executeGoogleCalendarSync}
                className="px-5 py-2.5 text-xs font-bold bg-brand-orange hover:bg-brand-orange/95 text-white rounded-lg shadow-xs transition-all cursor-pointer inline-flex items-center space-x-1"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Confirmar e Cadastrar</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

// Inline fallback for CalendarRange icon if missing in lucide
function CalendarRange(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
      <line x1="16" x2="16" y1="2" y2="6" />
      <line x1="8" x2="8" y1="2" y2="6" />
      <line x1="3" x2="21" y1="10" y2="10" />
      <path d="M17 14h-6" />
      <path d="M13 18H7" />
      <path d="M7 14h.01" />
      <path d="M17 18h.01" />
    </svg>
  );
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Film, Video, Link as LinkIcon, FileText, ExternalLink, Calendar, Monitor, ChevronRight, AlertCircle, Play, Info } from 'lucide-react';
import { SchoolEvent, SupportRequest } from '../types';

interface MediaDisplayBoardProps {
  events: SchoolEvent[];
  supportRequests: SupportRequest[];
}

export default function MediaDisplayBoard({ events, supportRequests }: MediaDisplayBoardProps) {
  const [selectedEventId, setSelectedEventId] = useState<string>(events[0]?.id || '');
  const [activeMedia, setActiveMedia] = useState<{
    type: 'video' | 'link' | 'embed';
    name: string;
    url: string;
  } | null>(null);

  // Filter support requests for the selected event to find attachments and video URLs
  const relatedTickets = supportRequests.filter(ticket => ticket.eventId === selectedEventId);

  // Consolidate all links, videos, and attachments specifically submitted for this event
  const allEventVideos: { name: string; url: string; displayType: 'embed' | 'link'; ticketId: string; author: string }[] = [];
  const allEventLinks: { url: string; ticketId: string; author: string }[] = [];
  const allEventFiles: { name: string; size: string; ticketId: string; author: string }[] = [];

  relatedTickets.forEach(ticket => {
    ticket.videos.forEach(v => {
      allEventVideos.push({
        ...v,
        ticketId: ticket.id,
        author: ticket.requesterName
      });
    });

    ticket.links.forEach(lnk => {
      allEventLinks.push({
        url: lnk,
        ticketId: ticket.id,
        author: ticket.requesterName
      });
    });

    ticket.attachments.forEach(att => {
      allEventFiles.push({
        name: att.name,
        size: att.size,
        ticketId: ticket.id,
        author: ticket.requesterName
      });
    });
  });

  const selectedEventObj = events.find(ev => ev.id === selectedEventId);

  // Set default media on event change if activeMedia is stagnant or unrelated
  const handleEventChange = (eventId: string) => {
    setSelectedEventId(eventId);
    setActiveMedia(null);
  };

  const handleSelectMedia = (type: 'video' | 'link' | 'embed', name: string, url: string) => {
    setActiveMedia({ type, name, url });
  };

  return (
    <div className="space-y-8 max-w-[1240px] mx-auto px-4 sm:px-6 py-6" id="media-central-container">
      
      {/* Visual Banner */}
      <div className="bg-brand-blue text-white p-6 sm:p-8 rounded-lg shadow-sm relative overflow-hidden">
        {/* Abstract background graphics with school colors */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-orange/10 rounded-full transform translate-x-16 -translate-y-16" />
        <div className="absolute bottom-0 left-1/3 w-48 h-48 bg-brand-green/10 rounded-full transform -translate-y-12" />

        <div className="relative z-10 max-w-2xl space-y-2">
          <span className="bg-brand-orange text-white text-[10px] font-bold tracking-widest px-2.5 py-1 rounded-full uppercase">
            Apresentação & Painel Executivo
          </span>
          <h2 className="font-serif text-3xl font-bold tracking-tight">
            Central de Exibição de Mídias
          </h2>
          <p className="text-blue-100 text-sm leading-relaxed">
            Selecione o cronograma operacional do evento da escola americana para puxar instantaneamente todas as apresentações, links de slides e de vídeos associados. Rode reproduções simuladas no nosso console ou replique para telas secundárias.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Interactive Selection List (span 4) */}
        <div className="lg:col-span-4 bg-white border border-gray-150 rounded-lg p-5 space-y-5 shadow-xs font-sans">
          <div>
            <h3 className="font-serif text-lg font-bold text-brand-blue flex items-center space-x-1.5 border-b border-gray-100 pb-2">
              <Calendar className="w-5 h-5 text-brand-blue" />
              <span>Selecione o Evento da Escola</span>
            </h3>
            <p className="text-[11px] text-gray-500 mt-1">Clique para buscar materiais indexados para apresentação:</p>
          </div>

          <div className="space-y-2.5">
            {events.map((ev) => {
              const isSelected = ev.id === selectedEventId;
              const supportTicketsForThisEvent = supportRequests.filter(s => s.eventId === ev.id);
              const totalAttachedVideos = supportTicketsForThisEvent.reduce((acc, current) => acc + current.videos.length, 0);
              const totalAttachedLinks = supportTicketsForThisEvent.reduce((acc, current) => acc + current.links.length, 0);

              return (
                <button
                  key={ev.id}
                  onClick={() => handleEventChange(ev.id)}
                  className={`w-full text-left p-3.5 rounded-lg border transition-all flex flex-col space-y-2 cursor-pointer ${
                    isSelected 
                      ? 'border-brand-blue bg-brand-blue/5 shadow-xs' 
                      : 'border-gray-200 bg-white hover:bg-gray-50/50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <span className="font-sans font-bold text-xs text-neutral-800 line-clamp-1 flex-1 pr-1.5">
                      {ev.title}
                    </span>
                    <span className="text-[9px] text-gray-400 font-mono shrink-0">{ev.date}</span>
                  </div>

                  <div className="text-[10px] text-gray-500 font-mono">
                    Local: {ev.location}
                  </div>

                  <div className="flex items-center space-x-2 pt-1">
                    {totalAttachedVideos > 0 && (
                      <span className="flex items-center space-x-0.5 bg-red-50 text-red-600 px-1.5 py-0.5 rounded text-[9px] font-bold border border-red-100 uppercase">
                        <Video className="w-2.5 h-2.5" />
                        <span>{totalAttachedVideos} Vídeo(s)</span>
                      </span>
                    )}

                    {totalAttachedLinks > 0 && (
                      <span className="flex items-center space-x-0.5 bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded text-[9px] font-bold border border-blue-100 uppercase">
                        <LinkIcon className="w-2.5 h-2.5" />
                        <span>{totalAttachedLinks} Slides/Links</span>
                      </span>
                    )}

                    {totalAttachedVideos === 0 && totalAttachedLinks === 0 && (
                      <span className="text-[9px] text-neutral-400 font-sans italic">Sem mídias cadastradas</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Console & Player Area (span 8) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Main Display Viewer/Embedded Player Screen */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-3 sm:p-5 text-white shadow-md relative group min-h-[420px] flex flex-col justify-between">
            
            {/* Top Bar inside monitor screen */}
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5 mb-2 sm:mb-4 text-xs">
              <div className="flex items-center space-x-2">
                <Monitor className="w-4 h-4 text-brand-orange" />
                <span className="font-mono text-[10px] tracking-wider font-semibold text-zinc-300 uppercase">
                  Central Terminal de Apresentações
                </span>
              </div>
              <div className="flex items-center space-x-1.5 font-mono text-[9px]">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                <span className="text-zinc-400">MODO PROJETOR ATIVO</span>
              </div>
            </div>

            {/* Core Display area */}
            <div className="flex-1 flex flex-col items-center justify-center p-2.5 sm:p-4 text-center">
              {activeMedia ? (
                <div className="w-full space-y-4">
                  
                  {/* Title of operating material */}
                  <div className="text-left py-2 border-b border-zinc-800 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-brand-orange uppercase font-bold">Arquivo em Exibição:</span>
                      <h4 className="font-medium text-xs sm:text-sm text-zinc-100 leading-tight">{activeMedia.name}</h4>
                    </div>
                    <a
                      href={activeMedia.url}
                      target="_blank"
                      rel="referrer noopener"
                      className="text-[11px] text-blue-400 hover:text-blue-300 font-semibold inline-flex items-center gap-1 cursor-pointer shrink-0"
                    >
                      <span>Destino Principal</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  {/* Dynamic media player rendering */}
                  {activeMedia.type === 'video' && activeMedia.url.includes('youtube') ? (
                    <div className="relative aspect-video w-full max-w-[650px] mx-auto bg-black rounded overflow-hidden shadow-2xl">
                      <iframe
                        src={activeMedia.url}
                        title={activeMedia.name}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                        referrerPolicy="no-referrer"
                        className="absolute inset-0 w-full h-full"
                      />
                    </div>
                  ) : activeMedia.type === 'embed' && activeMedia.url.includes('google') ? (
                    <div className="relative aspect-16/10 w-full max-w-[680px] mx-auto bg-black rounded overflow-hidden shadow-2xl">
                      <iframe
                        src={activeMedia.url}
                        title={activeMedia.name}
                        frameBorder="0"
                        allowFullScreen
                        referrerPolicy="no-referrer"
                        className="absolute inset-0 w-full h-full"
                      />
                    </div>
                  ) : (
                    <div className="bg-zinc-900 border border-zinc-800 p-8 sm:p-12 rounded-lg max-w-[580px] mx-auto space-y-4 shadow-inner text-center">
                      <div className="bg-brand-blue/15 w-14 h-14 rounded-full flex items-center justify-center text-zinc-300 mx-auto">
                        <LinkIcon className="w-7 h-7 text-brand-orange animate-bounce" />
                      </div>
                      <div className="space-y-2">
                        <h5 className="font-medium text-sm text-zinc-200">Apresentação Externa / Slide Corporativo</h5>
                        <p className="text-xs text-zinc-400">
                          Este recurso é direcionado para servidores externos (Ex: Canva ou Prezi). Para apresentá-lo, clique no botão principal de destino de exibição abaixo.
                        </p>
                      </div>
                      <a
                        href={activeMedia.url}
                        target="_blank"
                        rel="referrer noopener"
                        className="bg-brand-orange hover:bg-brand-orange/90 text-zinc-950 font-bold text-xs py-2 px-6 rounded inline-flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
                      >
                        <Play className="w-3.5 h-3.5" />
                        <span>Iniciar Apresentação do Slide</span>
                      </a>
                    </div>
                  )}

                  {/* Media detail description info */}
                  <div className="text-zinc-500 font-mono text-[9px] text-right">
                    URL de Exposição: <span className="text-zinc-400 select-all">{activeMedia.url}</span>
                  </div>

                </div>
              ) : (
                <div className="space-y-4 max-w-md py-10">
                  <div className="bg-zinc-900/60 p-4 rounded-full border border-zinc-800/80 w-16 h-16 flex items-center justify-center text-zinc-450 mx-auto mb-2">
                    <Film className="w-8 h-8 text-neutral-550" />
                  </div>
                  <h4 className="font-serif text-md sm:text-lg text-zinc-200">Nenhuma Mídia Ativa</h4>
                  <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                    Nenhum conteúdo está sendo reproduzido no terminal principal neste momento. Clique em um dos links ou reprodutores de vídeo cadastrados na lista à direita para carregar apresentações.
                  </p>
                </div>
              )}
            </div>

            {/* Bottom active event bar info */}
            <div className="border-t border-zinc-900 pt-3 mt-4 text-[10px] text-zinc-400 flex items-center justify-between">
              <div>
                <span className="text-zinc-500">Evento Selecionado:</span>{' '}
                <span className="text-zinc-100 font-semibold">{selectedEventObj?.title || "(Nenhum evento)"}</span>
              </div>
              <div>
                <span className="text-zinc-500 font-mono">Organizador: {selectedEventObj?.responsibleSector}</span>
              </div>
            </div>

          </div>


          {/* Grid list of resources associated to selected event */}
          <div className="bg-white border border-gray-150 rounded-lg p-5 sm:p-6 space-y-6 shadow-xs font-sans">
            <div>
              <h3 className="font-serif text-lg font-bold text-brand-blue">
                Mídias Disponíveis para o Evento
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">Clique em qualquer item para carregá-lo no player principal do auditório:</p>
            </div>

            {relatedTickets.length > 0 ? (
              <div className="space-y-5">
                
                {/* 1. Category: Attached Videos */}
                {allEventVideos.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold uppercase text-red-650 tracking-wider flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500" /> Reprodutor de Vídeos
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {allEventVideos.map((vid, i) => (
                        <div
                          key={i}
                          onClick={() => handleSelectMedia('video', vid.name, vid.url)}
                          className={`p-3 border rounded-lg hover:bg-gray-50/50 cursor-pointer text-left transition-all ${
                            activeMedia?.url === vid.url 
                              ? 'border-brand-blue bg-brand-blue/5' 
                              : 'border-gray-200'
                          }`}
                        >
                          <div className="flex items-start space-x-2">
                            <Video className="w-4.5 h-4.5 text-red-500 shrink-0 mt-0.5" />
                            <div className="space-y-1">
                              <h5 className="font-bold text-xs text-neutral-800 leading-tight line-clamp-1">{vid.name}</h5>
                              <p className="text-[10px] text-gray-400">Por: <span className="font-semibold">{vid.author}</span></p>
                              <p className="text-[9px] text-blue-500 hover:underline">Carregar no Terminal →</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 2. Category: Slides & Presentations Links */}
                {allEventLinks.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold uppercase text-blue-650 tracking-wider flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Slides e Apresentações
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {allEventLinks.map((lnk, i) => {
                        const isSlidesEmbed = lnk.url.includes('google') && lnk.url.includes('presentation');
                        return (
                          <div
                            key={i}
                            onClick={() => handleSelectMedia(isSlidesEmbed ? 'embed' : 'link', "Slides de Apresentação de Apoio", lnk.url)}
                            className={`p-3 border rounded-lg hover:bg-gray-50/50 cursor-pointer text-left transition-all ${
                              activeMedia?.url === lnk.url 
                                ? 'border-brand-blue bg-brand-blue/5' 
                                : 'border-gray-200'
                            }`}
                          >
                            <div className="flex items-start space-x-2">
                              <LinkIcon className="w-4.5 h-4.5 text-blue-500 shrink-0 mt-0.5" />
                              <div className="space-y-1 truncate w-full">
                                <h5 className="font-bold text-xs text-neutral-800 leading-tight">Slides Educativos (No: {lnk.ticketId})</h5>
                                <p className="text-[10px] text-gray-400">Por: <span className="font-semibold">{lnk.author}</span></p>
                                <p className="text-[9px] font-mono text-zinc-500 truncate">{lnk.url}</p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 3. Category: Event documents/Files lists */}
                {allEventFiles.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold uppercase text-zinc-650 tracking-wider flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-zinc-500" /> Outros Anexos para Download
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {allEventFiles.map((file, i) => (
                        <div key={i} className="p-2.5 border border-gray-150 rounded-lg bg-gray-50/10 text-left">
                          <div className="flex items-center space-x-1.5">
                            <FileText className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                            <div className="truncate w-full space-y-0.5">
                              <h5 className="font-semibold text-[11px] text-neutral-700 truncate" title={file.name}>{file.name}</h5>
                              <p className="text-[9px] text-gray-400 font-mono">({file.size})</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* What if there are tickets but no links/videos? */}
                {allEventVideos.length === 0 && allEventLinks.length === 0 && allEventFiles.length === 0 && (
                  <div className="bg-amber-50/15 border border-amber-300 rounded p-4 flex gap-2 items-start text-xs text-amber-800 font-sans leading-relaxed">
                    <AlertCircle className="w-4.5 h-4.5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">Chamados de suporte abertos, mas sem anexos de exibição:</p>
                      <p className="text-gray-600">
                        Há solicitações operacionais pendentes para o evento, porém nenhum arquivo digital ou link de vídeo foi atrelado ao ticket. Para adicionar mídias, abra um chamado fornecendo os links na seção correspondente.
                      </p>
                    </div>
                  </div>
                )}

              </div>
            ) : (
              <div className="text-center p-8 border border-dashed border-gray-200 rounded text-gray-400 text-xs">
                Nenhum material de mídia de suporte técnico foi registrado para este evento. Deseja realizar um pedido de link ou vídeo de suporte? Se sim, utilize a aba de suporte!
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}

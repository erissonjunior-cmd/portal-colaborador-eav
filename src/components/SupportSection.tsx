/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { HelpCircle, Plus, Trash2, Link, Video, File, Clock, AlertTriangle, CheckCircle, Search, Sparkles } from 'lucide-react';
import { SupportRequest, SchoolEvent, SCHOOL_SECTORS } from '../types';

interface SupportSectionProps {
  supportRequests: SupportRequest[];
  events: SchoolEvent[];
  onCreateSupportRequest: (request: SupportRequest) => void;
  onStatusChange: (id: string, newStatus: 'pending' | 'in_progress' | 'resolved') => void;
  preSelectedEventId?: string;
}

export default function SupportSection({
  supportRequests,
  events,
  onCreateSupportRequest,
  onStatusChange,
  preSelectedEventId = ""
}: SupportSectionProps) {

  // Form State
  const [selectedEventId, setSelectedEventId] = useState(preSelectedEventId);
  const [category, setCategory] = useState<'IT' | 'Maintenance' | 'Marketing' | 'EventPlanning' | 'Other'>('IT');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [requesterName, setRequesterName] = useState('');
  const [requesterEmail, setRequesterEmail] = useState('colaborador@escolaamericana.com.br');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');

  // Dynamic attachment link states
  const [tempLink, setTempLink] = useState('');
  const [links, setLinks] = useState<string[]>([]);

  const [tempVideoName, setTempVideoName] = useState('');
  const [tempVideoUrl, setTempVideoUrl] = useState('');
  const [videos, setVideos] = useState<{ name: string; url: string; displayType: 'embed' | 'link' }[]>([]);

  const [tempFileName, setTempFileName] = useState('');
  const [tempFileSize, setTempFileSize] = useState('');
  const [attachments, setAttachments] = useState<{ name: string; url: string; size: string }[]>([]);

  // Search/Filter tickets state
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedTicket, setSelectedTicket] = useState<SupportRequest | null>(null);

  // File drag state
  const [isDragging, setIsDragging] = useState(false);

  // Quick preset links
  const handleAddLink = () => {
    if (!tempLink) return;
    if (!tempLink.startsWith('http')) {
      alert("Por favor insira um link válido iniciando com http:// ou https://");
      return;
    }
    setLinks([...links, tempLink]);
    setTempLink('');
  };

  const handleRemoveLink = (idx: number) => {
    setLinks(links.filter((_, i) => i !== idx));
  };

  const handleAddVideo = () => {
    if (!tempVideoUrl) return;
    if (!tempVideoName) {
      alert("Dê um nome ou descrição simples para identificar esse vídeo.");
      return;
    }

    // Attempt to convert youtube share links to embed links
    let formattedUrl = tempVideoUrl;
    if (tempVideoUrl.includes('youtube.com/watch?v=')) {
      const videoId = tempVideoUrl.split('v=')[1]?.split('&')[0];
      if (videoId) formattedUrl = `https://www.youtube.com/embed/${videoId}`;
    } else if (tempVideoUrl.includes('youtu.be/')) {
      const videoId = tempVideoUrl.split('youtu.be/')[1]?.split('?')[0];
      if (videoId) formattedUrl = `https://www.youtube.com/embed/${videoId}`;
    }

    setVideos([...videos, {
      name: tempVideoName,
      url: formattedUrl,
      displayType: formattedUrl.includes('embed') ? 'embed' : 'link'
    }]);

    setTempVideoName('');
    setTempVideoUrl('');
  };

  const handleRemoveVideo = (idx: number) => {
    setVideos(videos.filter((_, i) => i !== idx));
  };

  const handleAddAttachment = () => {
    if (!tempFileName) return;
    const size = tempFileSize || `${(Math.random() * 5 + 0.5).toFixed(1)} MB`;
    setAttachments([...attachments, { name: tempFileName, url: '#', size }]);
    setTempFileName('');
    setTempFileSize('');
  };

  const handleRemoveAttachment = (idx: number) => {
    setAttachments(attachments.filter((_, i) => i !== idx));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    // Simulate drops
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
      setAttachments([...attachments, {
        name: file.name,
        url: '#',
        size: `${sizeMB} MB`
      }]);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title) return alert("Por favor, preencha o Resumo / Título do Suporte.");
    if (!requesterName) return alert("Por favor, informe seu nome como Colaborador solicitante.");

    const relatedEventObj = events.find(ev => ev.id === selectedEventId);

    const supportRequestData: SupportRequest = {
      id: `sup-${Math.floor(1000 + Math.random() * 9000)}`,
      eventId: selectedEventId || undefined,
      eventTitle: relatedEventObj?.title,
      category,
      title,
      requesterName,
      requesterEmail,
      description,
      links,
      videos,
      attachments,
      createdAt: new Date().toISOString(),
      status: 'pending',
      priority
    };

    onCreateSupportRequest(supportRequestData);

    // Reset Form Fields
    setTitle('');
    setDescription('');
    setSelectedEventId('');
    setLinks([]);
    setVideos([]);
    setAttachments([]);
    alert("Solicitação de suporte registrada com sucesso! Nossa equipe técnica analisará o pedido.");
  };

  // Filter Logic
  const filteredTickets = supportRequests.filter(ticket => {
    const matchesSearch = ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          ticket.requesterName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (ticket.eventTitle || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'ALL' || ticket.category === categoryFilter;
    const matchesStatus = statusFilter === 'ALL' || ticket.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getPriorityBadge = (prio: 'low' | 'medium' | 'high') => {
    switch (prio) {
      case 'high':
        return <span className="bg-red-50 text-red-600 border border-red-200 text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wide">Alta</span>;
      case 'medium':
        return <span className="bg-blue-50 text-blue-600 border border-blue-200 text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wide">Média</span>;
      default:
        return <span className="bg-gray-100 text-gray-600 border border-gray-200 text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wide">Baixa</span>;
    }
  };

  const getStatusBadge = (status: 'pending' | 'in_progress' | 'resolved') => {
    switch (status) {
      case 'resolved':
        return (
          <span className="flex items-center space-x-1 text-green-700 bg-green-50 border border-green-200 text-[10px] sm:text-xs font-semibold px-2.5 py-1 rounded-full">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Resolvido</span>
          </span>
        );
      case 'in_progress':
        return (
          <span className="flex items-center space-x-1 text-amber-700 bg-amber-50 border border-amber-200 text-[10px] sm:text-xs font-semibold px-2.5 py-1 rounded-full">
            <Clock className="w-3.5 h-3.5 animate-pulse" />
            <span>Em Atendimento</span>
          </span>
        );
      default:
        return (
          <span className="flex items-center space-x-1 text-neutral-600 bg-neutral-100 border border-neutral-200 text-[10px] sm:text-xs font-semibold px-2.5 py-1 rounded-full">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Pendente</span>
          </span>
        );
    }
  };

  const getCategoryTitle = (cat: string) => {
    switch (cat) {
      case 'IT': return 'TI / Suporte Técnico';
      case 'Maintenance': return 'Manutenção / Infra';
      case 'Marketing': return 'Marketing / Audiovisual';
      case 'EventPlanning': return 'Planejamento Acadêmico';
      default: return 'Outros Assuntos';
    }
  };

  return (
    <div className="space-y-8 max-w-[1240px] mx-auto px-4 sm:px-6 py-6" id="support-section-container">
      
      {/* Visual Header */}
      <div className="bg-white p-6 sm:p-8 rounded-lg border border-gray-100 shadow-xs">
        <span className="text-xs font-bold text-brand-orange uppercase tracking-widest block mb-1">Portal do Colaborador</span>
        <h2 className="font-serif text-3xl font-bold text-brand-blue tracking-tight mb-2">
          Central e Solicitação de Suporte de Eventos
        </h2>
        <p className="text-gray-655 text-sm max-w-2xl leading-relaxed">
          Selecione o departamento responsável para obter apoio audiovisual, infraestrutura local, divulgações em mídias, ou anexe os links, apresentações de slides e vídeos salvos que serão projetados no dia do seu evento.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Register New Support Form (Col span 7) */}
        <div className="lg:col-span-7 bg-white border border-gray-150 rounded-lg p-5 sm:p-7 space-y-6 shadow-xs">
          <div>
            <h3 className="font-serif text-xl font-bold text-brand-blue flex items-center space-x-2">
              <Sparkles className="w-5.5 h-5.5 text-brand-orange" />
              <span>Novo Pedido de Suporte</span>
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">Informe as pautas e anexe as mídias para a centralização operacional pública.</p>
          </div>

          <form onSubmit={handleFormSubmit} className="space-y-4 font-sans text-brand-black">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                  Seu Nome <span className="text-red-500">*</span>
                </label>
                <input
                  id="input-support-req-name"
                  type="text"
                  required
                  placeholder="Seu nome completo..."
                  value={requesterName}
                  onChange={e => setRequesterName(e.target.value)}
                  className="w-full text-sm bg-white border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-brand-blue outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                  E-mail de Contato
                </label>
                <input
                  id="input-support-req-email"
                  type="email"
                  required
                  placeholder="contato@escolaamericana.com.br"
                  value={requesterEmail}
                  onChange={e => setRequesterEmail(e.target.value)}
                  className="w-full text-sm bg-white border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-brand-blue outline-hidden text-gray-500 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                  Evento Relacionado (Opcional)
                </label>
                <select
                  id="select-support-event"
                  value={selectedEventId}
                  onChange={e => setSelectedEventId(e.target.value)}
                  className="w-full text-sm bg-white border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-brand-blue outline-hidden text-neutral-800"
                >
                  <option value="">-- Não está associado a evento específico --</option>
                  {events.map(ev => (
                    <option key={ev.id} value={ev.id}>{ev.title} ({ev.date})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                  Prioridade
                </label>
                <select
                  id="select-support-priority"
                  value={priority}
                  onChange={e => setPriority(e.target.value as any)}
                  className="w-full text-sm bg-white border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-brand-blue outline-hidden"
                >
                  <option value="low">Baixa</option>
                  <option value="medium">Média</option>
                  <option value="high">Alta / Urgente</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                  Departamento Destinatário <span className="text-red-500">*</span>
                </label>
                <select
                  id="select-support-category"
                  value={category}
                  onChange={e => setCategory(e.target.value as any)}
                  className="w-full text-sm bg-white border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-brand-blue outline-hidden"
                >
                  <option value="IT">TI & Audiovisual (Projetor/Sons/Suporte)</option>
                  <option value="Marketing">Marketing (Mídias/Fotos/Vídeo Apoio)</option>
                  <option value="Maintenance">Infraestrutura & Zeladoria (Mesas/Eletricidade)</option>
                  <option value="EventPlanning">Pedagógico / Coordenação Geral</option>
                  <option value="Other">Outra Demanda Administrativa</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                  Resumo da Solicitação <span className="text-red-500">*</span>
                </label>
                <input
                  id="input-support-title"
                  type="text"
                  required
                  placeholder="Ex: Montagem de som arena e projetor Slides"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full text-sm bg-white border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-brand-blue outline-hidden font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                Instruções de Suporte (Detalhamento)
              </label>
              <textarea
                id="input-support-description"
                rows={3}
                placeholder="Descreva minuciosamente de que tipo de apoio você precisa e quais materiais devem estar prontos..."
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full text-sm bg-white border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-brand-blue outline-hidden"
              />
            </div>

            {/* SPEACIAL FEATURE: LINKS & VIDEOS ATTACHMENT */}
            <div className="border border-dashed border-gray-200 rounded-lg p-4 space-y-4 bg-radial from-brand-cream/5 to-white">
              
              <div className="text-xs font-bold text-brand-blue uppercase tracking-wider border-b border-gray-150 pb-1.5 flex items-center justify-between">
                <span>Anexar Materiais para Exibição / Apresentação</span>
                <span className="text-[10px] text-neutral-400 capitalize normal-case text-right">Vídeos e links vinculados serão públicos</span>
              </div>

              {/* Multiple Links Section */}
              <div className="space-y-2">
                <label className="block text-[11px] font-bold text-gray-500 uppercase">
                  1. Links de Slides ou Documentos de Suporte (Google Slides, Canva, Drive)
                </label>
                <div className="flex gap-2">
                  <input
                    id="input-support-link"
                    type="url"
                    placeholder="https://docs.google.com/presentation/d/..."
                    value={tempLink}
                    onChange={e => setTempLink(e.target.value)}
                    className="flex-1 text-xs bg-white border border-gray-300 rounded px-3 py-1.5 outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={handleAddLink}
                    className="bg-brand-blue/10 hover:bg-brand-blue text-brand-blue hover:text-white border border-brand-blue/20 text-xs px-3 py-1.5 rounded-md font-semibold transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Adicionar
                  </button>
                </div>

                {links.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1.5">
                    {links.map((lnk, idx) => (
                      <span key={idx} className="inline-flex items-center space-x-1.5 bg-gray-100 border border-gray-200 text-[10px] px-2 py-1 rounded text-gray-700 font-mono">
                        <Link className="w-3 h-3 text-brand-blue shrink-0" />
                        <span className="truncate max-w-[150px]">{lnk}</span>
                        <button type="button" onClick={() => handleRemoveLink(idx)} className="text-gray-400 hover:text-red-500 cursor-pointer text-xs font-bold">×</button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Multiple Video Links Section */}
              <div className="space-y-2">
                <label className="block text-[11px] font-bold text-gray-500 uppercase">
                  2. Links de Vídeos para Apresentação (YouTube, Drive Compartilhado, etc.)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    id="input-support-video-title"
                    type="text"
                    placeholder="Nome do vídeo (Ex: Apresentação NASA)"
                    value={tempVideoName}
                    onChange={e => setTempVideoName(e.target.value)}
                    className="text-xs bg-white border border-gray-300 rounded px-3 py-1.5 outline-hidden"
                  />
                  <input
                    id="input-support-video-url"
                    type="url"
                    placeholder="Link do vídeo (Ex: https://youtube.com/...)"
                    value={tempVideoUrl}
                    onChange={e => setTempVideoUrl(e.target.value)}
                    className="text-xs bg-white border border-gray-300 rounded px-3 py-1.5 outline-hidden"
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleAddVideo}
                    className="bg-brand-blue/10 hover:bg-brand-blue text-brand-blue hover:text-white border border-brand-blue/20 text-xs px-3 py-1.5 rounded-md font-semibold transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <Video className="w-3.5 h-3.5" /> Vincular Vídeo
                  </button>
                </div>

                {videos.length > 0 && (
                  <div className="flex flex-col gap-1.5 pt-1.5">
                    {videos.map((vid, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-zinc-50 border border-zinc-200 rounded px-2.5 py-1 text-[11px] text-zinc-700">
                        <span className="flex items-center space-x-1.5 font-medium truncate">
                          <Video className="w-3.5 h-3.5 text-red-500" />
                          <span>{vid.name}</span>
                          <span className="text-[9px] font-mono text-gray-400">({vid.displayType})</span>
                        </span>
                        <button type="button" onClick={() => handleRemoveVideo(idx)} className="text-red-500 hover:text-red-700 cursor-pointer font-bold text-xs px-1.5">Remover</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Simulated Files Section (with Drag and Drop) */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-gray-500 uppercase">
                  3. Outros Arquivos Locais (Ex: PDFs de Cronogramas, Imagens de Slide)
                </label>
                
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-lg p-4 text-center transition-all ${
                    isDragging 
                      ? 'border-brand-blue bg-blue-50/20' 
                      : 'border-gray-200 hover:border-gray-300 bg-white/40'
                  }`}
                >
                  <div className="flex flex-col items-center justify-center space-y-1">
                    <File className="w-6 h-6 text-gray-400" />
                    <p className="text-xs text-gray-600">
                      Arraste e solte o arquivo aqui, ou simule o anexo digitando abaixo:
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 pt-1.5">
                  <input
                    id="input-support-file-name"
                    type="text"
                    placeholder="Nome do arquivo (Ex: roteiro.pdf)"
                    value={tempFileName}
                    onChange={e => setTempFileName(e.target.value)}
                    className="flex-1 text-xs bg-white border border-gray-300 rounded px-3 py-1.5 outline-hidden"
                  />
                  <input
                    id="input-support-file-size"
                    type="text"
                    placeholder="Tamanho (Ex: 15 KB, 2 MB)"
                    value={tempFileSize}
                    onChange={e => setTempFileSize(e.target.value)}
                    className="w-28 text-xs bg-white border border-gray-300 rounded px-3 py-1.5 outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={handleAddAttachment}
                    className="bg-brand-blue/10 hover:bg-brand-blue text-brand-blue hover:text-white border border-brand-blue/20 text-xs px-3 py-1.5 rounded-md font-semibold transition-all flex items-center gap-1 cursor-pointer"
                  >
                    Anexar
                  </button>
                </div>

                {attachments.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1.5">
                    {attachments.map((att, idx) => (
                      <span key={idx} className="inline-flex items-center space-x-1.5 bg-zinc-100 border border-zinc-200 text-[10px] px-2.5 py-1 rounded text-zinc-700">
                        <File className="w-3 h-3 text-zinc-500" />
                        <span>{att.name}</span>
                        <span className="text-[9px] text-gray-400 font-mono">({att.size})</span>
                        <button type="button" onClick={() => handleRemoveAttachment(idx)} className="text-gray-400 hover:text-red-500 cursor-pointer font-bold font-mono">×</button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

            </div>

            <div className="flex justify-end pt-3">
              <button
                id="submit-support-request-btn"
                type="submit"
                className="bg-brand-blue hover:bg-brand-blue/95 text-white font-sans text-sm font-semibold px-6 py-2.5 rounded-md shadow-md transition-all ease-in cursor-pointer"
              >
                Abrir Solicitação de Suporte
              </button>
            </div>

          </form>
        </div>


        {/* Right Column: Ticket Tracking & Status Board (Col span 5) */}
        <div className="lg:col-span-5 bg-white border border-gray-150 rounded-lg p-5 sm:p-6 space-y-6 shadow-xs">
          <div>
            <h3 className="font-serif text-xl font-bold text-brand-blue flex items-center space-x-2">
              <Clock className="w-5 h-5 text-brand-blue" />
              <span>Painel de Acompanhamento</span>
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">Veja em tempo real o status operacional de todos os suportes abertos.</p>
          </div>

          {/* Quick filter triggers */}
          <div className="space-y-3 font-sans">
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              <input
                id="ticket-search-input"
                type="text"
                placeholder="Buscar chamados..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full text-xs font-medium pl-9 pr-3 py-2 border border-gray-200 rounded-lg outline-hidden focus:ring-1 focus:ring-brand-blue bg-neutral-50/50 text-gray-700"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Setor</label>
                <select
                  value={categoryFilter}
                  onChange={e => setCategoryFilter(e.target.value)}
                  className="w-full text-[11px] font-semibold bg-neutral-50 border border-gray-200 rounded p-1.5 outline-hidden text-gray-600"
                >
                  <option value="ALL">Todos Setores</option>
                  <option value="IT">TI / Audiovisual</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Maintenance">Manutenção</option>
                  <option value="EventPlanning">Pedagógico</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Status</label>
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="w-full text-[11px] font-semibold bg-neutral-50 border border-gray-200 rounded p-1.5 outline-hidden text-gray-600"
                >
                  <option value="ALL">Todos Status</option>
                  <option value="pending">Pendentes</option>
                  <option value="in_progress">Em Atendimento</option>
                  <option value="resolved">Resolvidos</option>
                </select>
              </div>
            </div>
          </div>

          {/* Ticket list rendering */}
          <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
            {filteredTickets.length > 0 ? (
              filteredTickets.map((ticket) => {
                const isSelected = selectedTicket?.id === ticket.id;
                return (
                  <div
                    key={ticket.id}
                    onClick={() => setSelectedTicket(isSelected ? null : ticket)}
                    className={`p-4 border rounded-lg transition-all text-left cursor-pointer hover:border-brand-blue/50 ${
                      isSelected 
                        ? 'border-brand-blue bg-brand-blue/5 ring-1 ring-brand-blue/30' 
                        : 'border-gray-200 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="font-mono text-[10px] bg-gray-100 px-1.5 py-0.5 rounded font-bold text-neutral-600 block shrink-0">
                        {ticket.id}
                      </span>
                      <div className="flex items-center space-x-1.5">
                        <span className="text-[10px] font-semibold text-gray-400">{getCategoryTitle(ticket.category)}</span>
                        {getPriorityBadge(ticket.priority)}
                      </div>
                    </div>

                    <h4 className="font-sans font-bold text-xs text-neutral-800 leading-snug line-clamp-1 mb-1" title={ticket.title}>
                      {ticket.title}
                    </h4>

                    {ticket.eventTitle && (
                      <div className="text-[10px] bg-brand-orange/5 text-brand-orange px-1.5 py-0.5 rounded inline-block font-sans font-medium mb-1.5 truncate max-w-full">
                        Evento: {ticket.eventTitle}
                      </div>
                    )}

                    <div className="flex items-center justify-between border-t border-gray-100/80 pt-2 mt-2 gap-2 text-[11px]">
                      <div>
                        <span className="text-gray-400">Por:</span>{' '}
                        <span className="font-semibold text-neutral-600 truncate inline-block max-w-[120px] align-bottom">
                          {ticket.requesterName}
                        </span>
                      </div>
                      {getStatusBadge(ticket.status)}
                    </div>

                    {/* Expandable info detailed display on click */}
                    {isSelected && (
                      <div className="border-t border-brand-blue/15 mt-3 pt-3 space-y-3 text-xs leading-relaxed text-gray-700 font-sans" onClick={e => e.stopPropagation()}>
                        
                        <div>
                          <span className="font-bold text-brand-blue text-[10px] uppercase block mb-1">Instruções / Solicitação:</span>
                          <p className="bg-white p-2.5 rounded border border-gray-150 whitespace-pre-wrap">{ticket.description || "Nenhuma instrução adicional escrita."}</p>
                        </div>

                        {/* Attachments inside selected ticket */}
                        {(ticket.links.length > 0 || ticket.videos.length > 0 || ticket.attachments.length > 0) && (
                          <div className="space-y-1.5 bg-neutral-50 p-2.5 rounded border border-gray-200">
                            <span className="font-bold text-neutral-600 text-[10px] uppercase block mb-1">Mídias e Arquivos Vinculados:</span>
                            
                            {ticket.links.map((lnk, i) => (
                              <a
                                key={i}
                                href={lnk}
                                target="_blank"
                                rel="referrer noopener"
                                className="flex items-center text-[10px] text-brand-blue hover:underline gap-1 select-all font-mono truncate"
                              >
                                <Link className="w-3 h-3 text-brand-blue" />
                                <span>{lnk}</span>
                              </a>
                            ))}

                            {ticket.videos.map((vid, i) => (
                              <div key={i} className="flex items-center text-[10px] text-red-600 gap-1 font-mono leading-tight">
                                <Video className="w-3 h-3 text-red-500" />
                                <span>{vid.name} ({vid.displayType})</span>
                              </div>
                            ))}

                            {ticket.attachments.map((att, i) => (
                              <div key={i} className="flex items-center text-[10px] text-neutral-500 gap-1 font-mono">
                                <File className="w-3 h-3 text-neutral-400" />
                                <span>{att.name} ({att.size})</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Interactive support status alteration (simulated administrator dashboard right on the list!) */}
                        <div className="border-t border-gray-100/60 pt-3 flex items-center justify-between gap-1.5">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Gerenciar Status:</span>
                          <div className="flex gap-1 shrink-0">
                            <button
                              onClick={() => {
                                onStatusChange(ticket.id, 'pending');
                                setSelectedTicket({...ticket, status: 'pending'});
                              }}
                              className={`text-[9px] font-bold px-2 py-1 rounded transition-all cursor-pointer ${
                                ticket.status === 'pending'
                                  ? 'bg-neutral-200 text-neutral-700 font-semibold border border-neutral-300'
                                  : 'bg-neutral-50 border border-gray-200 hover:bg-neutral-100 text-gray-500'
                              }`}
                            >
                              Pendente
                            </button>
                            <button
                              onClick={() => {
                                onStatusChange(ticket.id, 'in_progress');
                                setSelectedTicket({...ticket, status: 'in_progress'});
                              }}
                              className={`text-[9px] font-bold px-2 py-1 rounded transition-all cursor-pointer ${
                                ticket.status === 'in_progress'
                                  ? 'bg-amber-100 text-amber-700 font-semibold border border-amber-300 animate-pulse'
                                  : 'bg-neutral-50 border border-gray-200 hover:bg-neutral-100 text-gray-500'
                              }`}
                            >
                              Atender
                            </button>
                            <button
                              onClick={() => {
                                onStatusChange(ticket.id, 'resolved');
                                setSelectedTicket({...ticket, status: 'resolved'});
                              }}
                              className={`text-[9px] font-bold px-2 py-1 rounded transition-all cursor-pointer ${
                                ticket.status === 'resolved'
                                  ? 'bg-green-100 text-green-700 font-semibold border border-green-300'
                                  : 'bg-neutral-50 border border-gray-200 hover:bg-neutral-100 text-gray-500'
                              }`}
                            >
                              Resolver
                            </button>
                          </div>
                        </div>

                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="text-center p-8 border border-dashed border-gray-200 rounded text-gray-400 text-xs">
                Nenhum chamado pendente com os critérios selecionados.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

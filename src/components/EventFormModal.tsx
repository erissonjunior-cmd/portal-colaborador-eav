/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, HelpCircle, Save } from 'lucide-react';
import { SchoolEvent, SCHOOL_SECTORS, SCHOOL_LOCATIONS, SCHOOL_CAMPUSES, DemandedSectorActivity } from '../types';

interface EventFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (event: SchoolEvent) => void;
  editingEvent?: SchoolEvent | null;
}

export default function EventFormModal({ isOpen, onClose, onSubmit, editingEvent }: EventFormModalProps) {
  const [requester, setRequester] = useState('');
  const [requestDate, setRequestDate] = useState('');
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [responsibleSector, setResponsibleSector] = useState('');
  const [location, setLocation] = useState('');
  const [campus, setCampus] = useState<'Vitória' | 'Álvares' | 'Aeroporto'>('Vitória');
  const [objective, setObjective] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [audienceEstimate, setAudienceEstimate] = useState('');
  const [sectorsInvolved, setSectorsInvolved] = useState<string[]>([]);
  const [demands, setDemands] = useState<DemandedSectorActivity[]>([]);

  // Temp demand row values
  const [newDemandedSector, setNewDemandedSector] = useState('');
  const [newResponsible, setNewResponsible] = useState('');
  const [newActivity, setNewActivity] = useState('');

  // Specialized options for TI
  const [tiLinks, setTiLinks] = useState('');
  const [tiEquipment, setTiEquipment] = useState({
    projector: false,
    sound: false,
    microphone: false,
    laptop: false
  });

  // Specialized options for Marketing
  const [mktBriefing, setMktBriefing] = useState('');
  const [mktDeliverables, setMktDeliverables] = useState({
    socialMedia: false,
    photography: false,
    newsletter: false,
    banners: false
  });

  // Hydrate form if editing
  useEffect(() => {
    if (editingEvent) {
      setRequester(editingEvent.requester);
      setRequestDate(editingEvent.requestDate);
      setTitle(editingEvent.title);
      setDate(editingEvent.date);
      setStartTime(editingEvent.startTime);
      setEndTime(editingEvent.endTime);
      setResponsibleSector(editingEvent.responsibleSector);
      setLocation(editingEvent.location);
      setCampus(editingEvent.campus || 'Vitória');
      setObjective(editingEvent.objective);
      setTargetAudience(editingEvent.targetAudience);
      setAudienceEstimate(editingEvent.audienceEstimate);
      setSectorsInvolved(editingEvent.sectorsInvolved || []);
      setDemands(editingEvent.demands || []);
    } else {
      // Set defaults for new session
      const todayString = new Date().toISOString().split('T')[0];
      setRequester('Assistente de Direção');
      setRequestDate(todayString);
      setTitle('');
      setDate('');
      setStartTime('08:00');
      setEndTime('09:00');
      setResponsibleSector('Direção');
      setLocation(SCHOOL_LOCATIONS[0]);
      setCampus('Vitória');
      setObjective('');
      setTargetAudience('');
      setAudienceEstimate('');
      setSectorsInvolved([]);
      setDemands([]);
    }
  }, [editingEvent, isOpen]);

  if (!isOpen) return null;

  const handleToggleSectorInvolved = (sector: string) => {
    if (sectorsInvolved.includes(sector)) {
      setSectorsInvolved(sectorsInvolved.filter(s => s !== sector));
    } else {
      setSectorsInvolved([...sectorsInvolved, sector]);
    }
  };

  const handleAddDemand = () => {
    if (!newDemandedSector) return alert("Selecione o setor demandado.");

    let descriptionDetail = newActivity;

    if (newDemandedSector === 'TI') {
      const selectedEquip = Object.entries(tiEquipment)
        .filter(([_, val]) => val)
        .map(([key]) => {
          if (key === 'projector') return 'Projetor/Multimídia';
          if (key === 'sound') return 'Luminotécnica & Sistema de Som';
          if (key === 'microphone') return 'Microfones sem fio';
          if (key === 'laptop') return 'Suporte técnico / Computador dedicado';
          return key;
        });

      const parts = [];
      if (newActivity.trim()) parts.push(`Instruções: ${newActivity.trim()}`);
      if (tiLinks.trim()) parts.push(`Links/Materiais: ${tiLinks.trim()}`);
      if (selectedEquip.length > 0) parts.push(`Equipamentos Solicitados: ${selectedEquip.join(', ')}`);

      descriptionDetail = parts.join(' | ');
      if (!descriptionDetail) {
        return alert("Por favor, preencha as especificações de TI (instruções, links ou marque os equipamentos).");
      }
    } else if (newDemandedSector === 'Coordenação de Marketing') {
      const selectedChannels = Object.entries(mktDeliverables)
        .filter(([_, val]) => val)
        .map(([key]) => {
          if (key === 'socialMedia') return 'Fotos/Vídeo p/ Instagram';
          if (key === 'photography') return 'Cobertura Fotográfica Integral';
          if (key === 'newsletter') return 'Divulgação na Weekly e-Newsletter';
          if (key === 'banners') return 'Impressão de Banners/Cartazes';
          return key;
        });

      const parts = [];
      if (newActivity.trim()) parts.push(`Briefing Geral: ${newActivity.trim()}`);
      if (mktBriefing.trim()) parts.push(`Pasta/Referências: ${mktBriefing.trim()}`);
      if (selectedChannels.length > 0) parts.push(`Entregas Desejadas: ${selectedChannels.join(', ')}`);

      descriptionDetail = parts.join(' | ');
      if (!descriptionDetail) {
        return alert("Por favor, preencha as especificações de Marketing (briefing, referências ou marque as entregas desejadas).");
      }
    } else {
      if (!newActivity.trim()) return alert("Descreva a demanda/atividade para este setor.");
    }

    const newDemandRow: DemandedSectorActivity = {
      sectorName: newResponsible ? `${newDemandedSector} (${newResponsible})` : newDemandedSector,
      responsiblePerson: newResponsible || "Equipe do Setor",
      demandDescription: descriptionDetail
    };

    setDemands([...demands, newDemandRow]);
    // Reset temp inputs & custom states
    setNewDemandedSector('');
    setNewResponsible('');
    setNewActivity('');
    setTiLinks('');
    setTiEquipment({ projector: false, sound: false, microphone: false, laptop: false });
    setMktBriefing('');
    setMktDeliverables({ socialMedia: false, photography: false, newsletter: false, banners: false });
  };

  const handleRemoveDemand = (index: number) => {
    setDemands(demands.filter((_, i) => i !== index));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title) return alert("Por favor, informe o Nome Geral do Evento.");
    if (!date) return alert("Por favor, selecione a Data do Evento.");
    if (!responsibleSector) return alert("Por favor, indique o Setor Responsável pelo Evento.");
    if (!location) return alert("Por favor, defina o Local do Evento.");

    const eventData: SchoolEvent = {
      id: editingEvent?.id || `evt-${Date.now()}`,
      requester,
      requestDate,
      title,
      date,
      startTime,
      endTime,
      responsibleSector,
      location,
      campus,
      objective,
      targetAudience,
      audienceEstimate,
      sectorsInvolved,
      demands,
      status: editingEvent?.status || 'pending'
    };

    onSubmit(eventData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl border border-gray-200 max-w-4xl w-full max-h-[90vh] overflow-y-auto" id="event-form-modal">
        
        {/* Modal Header */}
        <div className="bg-brand-blue text-white px-6 py-4 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center space-x-2">
            <span className="font-serif text-lg font-bold">
              {editingEvent ? "Editar " : "Cadastrar Novo "} Formulário de Eventos EAV
            </span>
          </div>
          <button 
            id="close-form-modal-btn"
            onClick={onClose} 
            className="text-white/80 hover:text-white hover:bg-white/10 p-1.5 rounded-full transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleFormSubmit} className="p-6 space-y-8">
          
          {/* Section 1: Metadata */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-md border border-gray-200">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                Data de Requisição
              </label>
              <input
                id="input-req-date"
                type="date"
                required
                value={requestDate}
                onChange={e => setRequestDate(e.target.value)}
                className="w-full text-sm bg-white border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-brand-blue focus:border-brand-blue outline-hidden text-gray-800"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                Setor Solicitante
              </label>
              <input
                id="input-req-sector"
                type="text"
                required
                placeholder="Ex: Assistente de Direção, Coordenação de TI..."
                value={requester}
                onChange={e => setRequester(e.target.value)}
                className="w-full text-sm bg-white border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-brand-blue focus:border-brand-blue outline-hidden text-gray-800"
              />
            </div>
          </div>

          {/* Section 2: General Event Parameters */}
          <div className="space-y-4">
            <h3 className="font-serif text-md font-bold text-brand-blue border-b border-gray-100 pb-2 flex items-center gap-2">
              <span className="bg-brand-blue text-white w-5 h-5 rounded-full inline-flex items-center justify-center text-xs">1</span>
              Informações do Evento
            </h3>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Nome Geral do Evento <span className="text-red-500">*</span>
              </label>
              <input
                id="input-event-title"
                type="text"
                required
                placeholder="Ex: Reunião pós viagem NASA, Formatura Infantil, Open House..."
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full text-sm bg-white border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-brand-blue focus:border-brand-blue outline-hidden text-gray-800 font-medium"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Data do Evento <span className="text-red-500">*</span>
                </label>
                <input
                  id="input-event-date"
                  type="date"
                  required
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="w-full text-sm bg-white border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-brand-blue focus:border-brand-blue outline-hidden text-gray-800"
                />
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Horário de Início <span className="text-red-500">*</span>
                </label>
                <input
                  id="input-event-start"
                  type="text"
                  required
                  placeholder="Ex: 8h ou 08:00"
                  value={startTime}
                  onChange={e => setStartTime(e.target.value)}
                  className="w-full text-sm bg-white border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-brand-blue focus:border-brand-blue outline-hidden text-gray-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Horário de Término <span className="text-red-500">*</span>
                </label>
                <input
                  id="input-event-end"
                  type="text"
                  required
                  placeholder="Ex: 9h ou 09:00"
                  value={endTime}
                  onChange={e => setEndTime(e.target.value)}
                  className="w-full text-sm bg-white border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-brand-blue focus:border-brand-blue outline-hidden text-gray-800"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Setor Responsável <span className="text-red-500">*</span>
                </label>
                <input
                  id="input-responsible-sector"
                  type="text"
                  required
                  placeholder="Ex: Direção, Marketing, Coordenação Preschool..."
                  value={responsibleSector}
                  onChange={e => setResponsibleSector(e.target.value)}
                  className="w-full text-sm bg-white border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-brand-blue focus:border-brand-blue outline-hidden text-gray-800 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Campus <span className="text-red-500">*</span>
                </label>
                <select
                  id="select-event-campus"
                  value={campus}
                  onChange={e => setCampus(e.target.value as any)}
                  className="w-full text-sm bg-white border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-brand-blue focus:border-brand-blue outline-hidden text-gray-800 font-medium"
                >
                  {SCHOOL_CAMPUSES.map(camp => (
                    <option key={camp} value={camp}>{camp}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Local <span className="text-red-500">*</span>
                </label>
                <select
                  id="select-event-location"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  className="w-full text-sm bg-white border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-brand-blue focus:border-brand-blue outline-hidden text-gray-800"
                >
                  {SCHOOL_LOCATIONS.map(loc => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                  <option value="Outro Local">Outro Local...</option>
                </select>
              </div>
            </div>

            {location === "Outro Local" && (
              <div>
                <label className="block text-xs font-semibold text-orange-600 uppercase tracking-wider mb-1">
                  Especifique o Outro Local:
                </label>
                <input
                  id="input-custom-location"
                  type="text"
                  placeholder="Digite o nome do local..."
                  onChange={e => setLocation(e.target.value)}
                  className="w-full text-sm bg-amber-50/20 border border-amber-300 rounded px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-hidden text-gray-800"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Objetivo do Evento
              </label>
              <textarea
                id="input-event-objective"
                rows={2}
                placeholder="Qual o propósito, meta ou pauta principal do evento?"
                value={objective}
                onChange={e => setObjective(e.target.value)}
                className="w-full text-sm bg-white border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-brand-blue focus:border-brand-blue outline-hidden text-gray-800"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Público-Alvo
                </label>
                <input
                  id="input-event-audience"
                  type="text"
                  placeholder="Ex: Famílias do High School, Professores..."
                  value={targetAudience}
                  onChange={e => setTargetAudience(e.target.value)}
                  className="w-full text-sm bg-white border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-brand-blue focus:border-brand-blue outline-hidden text-gray-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Estimativa de Público
                </label>
                <input
                  id="input-event-size"
                  type="text"
                  placeholder="Ex: 50 pessoas, 120 pais..."
                  value={audienceEstimate}
                  onChange={e => setAudienceEstimate(e.target.value)}
                  className="w-full text-sm bg-white border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-brand-blue focus:border-brand-blue outline-hidden text-gray-800"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Sectors Involved Grid */}
          <div className="space-y-4">
            <div className="border-b border-gray-100 pb-2">
              <h3 className="font-serif text-md font-bold text-brand-blue flex items-center gap-2">
                <span className="bg-brand-blue text-white w-5 h-5 rounded-full inline-flex items-center justify-center text-xs">2</span>
                Selecione os setores envolvidos com um "X"
              </h3>
              <p className="text-xs text-gray-500 mt-1">Marque os setores que farão parte ou devem ter ciência geral deste evento de acordo com o formulário padrão.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-[220px] overflow-y-auto p-3 border border-gray-200 rounded-md bg-gray-50/50">
              {SCHOOL_SECTORS.map((sector) => {
                const isChecked = sectorsInvolved.includes(sector);
                return (
                  <label
                    key={sector}
                    className={`flex items-start text-xs p-2 rounded cursor-pointer transition-all border ${
                      isChecked
                        ? 'bg-brand-blue/5 border-brand-blue/30 text-brand-blue font-medium'
                        : 'bg-white border-gray-200 hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleToggleSectorInvolved(sector)}
                      className="mt-0.5 mr-2.5 rounded text-brand-blue focus:ring-brand-blue accent-brand-blue w-3.5 h-3.5"
                    />
                    <span>{sector}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Section 4: Demanded Sectors and Tasks */}
          <div className="space-y-4">
            <div className="border-b border-gray-100 pb-2">
              <h3 className="font-serif text-md font-bold text-brand-blue flex items-center gap-2">
                <span className="bg-brand-blue text-white w-5 h-5 rounded-full inline-flex items-center justify-center text-xs">3</span>
                Atividades e Setores Demandados Especificamente
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Estabeleça quais setores serão acionados formalmente e qual a demanda exata para este evento (Ex: Marketing para fotos, TI para projetor, etc.).
              </p>
            </div>

            {/* Existing Demands list */}
            {demands.length > 0 ? (
              <div className="border border-gray-200 rounded-md overflow-hidden">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-100 text-xs text-gray-600 uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="px-4 py-3 border-b border-gray-200">Setor Demandado</th>
                      <th className="px-4 py-3 border-b border-gray-200">Demanda / Atividade do Evento</th>
                      <th className="px-4 py-3 border-b border-gray-200 text-center w-16">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 text-gray-700 font-sans">
                    {demands.map((dem, idx) => (
                      <tr key={idx} className="hover:bg-gray-50/50">
                        <td className="px-4 py-3 font-semibold text-brand-blue text-xs">
                          {dem.sectorName}
                        </td>
                        <td className="px-4 py-3 text-xs leading-relaxed whitespace-pre-wrap">
                          {dem.demandDescription}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveDemand(idx)}
                            className="text-red-500 hover:text-red-700 p-1 rounded-sm hover:bg-red-50 transition-all"
                            title="Remover demanda"
                          >
                            <Trash2 className="w-4 h-4 ml-auto mr-auto" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center p-6 border border-dashed border-gray-300 rounded text-gray-500 text-xs">
                Nenhum setor demandado adicionado ainda. Utilize a ferramenta abaixo para vincular atividades aos setores competentes.
              </div>
            )}

            {/* Form to add a demand */}
            <div className="bg-brand-cream/30 border border-brand-cream-dark/60 p-4 rounded-lg space-y-3">
              <div className="text-xs font-bold text-brand-orange uppercase tracking-wider mb-2">
                + Adicionar Atividade por Setor Demandado
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1">
                    Selecione o Setor
                  </label>
                  <select
                    value={newDemandedSector}
                    onChange={e => setNewDemandedSector(e.target.value)}
                    className="w-full text-xs bg-white border border-gray-300 rounded px-2.5 py-1.5 outline-hidden text-gray-800 font-semibold"
                  >
                    <option value="">-- Escolha o Setor --</option>
                    <option value="TI">TI (Suporte & Equipamentos)</option>
                    <option value="Coordenação de Marketing">Marketing (Comunicação & Mídia)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1">
                    Responsável / Contato (Opcional)
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Mariana Buaiz, Jennifer Rocha..."
                    value={newResponsible}
                    onChange={e => setNewResponsible(e.target.value)}
                    className="w-full text-xs bg-white border border-gray-300 rounded px-2.5 py-1.5 outline-hidden text-gray-800"
                  />
                </div>
              </div>

              {/* Dynamic Support fields based on selected sector */}
              {newDemandedSector === 'TI' && (
                <div className="bg-white p-3 rounded-lg border border-brand-blue/20 space-y-2.5 animate-fadeIn">
                  <div className="flex items-center space-x-1 text-[10px] font-bold text-brand-blue uppercase tracking-wider">
                    <span>Configurações Especiais de TI</span>
                  </div>
                  <div>
                    <label className="block text-[10px] text-gray-500 font-medium mb-1">Links ou Materiais Relevantes (Apresentações, Softwares)</label>
                    <input
                      type="text"
                      placeholder="Cole links ou materiais do Google Drive, Canva, etc."
                      value={tiLinks}
                      onChange={e => setTiLinks(e.target.value)}
                      className="w-full text-xs bg-gray-50 border border-gray-300 rounded px-2.5 py-1.5 font-mono text-gray-700"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-gray-500 font-medium mb-1.5">Equipamentos Solicitados</label>
                    <div className="grid grid-cols-2 gap-2 text-[11px] text-gray-700">
                      <label className="flex items-center space-x-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={tiEquipment.projector}
                          onChange={e => setTiEquipment({...tiEquipment, projector: e.target.checked})}
                          className="rounded text-brand-blue focus:ring-brand-blue w-3.5 h-3.5 accent-brand-blue"
                        />
                        <span>Projetor / Multimídia</span>
                      </label>
                      <label className="flex items-center space-x-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={tiEquipment.sound}
                          onChange={e => setTiEquipment({...tiEquipment, sound: e.target.checked})}
                          className="rounded text-brand-blue focus:ring-brand-blue w-3.5 h-3.5 accent-brand-blue"
                        />
                        <span>Luz & Sistema de Som</span>
                      </label>
                      <label className="flex items-center space-x-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={tiEquipment.microphone}
                          onChange={e => setTiEquipment({...tiEquipment, microphone: e.target.checked})}
                          className="rounded text-brand-blue focus:ring-brand-blue w-3.5 h-3.5 accent-brand-blue"
                        />
                        <span>Microfones sem fio</span>
                      </label>
                      <label className="flex items-center space-x-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={tiEquipment.laptop}
                          onChange={e => setTiEquipment({...tiEquipment, laptop: e.target.checked})}
                          className="rounded text-brand-blue focus:ring-brand-blue w-3.5 h-3.5 accent-brand-blue"
                        />
                        <span>Notebook Corporativo</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {newDemandedSector === 'Coordenação de Marketing' && (
                <div className="bg-white p-3 rounded-lg border border-brand-orange/20 space-y-2.5 animate-fadeIn">
                  <div className="flex items-center space-x-1 text-[10px] font-bold text-brand-orange uppercase tracking-wider">
                    <span>Configurações de Divulgação Marketing</span>
                  </div>
                  <div>
                    <label className="block text-[10px] text-gray-500 font-medium mb-1">Pasta do Briefing / Referências Visuais</label>
                    <input
                      type="text"
                      placeholder="Link da pasta de briefing no Google Drive ou imagens de referência"
                      value={mktBriefing}
                      onChange={e => setMktBriefing(e.target.value)}
                      className="w-full text-xs bg-gray-50 border border-gray-300 rounded px-2.5 py-1.5 font-mono text-gray-700"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-gray-500 font-medium mb-1.5">Canais & Entregas Desejadas</label>
                    <div className="grid grid-cols-2 gap-2 text-[11px] text-gray-700">
                      <label className="flex items-center space-x-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={mktDeliverables.socialMedia}
                          onChange={e => setMktDeliverables({...mktDeliverables, socialMedia: e.target.checked})}
                          className="rounded text-brand-orange focus:ring-brand-orange w-3.5 h-3.5 accent-brand-orange"
                        />
                        <span>Fotos/Vídeos p/ Instagram</span>
                      </label>
                      <label className="flex items-center space-x-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={mktDeliverables.photography}
                          onChange={e => setMktDeliverables({...mktDeliverables, photography: e.target.checked})}
                          className="rounded text-brand-orange focus:ring-brand-orange w-3.5 h-3.5 accent-brand-orange"
                        />
                        <span>Fotógrafo Profissional</span>
                      </label>
                      <label className="flex items-center space-x-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={mktDeliverables.newsletter}
                          onChange={e => setMktDeliverables({...mktDeliverables, newsletter: e.target.checked})}
                          className="rounded text-brand-orange focus:ring-brand-orange w-3.5 h-3.5 accent-brand-orange"
                        />
                        <span>Aviso na Weekly Newsletter</span>
                      </label>
                      <label className="flex items-center space-x-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={mktDeliverables.banners}
                          onChange={e => setMktDeliverables({...mktDeliverables, banners: e.target.checked})}
                          className="rounded text-brand-orange focus:ring-brand-orange w-3.5 h-3.5 accent-brand-orange"
                        />
                        <span>Banners/Cartazes Físicos</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1">
                  Instruções ou Observações adicionais
                </label>
                <textarea
                  rows={2}
                  placeholder="Instruções gerais, horários específicos de montagem ou observações gerais de suporte para o setor..."
                  value={newActivity}
                  onChange={e => setNewActivity(e.target.value)}
                  className="w-full text-xs bg-white border border-gray-300 rounded px-2.5 py-1.5 outline-hidden text-gray-800"
                />
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={handleAddDemand}
                  className="flex items-center space-x-1 bg-brand-orange hover:bg-brand-orange/90 text-white font-sans text-xs font-semibold px-3 py-1.5 rounded transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Vincular ao Formulário</span>
                </button>
              </div>
            </div>
          </div>

          {/* Modal Footer / Actions */}
          <div className="flex items-center justify-end space-x-3 border-t border-gray-100 pt-5">
            <button
              id="cancel-form-btn"
              type="button"
              onClick={onClose}
              className="bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 font-sans text-sm font-medium px-4 py-2.5 rounded transition-all cursor-pointer"
            >
              Cancelar
            </button>
            <button
              id="submit-event-btn"
              type="submit"
              className="flex items-center space-x-2 bg-brand-blue hover:bg-brand-blue/90 text-white font-sans text-sm font-semibold px-5 py-2.5 rounded transition-all shadow-md hover:translate-y-[-1px] cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Salvar Formulário EAV</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}

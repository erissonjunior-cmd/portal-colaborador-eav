import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar, CheckCircle, Clock, MapPin, Search, Filter, 
  AlertCircle, Info, ChevronRight, Eye, EyeOff
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { SchoolEvent } from '../types';

interface EventsTabProps {
  onEditEvent: (event: SchoolEvent) => void;
  onViewDetails: (event: SchoolEvent) => void;
}

export default function EventsTab({ onEditEvent, onViewDetails }: EventsTabProps) {
  const { events, deleteEvent, toggleEventStatus } = useStore();
  
  // Search and Filtering States
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLocation, setFilterLocation] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterCampus, setFilterCampus] = useState('ALL');
  const [showDashboard, setShowDashboard] = useState<boolean>(() => {
    const cached = localStorage.getItem('eav_dashboard_visible');
    return cached === null ? false : cached === 'true';
  });

  const handleToggleDashboard = () => {
    const newVal = !showDashboard;
    setShowDashboard(newVal);
    localStorage.setItem('eav_dashboard_visible', String(newVal));
  };

  // Filtering Logic
  const filteredEvents = events.filter(ev => {
    const matchesSearch = ev.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          ev.objective.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          ev.responsibleSector.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLocation = filterLocation === 'ALL' || ev.location === filterLocation;
    const matchesStatus = filterStatus === 'ALL' || ev.status === filterStatus;
    const matchesCampus = filterCampus === 'ALL' || (ev.campus || 'Vitória') === filterCampus;
    return matchesSearch && matchesLocation && matchesStatus && matchesCampus;
  });

  const uniqueLocations = Array.from(new Set(events.map(ev => ev.location)));
  const totalEvents = events.length;
  const approvedEvents = events.filter(e => e.status === 'approved').length;
  const pendingEvents = events.filter(e => e.status === 'pending').length;

  return (
    <div className="max-w-[1240px] mx-auto px-4 sm:px-6 space-y-8" id="events-tab-container">
      {/* 1. Welcome Header and Portal Statistics Dashboard */}
      <div className="bg-white p-6 sm:p-8 rounded-lg border border-gray-100 shadow-xs space-y-6 overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3.5 flex-wrap">
              <h1 className="font-serif text-3xl font-bold text-brand-blue tracking-tight leading-none">
                Painel de Eventos Escolares
              </h1>
              {!showDashboard && (
                <div className="flex flex-wrap gap-1.5 items-center animate-fadeIn">
                  <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-brand-cream text-brand-blue border border-brand-cream-dark/30 select-none">
                    <Calendar className="w-2.5 h-2.5 text-brand-blue" />
                    <span>Eventos: {totalEvents}</span>
                  </span>
                  <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-green-50 text-brand-green border border-green-100 select-none">
                    <CheckCircle className="w-2.5 h-2.5 text-brand-green" />
                    <span>Aprovados: {approvedEvents}</span>
                  </span>
                  <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-50 text-brand-orange border border-amber-100 select-none">
                    <Clock className="w-2.5 h-2.5 text-brand-orange" />
                    <span>Em Análise: {pendingEvents}</span>
                  </span>
                </div>
              )}
            </div>
            <p className={showDashboard ? "text-gray-500 text-xs sm:text-sm mt-1 max-w-2xl font-sans" : "text-gray-400 text-[11px] font-sans"}>
              {showDashboard ? "Gerencie o fluxo completo de autorizações acadêmicas, de segurança, audiovisual e coordenação interna." : "Dica: O painel operacional está contraído para oferecer máxima área útil."}
            </p>
          </div>

          <button
            onClick={handleToggleDashboard}
            className="bg-neutral-50 hover:bg-neutral-100 text-neutral-600 hover:text-neutral-800 text-xs font-bold px-3.5 py-2 rounded-lg border border-gray-200 transition-all flex items-center space-x-1.5 shrink-0 w-fit cursor-pointer shadow-2xs active:scale-[0.98]"
          >
            {showDashboard ? <><EyeOff className="w-3.5 h-3.5" /><span>Contrair Painel</span></> : <><Eye className="w-3.5 h-3.5" /><span>Expandir Estatísticas</span></>}
          </button>
        </div>

        <AnimatePresence initial={false}>
          {showDashboard && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1 pb-2">
                <StatCard label="Total Solicitado" value={totalEvents} icon={<Calendar className="w-4 h-4" />} />
                <StatCard label="Aprovados" value={approvedEvents} icon={<CheckCircle className="w-4 h-4" />} color="green" />
                <StatCard label="Em Análise" value={pendingEvents} icon={<Clock className="w-4 h-4" />} color="orange" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 2. Filter Bar */}
      <div className="bg-white border border-gray-150 rounded-lg p-4 sm:p-5 flex flex-col md:flex-row items-stretch md:items-center gap-4 font-sans justify-between shadow-xs">
        <div className="flex-1 relative">
          <Search className="w-4.5 h-4.5 text-gray-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Buscar eventos por nome, pauta ou setor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs sm:text-sm pl-10 pr-4 py-2.5 border border-gray-200 rounded-md bg-neutral-50 focus:bg-white focus:ring-1 focus:ring-brand-blue outline-none transition-all"
          />
        </div>

        <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
          <FilterSelect value={filterCampus} onChange={setFilterCampus} options={['ALL', 'Vitória', 'Álvares', 'Aeroporto']} label="Campus" />
          <FilterSelect value={filterLocation} onChange={setFilterLocation} options={['ALL', ...uniqueLocations]} label="Local" />
          <FilterSelect value={filterStatus} onChange={setFilterStatus} options={['ALL', 'approved', 'pending', 'rejected']} label="Status" />
        </div>
      </div>

      {/* 3. Grid */}
      {filteredEvents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <EventCard 
              key={event.id} 
              event={event} 
              onEdit={() => onEditEvent(event)}
              onDelete={() => deleteEvent(event.id)}
              onToggleStatus={() => toggleEventStatus(event.id, event.status)}
              onView={() => onViewDetails(event)}
            />
          ))}
        </div>
      ) : (
        <EmptyState />
      )}
    </div>
  );
}

function StatCard({ label, value, icon, color = 'blue' }: { label: string, value: number, icon: React.ReactNode, color?: string }) {
  const colors: Record<string, string> = {
    blue: 'bg-brand-cream/25 border-brand-cream-dark/40 text-brand-blue',
    green: 'bg-green-50/20 border-green-100 text-brand-green',
    orange: 'bg-amber-50/10 border-amber-200 text-brand-orange'
  };
  return (
    <div className={`${colors[color]} border p-4 rounded-lg shadow-2xs hover:shadow-xs transition-shadow`}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{label}</span>
        {icon}
      </div>
      <div className="text-2xl font-bold font-serif">{value}</div>
    </div>
  );
}

function FilterSelect({ value, onChange, options, label }: { value: string, onChange: (v: string) => void, options: string[], label: string }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="text-xs bg-white border border-gray-300 rounded px-2.5 py-2 font-semibold text-gray-600 outline-none"
    >
      {options.map(opt => <option key={opt} value={opt}>{opt === 'ALL' ? `Todos (${label})` : opt}</option>)}
    </select>
  );
}

function EventCard({ event, onEdit, onDelete, onToggleStatus, onView }: { 
  event: SchoolEvent, 
  onEdit: () => void, 
  onDelete: () => void | Promise<void>, 
  onToggleStatus: () => void | Promise<void>, 
  onView: () => void 
}) {
  return (
    <div className="bg-white border border-gray-150 rounded-lg overflow-hidden flex flex-col justify-between transition-all hover:shadow-md border-l-3 border-l-brand-blue">
      <div className="p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between gap-1">
          <span className="text-[10px] bg-neutral-100 font-bold px-2 py-0.5 rounded text-gray-500">Ref: {event.id}</span>
          <button
            onClick={onToggleStatus}
            className={`text-[10px] font-bold tracking-wide uppercase px-2.5 py-0.5 rounded-full border cursor-pointer ${
              event.status === 'approved' ? 'bg-green-50 text-brand-green border-green-200' : 
              event.status === 'rejected' ? 'bg-red-50 text-red-600 border-red-200' : 'bg-amber-50 text-brand-orange border-amber-300'
            }`}
          >
            ● {event.status === 'approved' ? 'Aprovado' : event.status === 'rejected' ? 'Rejeitado' : 'Em Análise'}
          </button>
        </div>
        <div>
          <h3 className="font-serif font-bold text-lg text-brand-blue leading-snug line-clamp-1 hover:underline cursor-pointer" onClick={onView}>{event.title}</h3>
          <p className="text-[11px] text-gray-400 font-sans">Setor: <span className="font-semibold text-gray-600">{event.responsibleSector}</span></p>
        </div>
        <div className="space-y-2 bg-neutral-50/50 p-3 rounded-md border border-neutral-100 text-xs">
          <div className="flex items-center text-gray-600 space-x-2">
            <Calendar className="w-4 h-4 text-brand-orange shrink-0" />
            <span className="font-semibold">{event.date}</span>
            <span className="text-gray-400 font-mono">({event.startTime}h às {event.endTime}h)</span>
          </div>
          <div className="flex items-center text-gray-600 space-x-2">
            <MapPin className="w-4 h-4 text-brand-green shrink-0" />
            <span className="font-medium text-neutral-800 truncate">{event.location}</span>
          </div>
        </div>
      </div>
      <div className="bg-gray-50/75 border-t border-gray-150 px-5 py-3 flex items-center justify-between gap-1">
        <div className="flex gap-1.5">
          <button onClick={onEdit} className="bg-white hover:bg-gray-100 border border-gray-300 text-[11px] font-bold text-neutral-700 px-2.5 py-1.5 rounded transition-all">Editar</button>
          <button onClick={() => confirm("Deseja arquivar?") && onDelete()} className="bg-white hover:bg-red-50 border border-red-200 text-[11px] font-bold text-red-600 px-2.5 py-1.5 rounded transition-all">Excluir</button>
        </div>
        <button onClick={onView} className="bg-brand-blue hover:bg-brand-blue/90 text-white font-bold text-[11px] px-3 py-1.5 rounded flex items-center space-x-0.5">
          <span>Ficha EAV</span> <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-16 bg-white border border-gray-150 rounded-lg p-8">
      <AlertCircle className="w-12 h-12 text-brand-orange mx-auto mb-3" />
      <h4 className="font-bold text-neutral-800 text-lg">Nenhum evento localizado</h4>
      <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">Tente alterar os filtros ou crie um novo evento.</p>
    </div>
  );
}

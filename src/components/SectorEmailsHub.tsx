/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { 
  Mail, 
  Plus, 
  Trash2, 
  Search, 
  Building2, 
  CheckCircle, 
  AlertCircle,
  X,
  Sparkles
} from 'lucide-react';
import { SectorEmails } from '../types';

interface SectorEmailsHubProps {
  sectorEmails: SectorEmails;
  onUpdateEmails: (updated: SectorEmails) => void;
  sectorsList: string[];
}

export default function SectorEmailsHub({ sectorEmails, onUpdateEmails, sectorsList }: SectorEmailsHubProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [newEmailInputs, setNewEmailInputs] = useState<Record<string, string>>({});
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Filter sectors based on search
  const filteredSectors = sectorsList.filter(sector => 
    sector.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Validate email address helper
  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // Input controller helper
  const handleInputChange = (sector: string, value: string) => {
    setNewEmailInputs(prev => ({
      ...prev,
      [sector]: value
    }));
  };

  // Add an email to a sector
  const handleAddEmail = (sector: string) => {
    const emailToAdd = (newEmailInputs[sector] || '').trim();
    if (!emailToAdd) return;

    if (!isValidEmail(emailToAdd)) {
      setStatusMessage({
        text: `O e-mail "${emailToAdd}" não parece ser válido. Use o formato correto (ex: nome@escolaamericana.com.br).`,
        type: 'error'
      });
      setTimeout(() => setStatusMessage(null), 5000);
      return;
    }

    const currentEmails = sectorEmails[sector] || [];
    
    if (currentEmails.includes(emailToAdd)) {
      setStatusMessage({
        text: `O e-mail "${emailToAdd}" já está cadastrado para o setor "${sector}".`,
        type: 'error'
      });
      setTimeout(() => setStatusMessage(null), 4000);
      return;
    }

    const updatedEmails = {
      ...sectorEmails,
      [sector]: [...currentEmails, emailToAdd]
    };

    onUpdateEmails(updatedEmails);
    
    // Clear input
    setNewEmailInputs(prev => ({
      ...prev,
      [sector]: ''
    }));

    setStatusMessage({
      text: `E-mail adicionado com sucesso ao setor ${sector}!`,
      type: 'success'
    });
    setTimeout(() => setStatusMessage(null), 3000);
  };

  // Remove email helper
  const handleRemoveEmail = (sector: string, emailToRemove: string) => {
    const currentEmails = sectorEmails[sector] || [];
    const filtered = currentEmails.filter(email => email !== emailToRemove);
    
    const updatedEmails = {
      ...sectorEmails,
      [sector]: filtered
    };

    onUpdateEmails(updatedEmails);

    setStatusMessage({
      text: `E-mail removido das notificações do setor ${sector}.`,
      type: 'success'
    });
    setTimeout(() => setStatusMessage(null), 3500);
  };

  // Clear all emails for a sector
  const handleClearSector = (sector: string) => {
    if (window.confirm(`Deseja realmente remover todos os e-mails cadastrados para o setor "${sector}"?`)) {
      const updatedEmails = {
        ...sectorEmails,
        [sector]: []
      };
      onUpdateEmails(updatedEmails);
      setStatusMessage({
        text: `Todos os e-mails do setor ${sector} foram limpos.`,
        type: 'success'
      });
      setTimeout(() => setStatusMessage(null), 3500);
    }
  };

  // Count total configured emails across all sectors
  const totalConfiguredEmails = Object.values(sectorEmails).reduce((sum, list) => sum + (list?.length || 0), 0);
  const sectorsWithEmailsCount = Object.keys(sectorEmails).filter(sector => sectorEmails[sector]?.length > 0).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 py-2 animate-fadeIn font-sans">
      
      {/* Tab Banner Description */}
      <div className="bg-brand-blue text-white rounded-2xl p-6 shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-orange/10 rounded-full blur-2xl transform translate-x-8 -translate-y-8" />
        <div className="absolute -bottom-8 left-1/3 w-48 h-48 bg-brand-green/10 rounded-full blur-3xl" />
        
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6 z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-brand-orange text-white uppercase tracking-wider">
              <Mail className="w-3.5 h-3.5" />
              <span>Configuração Dinâmica de Notificações</span>
            </div>
            <h1 className="text-2xl font-serif font-bold text-white tracking-tight">
              E-mails de Destino por Setor
            </h1>
            <p className="text-xs text-blue-100 leading-relaxed font-light">
              Gerencie para quais caixas de entrada os formulários de eventos e solicitações de demanda serão direcionados. 
              Você pode vincular <strong>múltiplos e-mails</strong> para cada setor estratégico da Escola Americana de Vitória. 
              As notificações automáticas por IA e lembretes semanais serão enviados aos endereços cadastrados abaixo.
            </p>
          </div>

          <div className="flex gap-4 self-start md:self-auto uppercase tracking-wider">
            <div className="bg-white/10 px-4 py-3 rounded-xl border border-white/10 backdrop-blur-xs text-center min-w-[100px]">
              <div className="text-2xl font-bold font-serif text-white">{totalConfiguredEmails}</div>
              <div className="text-[9px] text-blue-200 font-bold mt-1">E-mails Cadastrados</div>
            </div>
            <div className="bg-white/10 px-4 py-3 rounded-xl border border-white/10 backdrop-blur-xs text-center min-w-[100px]">
              <div className="text-2xl font-bold font-serif text-white">{sectorsWithEmailsCount}</div>
              <div className="text-[9px] text-blue-200 font-bold mt-1">Setores Ativos</div>
            </div>
          </div>
        </div>
      </div>

      {/* Status messages alerts */}
      {statusMessage && (
        <div className={`p-4 rounded-xl border flex items-center space-x-3 text-xs font-semibold animate-fadeIn ${
          statusMessage.type === 'success' 
            ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
            : 'bg-rose-50 text-rose-800 border-rose-200'
        }`}>
          {statusMessage.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          )}
          <span className="flex-1">{statusMessage.text}</span>
          <button 
            onClick={() => setStatusMessage(null)}
            className="text-gray-400 hover:text-gray-600 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Control row with search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-brand-cream-dark/60 shadow-2xs">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Pesquisar setor da Escola Americana (ex: TI, Marketing, Admissions...)"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-xs bg-gray-50 border border-gray-300 rounded-xl focus:outline-hidden focus:border-brand-blue/65 text-gray-800 font-medium"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex items-center space-x-3 shrink-0 text-xs font-semibold text-gray-500">
          <span>Mostrando {filteredSectors.length} de {sectorsList.length} setores</span>
        </div>
      </div>

      {/* Primary Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredSectors.map((sector) => {
          const emails = sectorEmails[sector] || [];
          const hasEmails = emails.length > 0;
          
          return (
            <div 
              key={sector}
              id={`sector-card-${sector.replace(/\s+/g, '-').toLowerCase()}`}
              className={`bg-white rounded-2xl border p-5 transition-all duration-200 flex flex-col justify-between ${
                hasEmails 
                  ? 'border-brand-blue/20 ring-1 ring-brand-blue/5 shadow-2xs' 
                  : 'border-brand-cream-dark/60 shadow-3xs opacity-85 hover:opacity-100'
              }`}
            >
              <div>
                {/* Sector Header */}
                <div className="flex items-start justify-between gap-2 border-b border-gray-100 pb-3 mb-4">
                  <div className="flex items-center space-x-2.5">
                    <div className={`p-2 rounded-lg ${hasEmails ? 'bg-brand-blue/10 text-brand-blue' : 'bg-gray-100 text-gray-400'}`}>
                      <Building2 className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <h3 className="text-xs sm:text-sm font-bold text-gray-800 leading-tight">
                        {sector}
                      </h3>
                      <span className="text-[10px] text-gray-400 font-semibold block mt-0.5">
                        {hasEmails 
                          ? `${emails.length} e-mail(s) cadastrado(s)` 
                          : 'Nenhum e-mail registrado'
                        }
                      </span>
                    </div>
                  </div>

                  {hasEmails && (
                    <button
                      onClick={() => handleClearSector(sector)}
                      className="text-[10px] font-bold text-rose-600 hover:text-rose-800 hover:bg-rose-50 px-2 py-1 rounded-md transition-all cursor-pointer"
                      title="Limpar todos os e-mails deste setor"
                    >
                      Remover todos
                    </button>
                  )}
                </div>

                {/* Email Address Add Input */}
                <div className="mb-4">
                  <div className="flex items-center gap-1.5">
                    <div className="relative flex-1">
                      <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                      <input
                        type="email"
                        placeholder="Adicionar novo e-mail para este setor..."
                        value={newEmailInputs[sector] || ''}
                        onChange={e => handleInputChange(sector, e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddEmail(sector);
                          }
                        }}
                        className="w-full pl-8.5 pr-2 py-1.5 text-xs bg-gray-50/50 border border-gray-200 rounded-lg focus:outline-hidden focus:border-brand-blue text-gray-800"
                      />
                    </div>
                    <button
                      onClick={() => handleAddEmail(sector)}
                      disabled={!(newEmailInputs[sector] || '').trim()}
                      className="bg-brand-blue hover:bg-brand-blue/90 disabled:opacity-45 text-white p-1.5 rounded-lg transition-all cursor-pointer shrink-0"
                      title="Adicionar e-mail"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Array of Email Tags */}
                <div>
                  {hasEmails ? (
                    <div className="flex flex-wrap gap-2">
                      {emails.map((email) => (
                        <div 
                          key={email}
                          className="inline-flex items-center bg-gray-100 border border-gray-200 rounded-lg px-2.5 py-1 text-xs text-gray-700 font-mono tracking-tight"
                        >
                          <span className="mr-2 truncate max-w-[200px]" title={email}>{email}</span>
                          <button
                            onClick={() => handleRemoveEmail(sector, email)}
                            className="text-gray-400 hover:text-rose-600 p-0.5 rounded-full hover:bg-gray-200 transition-colors cursor-pointer"
                            title={`Remover ${email}`}
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-5 border border-dashed border-gray-200 rounded-xl bg-gray-50/30 text-[11px] text-gray-400 font-medium">
                      Sem notificações ativas por e-mail para este setor.
                    </div>
                  )}
                </div>
              </div>

              {/* Action notice for predefined systems */}
              {(sector === 'TI' || sector === 'Coordenação de Marketing') && (
                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                  <div className="flex items-center space-x-1.5 text-[9px] font-bold text-brand-orange uppercase">
                    <Sparkles className="w-3 h-3 text-brand-orange" />
                    <span>Setor Prioritário de Eventos</span>
                  </div>
                  <span className="text-[10px] text-gray-400 font-semibold italic">Campos customizados integrados</span>
                </div>
              )}
            </div>
          );
        })}

        {filteredSectors.length === 0 && (
          <div className="col-span-full text-center py-12 bg-white rounded-2xl border border-brand-cream-dark/60 shadow-3xs">
            <Mail className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <h3 className="font-serif text-sm font-bold text-gray-700">Nenhum setor encontrado</h3>
            <p className="text-xs text-gray-400 mt-1">
              Refine os termos de busca ou digite o nome completo do departamento.
            </p>
          </div>
        )}
      </div>

    </div>
  );
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { X, Printer, HelpCircle, Calendar, CheckSquare, Square, FileText } from 'lucide-react';
import { SchoolEvent, SCHOOL_SECTORS } from '../types';

interface EventDetailsModalProps {
  event: SchoolEvent | null;
  isOpen: boolean;
  onClose: () => void;
  onRequestSupport: (eventId: string) => void;
  onGoToSync?: () => void;
}

export default function EventDetailsModal({ event, isOpen, onClose, onRequestSupport, onGoToSync }: EventDetailsModalProps) {
  if (!isOpen || !event) return null;

  // Print logic
  const handlePrint = () => {
    // Basic browser print trigger
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 print:static print:bg-white print:p-0">
      <div className="bg-white rounded-lg shadow-2xl border border-gray-200 max-w-4xl w-full max-h-[92vh] overflow-y-auto flex flex-col print:shadow-none print:border-none print:max-h-none print:overflow-visible">
        
        {/* Modal Controls (Hidden in print) */}
        <div className="bg-gray-50 border-b border-gray-200 px-6 py-3.5 flex items-center justify-between sticky top-0 z-10 print:hidden">
          <div className="flex items-center space-x-2 text-gray-700">
            <FileText className="w-5 h-5 text-brand-blue" />
            <span className="font-serif font-bold text-sm">Visualização do Formulário de Evento EAV</span>
          </div>
          <div className="flex items-center space-x-3">
            <button
              id="print-form-btn"
              onClick={handlePrint}
              className="flex items-center space-x-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold px-3 py-2 rounded-md transition-all cursor-pointer"
              title="Gerar PDF ou Imprimir"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir / PDF</span>
            </button>
            
            {onGoToSync && (
              <button
                id="sync-calendar-from-details-btn"
                onClick={() => {
                  onGoToSync();
                  onClose();
                }}
                className="flex items-center space-x-1.5 bg-white hover:bg-blue-50 text-brand-blue border border-blue-250 text-xs font-semibold px-3 py-2 rounded-md transition-all cursor-pointer"
                title="Sincronizar este evento com sua Google Agenda"
              >
                <Calendar className="w-4 h-4 text-brand-blue" />
                <span>Google Agenda</span>
              </button>
            )}

            <button 
              id="close-details-modal-btn"
              onClick={onClose} 
              className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable/Fidelity Form Wrapper */}
        <div className="p-6 sm:p-10 flex-1 overflow-y-auto print:overflow-visible print:p-0">
          
          {/* Print specific CSS styled layout mimicking paper form */}
          <div className="max-w-[800px] mx-auto space-y-8 bg-white text-brand-black">
            
            {/* Header Document Section */}
            <div className="border border-brand-black/95 p-4 rounded-xs">
              <div className="flex flex-col sm:flex-row items-center justify-between border-b pb-4 mb-4 gap-4">
                <div className="text-center sm:text-left flex items-center space-x-3">
                  <div className="w-12 h-12 bg-zinc-900 flex items-center justify-center text-white font-serif font-extrabold text-2xl tracking-tighter rounded-xs">
                    EAV
                  </div>
                  <div>
                    <h1 className="font-serif text-lg font-bold tracking-tight text-neutral-800 uppercase">
                      Escola Americana de Vitória
                    </h1>
                    <p className="font-sans text-[10px] tracking-wider text-neutral-500 font-semibold uppercase">
                      Fundação de Educação Internacional
                    </p>
                  </div>
                </div>
                <div className="text-right border-l-0 sm:border-l sm:pl-4 border-gray-350">
                  <div className="text-xs font-bold font-serif px-3 py-1 bg-amber-500/10 text-brand-orange rounded-full border border-brand-orange/20 inline-block text-center uppercase">
                    Status: {event.status === 'approved' ? 'Aprovado' : event.status === 'rejected' ? 'Rejeitado' : 'Em Análise'}
                  </div>
                </div>
              </div>

              <div className="text-center py-2.5">
                <h2 className="font-sans font-bold text-md sm:text-lg tracking-wider text-brand-blue uppercase border-t border-b border-gray-200 py-1">
                  FORMULÁRIO DE EVENTOS EAV 2026
                </h2>
              </div>

              {/* Requester Metadata Grid */}
              <div className="grid grid-cols-2 border-t border-gray-300 divide-x divide-gray-300 text-xs mt-3">
                <div className="p-2 bg-neutral-100/80 font-semibold text-neutral-700">
                  Data de requisição: <span className="font-mono font-medium text-neutral-900 ml-1">{event.requestDate}</span>
                </div>
                <div className="p-2 bg-neutral-100/80 font-semibold text-neutral-700 pl-4">
                  Setor solicitante: <span className="font-medium text-neutral-900 ml-1">{event.requester}</span>
                </div>
              </div>
            </div>

            {/* Event Table Section */}
            <div className="border border-gray-400 rounded-xs overflow-hidden">
              <div className="grid grid-cols-4 bg-gray-100 text-[10px] font-bold uppercase tracking-wider divide-x divide-gray-300 border-b border-gray-300 text-center text-neutral-600">
                <div className="p-2 col-span-1">Evento / Título</div>
                <div className="p-2 col-span-1">Data e Horários</div>
                <div className="p-2 col-span-1">Setor & Local</div>
                <div className="p-2 col-span-1">Público & Objetivo</div>
              </div>

              <div className="grid grid-cols-4 divide-x divide-gray-300 text-[11px] leading-relaxed">
                {/* Column 1: Title */}
                <div className="p-3 col-span-1 flex flex-col justify-center text-center font-bold text-brand-blue font-serif text-sm">
                  {event.title}
                </div>
                {/* Column 2: Date & Clock */}
                <div className="p-3 col-span-1 flex flex-col justify-center space-y-1 bg-neutral-50/50">
                  <div className="font-semibold text-neutral-800 text-center">{event.date}</div>
                  <div className="text-[10px] text-gray-500 text-center font-mono">
                    ({event.startTime}h às {event.endTime}h)
                  </div>
                </div>
                {/* Column 3: responsible Sector & location */}
                <div className="p-3 col-span-1 flex flex-col justify-center text-center space-y-1">
                  <div className="font-semibold text-neutral-800">{event.responsibleSector}</div>
                  <div className="text-[9px] font-bold text-brand-blue bg-blue-50 border border-blue-100 px-1.5 py-0.5 rounded-sm inline-block">
                    Campus {event.campus || 'Vitória'}
                  </div>
                  <div className="text-[10px] font-bold text-neutral-600 bg-gray-100 px-1 py-0.5 rounded-sm inline-block">
                    {event.location}
                  </div>
                </div>
                {/* Column 4: Objective & Target size */}
                <div className="p-3 col-span-1 flex flex-col justify-start space-y-1.5 text-left bg-neutral-50/50">
                  <div>
                    <span className="font-bold text-[9px] text-neutral-500 uppercase">Público:</span>
                    <p className="text-[10px] text-neutral-800 font-medium">{event.targetAudience || "Não especificado"}</p>
                    <p className="text-[9px] text-neutral-500 font-mono">Est: {event.audienceEstimate || "--"}</p>
                  </div>
                  <div className="border-t border-gray-200/60 pt-1">
                    <span className="font-bold text-[9px] text-neutral-500 uppercase">Objetivo:</span>
                    <p className="text-[9px] leading-tight text-neutral-600 italic">"{event.objective || "Sem observações."}"</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sectors Checklist (Perfect Paper Replica) */}
            <div className="border border-gray-400 p-4 rounded-xs bg-white">
              <h3 className="font-sans font-bold text-xs bg-gray-200 text-neutral-800 px-2 py-1 uppercase tracking-wider border-b border-gray-400 mb-3 text-center">
                Selecione os setores envolvidos com um “X”
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-1.5 gap-x-4 text-[10px] leading-tight text-neutral-700">
                {SCHOOL_SECTORS.map((sector) => {
                  const isChecked = event.sectorsInvolved.includes(sector);
                  return (
                    <div key={sector} className="flex items-start py-0.5">
                      {isChecked ? (
                        <span className="text-brand-blue font-bold mr-1.5 flex-none mt-0.5" aria-hidden="true">[x]</span>
                      ) : (
                        <span className="text-gray-350 mr-1.5 flex-none mt-0.5" aria-hidden="true">[ ]</span>
                      )}
                      <span className={isChecked ? "font-semibold text-brand-blue" : "text-neutral-500"}>
                        {sector}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Specific Demanded Activity Tables */}
            <div className="border border-gray-400 rounded-xs overflow-hidden bg-white">
              <h3 className="font-sans font-bold text-xs bg-gray-200 text-neutral-800 px-2 py-1 uppercase tracking-wider border-b border-gray-400 text-center">
                Preencha a seguir quais setores serão demandados e as respectivas atividades:
              </h3>

              {event.demands && event.demands.length > 0 ? (
                <table className="w-full text-[10.5px]">
                  <thead className="bg-neutral-50 text-neutral-500 font-semibold border-b border-gray-300">
                    <tr className="divide-x divide-gray-300">
                      <th className="px-4 py-2 text-left w-1/3 text-[9px] uppercase tracking-wider">Setor Demandado</th>
                      <th className="px-4 py-2 text-left text-[9px] uppercase tracking-wider">Demanda Geral / Atividade Requerida</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-300 text-neutral-800">
                    {event.demands.map((dem, idx) => (
                      <tr key={idx} className="divide-x divide-gray-300">
                        <td className="px-4 py-3 font-semibold text-brand-blue align-top">
                          {dem.sectorName}
                        </td>
                        <td className="px-4 py-3 align-top leading-relaxed whitespace-pre-wrap">
                          {dem.demandDescription}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-4 text-center text-[10.5px] italic text-neutral-500 font-serif">
                  Nenhuma atividade ou setor demandado anexado formalmente a este evento.
                </div>
              )}
            </div>

            {/* Document Signature Simulation Page */}
            <div className="border border-t-0 border-gray-200 pt-8 pb-3 grid grid-cols-2 gap-12 text-center text-[10px] text-gray-400 invisible print:visible">
              <div className="space-y-1">
                <div className="border-b border-neutral-400 w-full h-[35px]" />
                <p className="font-semibold text-neutral-700">Assinatura do Solicitante ({event.requester})</p>
                <p className="font-mono text-neutral-500">Data: ____/____/2026</p>
              </div>
              <div className="space-y-1">
                <div className="border-b border-neutral-400 w-full h-[35px]" />
                <p className="font-semibold text-neutral-700">Despacho da Diretoria de Operações / TI</p>
                <p className="font-mono text-neutral-500">Data de Despacho: ____/____/2026</p>
              </div>
            </div>

          </div>

        </div>

        {/* Modal Footer Controls (Hidden in print) */}
        <div className="border-t border-gray-150 px-6 py-4 bg-gray-50 flex items-center justify-between print:hidden">
          <p className="text-xs text-gray-500">
            ID de Referência Acadêmica: <span className="font-mono text-gray-700 font-semibold">{event.id}</span>
          </p>
          <button
            id="close-details-btn-foot"
            onClick={onClose}
            className="bg-brand-blue hover:bg-brand-blue/90 text-white font-sans text-xs sm:text-sm font-semibold px-4 py-2 rounded-md transition-all cursor-pointer"
          >
            Fechar Formulário
          </button>
        </div>

      </div>
    </div>
  );
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Globe, Phone, Mail, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-[#E5E1DA] text-gray-500 font-sans mt-16 print:hidden">
      
      {/* Footer Content */}
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Col 1: Brand details */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 bg-brand-blue text-white font-serif font-extrabold text-sm flex items-center justify-center rounded-lg">
                EAV
              </div>
              <span className="font-serif text-base font-bold text-gray-800 tracking-tight">
                Escola Americana de Vitória
              </span>
            </div>
            <p className="text-xs text-gray-400 max-w-sm leading-relaxed">
              O Portal do Colaborador EAV apoia o corpo docente, assistentes acadêmicos, coordenação, equipe de eventos e equipe técnica do campus a planejar, compartilhar mídias de suporte e orquestrar eventos educacionais com excelência e precisão operacional.
            </p>
          </div>

          {/* Col 2: Useful contacts */}
          <div className="space-y-3.5">
            <h4 className="text-xs font-bold text-brand-blue uppercase tracking-widest">
              Contato Rápido
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-center space-x-2">
                <Phone className="w-3.5 h-3.5 text-brand-orange shrink-0" />
                <span>(27) 3019-6690 / 99241-5226</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-3.5 h-3.5 text-brand-orange shrink-0" />
                <span>eventos@escolaamericana.com.br</span>
              </div>
              <div className="flex items-center space-x-2">
                <Globe className="w-3.5 h-3.5 text-brand-orange shrink-0" />
                <a 
                  href="https://escolaamericana.com.br" 
                  target="_blank" 
                  rel="referrer noopener" 
                  className="hover:underline hover:text-brand-blue font-medium transition-all"
                >
                  escolaamericana.com.br
                </a>
              </div>
            </div>
          </div>

          {/* Col 3: Address / Locations (Three Campuses) */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-brand-blue uppercase tracking-widest">
              Unidades & Campuses
            </h4>
            <div className="space-y-3 text-xs leading-relaxed">
              <div>
                <span className="font-bold text-gray-800 block text-[10px] uppercase tracking-wide">Campus Vitória (Principal)</span>
                <div className="flex items-start space-x-1.5 text-gray-400 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-brand-orange shrink-0 mt-0.5" />
                  <span>Av. Roza Helena Schorling A., 1.600 <span className="block text-[10px] text-gray-400">Enseada do Suá - CEP 29050-685</span></span>
                </div>
              </div>
              <div>
                <span className="font-bold text-gray-800 block text-[10px] uppercase tracking-wide">Campus Álvares (Esportivo/Ensino)</span>
                <div className="flex items-start space-x-1.5 text-gray-400 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-brand-orange shrink-0 mt-0.5" />
                  <span>Av. Mal. Mascarenhas de Moraes, 950 <span className="block text-[10px] text-gray-400">Bento Ferreira - CEP 29050-625</span></span>
                </div>
              </div>
              <div>
                <span className="font-bold text-gray-800 block text-[10px] uppercase tracking-wide">Campus Aeroporto (Infantil)</span>
                <div className="flex items-start space-x-1.5 text-gray-400 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-brand-orange shrink-0 mt-0.5" />
                  <span>Av. Fernando Ferrari, 3110 <span className="block text-[10px] text-gray-400">Goiabeiras - CEP 29075-010</span></span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom stripe */}
        <div className="border-t border-[#E5E1DA] mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400">
          <div>
            &copy; 2026 Escola Americana de Vitória. Todos os direitos reservados.
          </div>
          <div className="flex space-x-6 text-[11px] font-medium">
            <a href="#" className="hover:text-brand-blue transition-colors">Privacidade</a>
            <a href="#" className="hover:text-brand-blue transition-colors">Termos de Uso</a>
            <a href="#" className="hover:text-brand-blue transition-colors">Suporte Técnico Interno</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

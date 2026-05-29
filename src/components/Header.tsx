/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { 
  Calendar, 
  HelpCircle, 
  Film, 
  PlusCircle, 
  Menu, 
  X, 
  ShieldCheck, 
  User, 
  ExternalLink,
  Sparkles,
  CalendarDays,
  Mail
} from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  openNewEventModal: () => void;
  userEmail: string;
}

export default function Header({ activeTab, setActiveTab, openNewEventModal, userEmail }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'events', label: 'Painel de Eventos', icon: Calendar },
    { id: 'media', label: 'Central de Mídias', icon: Film },
    { id: 'ai-notifications', label: 'Notificações por IA', icon: Sparkles },
    { id: 'google-calendar', label: 'Google Agenda', icon: CalendarDays },
    { id: 'sector-emails', label: 'E-mails dos Setores', icon: Mail },
  ];

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    setIsMobileMenuOpen(false);
  };

  const userInitials = userEmail ? userEmail.substring(0, 2).toUpperCase() : 'CO';
  const userName = userEmail ? userEmail.split('@')[0] : 'Colaborador';

  return (
    <>
      {/* ─── DESKTOP SIDEBAR NAVIGATION (md and up) ─── */}
      <aside className="hidden md:flex flex-col w-64 lg:w-72 bg-white border-r border-[#E5E1DA] h-screen sticky top-0 shrink-0 z-40 select-none">
        {/* Colorful top accent bar matching school colors */}
        <div className="h-1.5 w-full flex">
          <div className="bg-brand-blue flex-1 h-full" />
          <div className="bg-brand-orange w-1/4 h-full" />
          <div className="bg-brand-green w-1/4 h-full" />
        </div>

        {/* Brand/Logo Section */}
        <div className="p-6 cursor-pointer border-b border-[#E5E1DA]/50" onClick={() => handleTabClick('events')}>
          <div className="flex items-center space-x-3.5">
            <div className="relative flex items-center justify-center w-11 h-11 bg-brand-blue rounded-xl text-white font-serif font-bold text-lg shadow-sm border border-brand-blue/10">
              EAV
              <div className="absolute bottom-1 right-1 w-2 h-2 bg-brand-orange rounded-full" />
            </div>
            <div>
              <h2 className="font-serif text-base font-bold text-gray-800 leading-tight">
                Escola Americana
              </h2>
              <span className="font-sans text-[10px] font-semibold tracking-wider text-brand-orange uppercase block">
                Portal do Colaborador
              </span>
            </div>
          </div>
        </div>

        {/* User Card */}
        <div className="p-4 mx-4 mt-6 mb-2 bg-[#F7F5F2] rounded-2xl border border-[#E5E1DA]/70 flex items-center space-x-3">
          <div className="w-10 h-10 bg-[#D4D9C8] rounded-full flex items-center justify-center font-bold text-brand-blue font-serif border border-[#BFC8B5] shrink-0 text-sm shadow-xs">
            {userInitials}
          </div>
          <div className="overflow-hidden">
            <div className="text-xs font-bold text-gray-800 tracking-tight truncate" title={userName}>
              {userName}
            </div>
            <div className="text-[10px] text-gray-500 font-medium">Equipe Acadêmica</div>
          </div>
        </div>

        {/* Primary Navigation Links */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 font-sans">
          {navItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`sidebar-tab-${item.id}`}
                onClick={() => handleTabClick(item.id)}
                className={`w-full flex items-center space-x-3.5 px-4 py-3 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 text-left group cursor-pointer ${
                  isActive
                    ? 'bg-brand-blue text-white shadow-xs'
                    : 'text-gray-600 hover:text-brand-blue hover:bg-[#F2F4F0]'
                }`}
              >
                <IconComponent className={`w-4.5 h-4.5 shrink-0 transition-transform ${
                  isActive ? 'text-white' : 'text-gray-400 group-hover:text-brand-blue'
                }`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Premium Call to Action: Add New Event */}
        <div className="p-4 border-t border-[#E5E1DA]/50">
          <button
            id="sidebar-quick-add-btn"
            onClick={openNewEventModal}
            className="w-full bg-brand-orange hover:bg-brand-orange/95 text-white font-semibold text-xs py-3 px-4 rounded-xl transition-all shadow-md active:scale-[0.98] inline-flex items-center justify-center space-x-1.5 cursor-pointer"
          >
            <PlusCircle className="w-4.5 h-4.5" />
            <span>Criar Novo Evento</span>
          </button>
        </div>

        {/* Institutional System Status Indicator */}
        <div className="p-4 bg-[#FDFCFB] border-t border-[#E5E1DA] text-[9px] font-bold text-gray-400 tracking-widest uppercase flex items-center justify-between">
          <div className="flex items-center space-x-1">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
            <span>Sistema Online</span>
          </div>
          <span>v2.4.0</span>
        </div>
      </aside>


      {/* ─── MOBILE HEADER NAVIGATION (sm screens only) ─── */}
      <header className="md:hidden bg-white border-b border-[#E5E1DA] sticky top-0 z-40 shadow-xs select-none">
        {/* Top brand-specific color stripe */}
        <div className="h-1 w-full flex">
          <div className="bg-brand-blue flex-1 h-full" />
          <div className="bg-brand-orange w-1/4 h-full" />
          <div className="bg-brand-green w-1/4 h-full" />
        </div>

        {/* Header content bar */}
        <div className="px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center space-x-2.5" onClick={() => handleTabClick('events')}>
            <div className="flex items-center justify-center w-8 h-8 bg-brand-blue rounded-lg text-white font-serif font-extrabold text-sm">
              EAV
            </div>
            <div>
              <h2 className="font-serif text-sm font-extrabold text-gray-800 leading-none">
                Escola Americana
              </h2>
              <span className="font-sans text-[9px] font-bold tracking-widest text-brand-orange uppercase">
                Colaborador
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Quick mini Create Event Trigger */}
            <button
              onClick={openNewEventModal}
              className="p-1.5 bg-brand-orange text-white rounded-lg focus:outline-hidden"
              title="Criar Novo Evento"
            >
              <PlusCircle className="w-4.5 h-4.5" />
            </button>

            {/* Mobile burger toggle button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-1.5 text-gray-600 hover:text-brand-blue rounded-lg focus:outline-hidden"
            >
              {isMobileMenuOpen ? <X className="w-5.5 h-5.5" /> : <Menu className="w-5.5 h-5.5" />}
            </button>
          </div>
        </div>

        {/* Collapsible Mobile Menu Drawer */}
        {isMobileMenuOpen && (
          <div className="border-t border-[#E5E1DA] bg-white px-4 py-5 space-y-4 absolute top-[53px] left-0 w-full shadow-lg z-50 animate-in fade-in slide-in-from-top-4 duration-200">
            <div className="flex items-center space-x-3 pb-3 border-b border-gray-100">
              <div className="w-10 h-10 bg-[#D4D9C8] rounded-full flex items-center justify-center font-bold text-brand-blue font-serif border border-[#BFC8B5] text-xs">
                {userInitials}
              </div>
              <div>
                <div className="text-xs font-bold text-gray-800">{userName}</div>
                <div className="text-[10px] text-gray-400">{userEmail}</div>
              </div>
            </div>

            <div className="space-y-1">
              {navItems.map((item) => {
                const IconComponent = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleTabClick(item.id)}
                    className={`w-full flex items-center space-x-3 px-3.5 py-3 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                      isActive
                        ? 'bg-[#3E5C52]/10 text-brand-blue'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <IconComponent className="w-4.5 h-4.5 shrink-0 text-gray-500" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="pt-2">
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  openNewEventModal();
                }}
                className="w-full flex items-center justify-center space-x-2 py-3 bg-brand-orange text-white text-xs font-bold rounded-xl shadow-xs"
              >
                <PlusCircle className="w-4.5 h-4.5" />
                <span>Criar Novo Evento EAV</span>
              </button>
            </div>
          </div>
        )}
      </header>
    </>
  );
}

import { useState, useEffect } from 'react';
import { useStore } from './store/useStore';
import { SchoolEvent, SCHOOL_SECTORS } from './types';

// Component Imports
import Header from './components/Header';
import EventsTab from './components/EventsTab';
import EventFormModal from './components/EventFormModal';
import EventDetailsModal from './components/EventDetailsModal';
import MediaDisplayBoard from './components/MediaDisplayBoard';
import AiNotificationHub from './components/AiNotificationHub';
import GoogleCalendarHub from './components/GoogleCalendarHub';
import SectorEmailsHub from './components/SectorEmailsHub';
import Footer from './components/Footer';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('events');
  const [userEmail] = useState<string>('esribeirojunior@gmail.com');
  
  // Zustand Store
  const { 
    events, 
    supportRequests, 
    sectorEmails, 
    init, 
    saveEvent, 
    saveSupportRequest,
    updateSectorEmails,
    initialized
  } = useStore();

  // UI States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedEventDetails, setSelectedEventDetails] = useState<SchoolEvent | null>(null);
  const [editingEvent, setEditingEvent] = useState<SchoolEvent | null>(null);
  const [routeSupportEventId, setRouteSupportEventId] = useState<string>('');

  // Initialize Store on Mount
  useEffect(() => {
    init();
  }, [init]);

  // Handle Event Persistence
  const handleSaveEvent = async (event: SchoolEvent) => {
    await saveEvent(event);
    setEditingEvent(null);
    setIsFormOpen(false);
  };

  const handleRequestSupportForEvent = (eventId: string) => {
    setRouteSupportEventId(eventId);
    setActiveTab('support');
  };

  if (!initialized) {
    return (
      <div className="min-h-screen bg-brand-cream flex items-center justify-center">
        <div className="text-brand-blue font-serif text-xl animate-pulse">Carregando Portal EAV...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-cream text-brand-black flex flex-col md:flex-row font-sans selection:bg-brand-blue/15 selection:text-brand-blue">
      
      <Header 
        activeTab={activeTab} 
        setActiveTab={(tab) => {
          setActiveTab(tab);
          if (tab !== 'support') setRouteSupportEventId('');
        }} 
        openNewEventModal={() => {
          setEditingEvent(null);
          setIsFormOpen(true);
        }}
        userEmail={userEmail}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 py-6 md:py-8 px-1 sm:px-2">
        
          {activeTab === 'events' && (
            <EventsTab 
              onEditEvent={(ev) => {
                setEditingEvent(ev);
                setIsFormOpen(true);
              }}
              onViewDetails={setSelectedEventDetails}
            />
          )}

          {activeTab === 'media' && (
            <MediaDisplayBoard 
              events={events}
              supportRequests={supportRequests}
            />
          )}

          {activeTab === 'ai-notifications' && (
            <AiNotificationHub 
              events={events}
              sectorEmails={sectorEmails}
            />
          )}

          {activeTab === 'google-calendar' && (
            <GoogleCalendarHub 
              events={events}
            />
          )}

          {activeTab === 'sector-emails' && (
            <SectorEmailsHub
              sectorEmails={sectorEmails}
              onUpdateEmails={updateSectorEmails}
              sectorsList={SCHOOL_SECTORS}
            />
          )}

        </main>

        <Footer />
      </div>

      <EventFormModal 
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingEvent(null);
        }}
        onSubmit={handleSaveEvent}
        editingEvent={editingEvent}
      />

      <EventDetailsModal 
        isOpen={selectedEventDetails !== null}
        event={selectedEventDetails}
        onClose={() => setSelectedEventDetails(null)}
        onRequestSupport={handleRequestSupportForEvent}
        onGoToSync={() => setActiveTab('google-calendar')}
      />

    </div>
  );
}

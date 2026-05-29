import { create } from 'zustand';
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy,
  setDoc
} from 'firebase/firestore';
import { db } from '../firebase';
import { SchoolEvent, SupportRequest, SectorEmails } from '../types';
import { INITIAL_EVENTS, INITIAL_SUPPORT_REQUESTS, INITIAL_SECTOR_EMAILS } from '../data/initialData';

interface AppState {
  events: SchoolEvent[];
  supportRequests: SupportRequest[];
  sectorEmails: SectorEmails;
  loading: boolean;
  initialized: boolean;

  // Actions
  init: () => void;
  saveEvent: (event: SchoolEvent) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  saveSupportRequest: (request: SupportRequest) => Promise<void>;
  updateSupportStatus: (id: string, status: SupportRequest['status']) => Promise<void>;
  updateSectorEmails: (emails: SectorEmails) => Promise<void>;
  toggleEventStatus: (id: string, currentStatus: SchoolEvent['status']) => Promise<void>;
}

export const useStore = create<AppState>((set, get) => ({
  events: [],
  supportRequests: [],
  sectorEmails: {},
  loading: true,
  initialized: false,

  init: () => {
    if (get().initialized) return;

    // Listen to Events
    const eventsQuery = query(collection(db, 'events'), orderBy('requestDate', 'desc'));
    onSnapshot(eventsQuery, (snapshot) => {
      const eventsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SchoolEvent));
      if (eventsData.length === 0 && !get().initialized) {
        // Hydrate with initial data if firestore is empty
        INITIAL_EVENTS.forEach(ev => {
           setDoc(doc(db, 'events', ev.id), ev);
        });
      } else {
        set({ events: eventsData });
      }
    });

    // Listen to Support Requests
    const supportQuery = query(collection(db, 'support'), orderBy('createdAt', 'desc'));
    onSnapshot(supportQuery, (snapshot) => {
      const supportData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SupportRequest));
      if (supportData.length === 0 && !get().initialized) {
        INITIAL_SUPPORT_REQUESTS.forEach(req => {
          setDoc(doc(db, 'support', req.id), req);
        });
      } else {
        set({ supportRequests: supportData });
      }
    });

    // Listen to Sector Emails
    onSnapshot(doc(db, 'settings', 'sectorEmails'), (snapshot) => {
      if (snapshot.exists()) {
        set({ sectorEmails: snapshot.data() as SectorEmails });
      } else if (!get().initialized) {
        setDoc(doc(db, 'settings', 'sectorEmails'), INITIAL_SECTOR_EMAILS);
      }
    });

    set({ initialized: true, loading: false });
  },

  saveEvent: async (event: SchoolEvent) => {
    const { id, ...data } = event;
    await setDoc(doc(db, 'events', id), data, { merge: true });
  },

  deleteEvent: async (id: string) => {
    await deleteDoc(doc(db, 'events', id));
  },

  saveSupportRequest: async (request: SupportRequest) => {
    const { id, ...data } = request;
    await setDoc(doc(db, 'support', id), data, { merge: true });
  },

  updateSupportStatus: async (id: string, status: SupportRequest['status']) => {
    await updateDoc(doc(db, 'support', id), { status });
  },

  updateSectorEmails: async (emails: SectorEmails) => {
    await setDoc(doc(db, 'settings', 'sectorEmails'), emails);
  },

  toggleEventStatus: async (id: string, currentStatus: SchoolEvent['status']) => {
    const statuses: SchoolEvent['status'][] = ['pending', 'approved', 'rejected'];
    const nextIndex = (statuses.indexOf(currentStatus) + 1) % statuses.length;
    const nextStatus = statuses[nextIndex];
    await updateDoc(doc(db, 'events', id), { status: nextStatus });
  }
}));

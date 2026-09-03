import { create } from 'zustand';
import { patientService, PatientProfile } from '../services/patient.service';


export interface InteractionEvent {
  timestamp: number;
  actionType: 'click' | 'drag' | 'drop' | 'timeout' | 'hint_request';
  isCorrect: boolean;
  dwellTimeMs: number;
}

export interface SessionState {
  // Store Variables
  sessionId: string | null;
  activePatient: PatientProfile | null;
  patientsRegistry: PatientProfile[];
  isActive: boolean;
  currentStepIndex: number;
  interactionLogs: InteractionEvent[];
  isLoading: boolean;
  error: string | null;
  
  // Operational State Triggers & Network Connectors
  fetchPatientsRegistry: () => Promise<void>;
  startPatientSession: (patientId: string) => Promise<void>;
  logInteraction: (event: InteractionEvent) => void;
  nextStep: () => void;
  terminateSession: () => void;
}

export const useSessionStore = create<SessionState>((set, get) => ({
  sessionId: null,
  activePatient: null,
  patientsRegistry: [],
  isActive: false,
  currentStepIndex: 0,
  interactionLogs: [],
  isLoading: false,
  error: null,

  // Action to fetch all patient records from PostgreSQL cleanly via Rule 4
  fetchPatientsRegistry: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await patientService.getAllPatients();
      set({ patientsRegistry: data, isLoading: false });
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch patients registry', isLoading: false });
    }
  },

  // Action to load a specific profile onto the active task stage workspace
  startPatientSession: async (patientId: string) => {
    set({ isLoading: true, error: null });
    try {
      const profile = await patientService.getPatientById(patientId);
      set({
        activePatient: profile,
        sessionId: `sess_${Date.now()}`,
        isActive: true,
        currentStepIndex: 0,
        interactionLogs: [],
        isLoading: false
      });
    } catch (err: any) {
      set({ error: err.message || 'Failed to initialize patient session', isLoading: false });
    }
  },

  logInteraction: (event) => set((state) => ({
    interactionLogs: [...state.interactionLogs, event]
  })),

  nextStep: () => set((state) => ({
    currentStepIndex: state.currentStepIndex + 1
  })),

  terminateSession: () => set({
    sessionId: null,
    activePatient: null,
    isActive: false,
    currentStepIndex: 0,
    interactionLogs: []
  })
}));

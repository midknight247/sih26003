import { create } from 'zustand';
import { patientService, PatientProfile } from '../services/patient.service';

export interface InteractionEvent {
  timestamp: number;
  actionType: 'click' | 'drag' | 'drop' | 'timeout' | 'hint_request';
  isCorrect: boolean;
  dwellTimeMs: number;
}

export interface SessionState {
  // --- Core State Variables ---
  sessionId: string | null;
  activePatient: PatientProfile | null;
  patientsRegistry: PatientProfile[];
  isActive: boolean;
  currentStepIndex: number;
  interactionLogs: InteractionEvent[];
  isLoading: boolean;
  error: string | null;
  currentSupportLevel: number;
  
  // --- Operational Actions & Network Sync Bindings ---
  fetchPatientsRegistry: () => Promise<void>;
  startPatientSession: (patientId: string) => Promise<void>;
  logInteractionTelemetry: (activityId: string, contentId: string, actionType: string, dwellTime: number, isCorrect: boolean) => Promise<void>;
  nextStep: () => void;
  terminateSession: () => Promise<void>;
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
  currentSupportLevel: 0,

  // 1. Fetch available profiles from PostgreSQL via API
  fetchPatientsRegistry: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await patientService.getAllPatients();
      set({ patientsRegistry: data, isLoading: false });
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch patients registry', isLoading: false });
    }
  },

  // 2. Initialize a brand new session tracking record in PostgreSQL
  startPatientSession: async (patientId: string) => {
    set({ isLoading: true, error: null });
    try {
      const profile = await patientService.getPatientById(patientId);
      
      // Hit the backend POST /sessions/ endpoint
      const response = await fetch('http://localhost:8000/sessions/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patient_id: patientId })
      });

      if (!response.ok) throw new Error('Could not instantiate backend session trace.');
      const sessionData = await response.json();

      set({
        activePatient: profile,
        sessionId: sessionData.session_id,
        isActive: true,
        currentStepIndex: 0,
        interactionLogs: [],
        currentSupportLevel: 0,
        isLoading: false
      });
    } catch (err: any) {
      set({ error: err.message || 'Failed to initialize patient session', isLoading: false });
    }
  },

  // 3. Pipe active gameplay clicks & drag-drops directly into the database live!
  logInteractionTelemetry: async (activityId, contentId, actionType, dwellTime, isCorrect) => {
    const { sessionId } = get();
    if (!sessionId) return;

    // Track locally first to update the instant UI feedback layouts
    const localEvent: InteractionEvent = {
      timestamp: Date.now(),
      actionType: actionType as any,
      isCorrect,
      dwellTimeMs: dwellTime
    };
    set((state) => ({ interactionLogs: [...state.interactionLogs, localEvent] }));

    try {
      // Hit the backend POST /sessions/{id}/interactions endpoint
      const response = await fetch(`http://localhost:8000/sessions/${sessionId}/interactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activity_id: activityId,
          content_id: contentId,
          action_type: actionType,
          dwell_time_ms: dwellTime,
          is_correct: isCorrect
        })
      });

      if (response.ok) {
        const telemetryResult = await response.json();
        // Dynamically capture the updated support cue scale returned by the Adaptation Engine!
        set({ currentSupportLevel: telemetryResult.current_support_level });
      }
    } catch (err) {
      console.error('Telemetry telemetry drop sync failed:', err);
    }
  },

  nextStep: () => set((state) => ({
    currentStepIndex: state.currentStepIndex + 1
  })),

  // 4. Safely stamp closure of active monitoring window inside PostgreSQL
  terminateSession: async () => {
    const { sessionId } = get();
    if (sessionId) {
      try {
        await fetch(`http://localhost:8000/sessions/${sessionId}/terminate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ final_status: 'COMPLETED' })
        });
      } catch (err) {
        console.error('Failed to gracefully close session record over network:', err);
      }
    }

    set({
      sessionId: null,
      activePatient: null,
      isActive: false,
      currentStepIndex: 0,
      interactionLogs: [],
      currentSupportLevel: 0
    });
  }
}));

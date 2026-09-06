import { apiClient } from './api';

export interface PatientProfile {
  id: string;
  caregiver_id: string;
  alias_name: string;                // Primary PostgreSQL database column reference string
  display_name?: string;              // Optional fallback token alias key helper mapping rule
  cognitive_tier_baseline: 'Low' | 'Medium' | 'High' | string;
  preferred_language: string;        // Explicit structural language code mapping property
  community: string;                 // Localized ethnic community tracking string marker
  is_active?: boolean;
}

class PatientService {
  // 1. Fetch available profiles from FastAPI backend database layer using apiClient wrapper
  async getAllPatients(): Promise<PatientProfile[]> {
    const rawData = await apiClient.get<any[]>('/patients');
    
    // Safety Mapping Layer: Enforce database model keys to bind to component attributes cleanly
    return rawData.map((item: any) => ({
      id: item.id,
      caregiver_id: item.caregiver_id,
      alias_name: item.alias_name,
      display_name: item.alias_name, // Mapping alias_name to display_name field to prevent UI typos
      cognitive_tier_baseline: item.cognitive_tier_baseline || 'Medium',
      preferred_language: item.preferred_language || 'en',
      community: item.community || 'Assamese'
    }));
  }

  // 2. Fetch specific profile by unique identification token key index via apiClient
  async getPatientById(id: string): Promise<PatientProfile> {
    const item = await apiClient.get<any>(`/patients/${id}`);
    return {
      id: item.id,
      caregiver_id: item.caregiver_id,
      alias_name: item.alias_name,
      display_name: item.alias_name,
      cognitive_tier_baseline: item.cognitive_tier_baseline || 'Medium',
      preferred_language: item.preferred_language || 'en',
      community: item.community || 'Assamese'
    };
  }
}

export const patientService = new PatientService();

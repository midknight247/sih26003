import { apiClient } from './api';

export interface PatientProfile {
  id: string;
  caregiver_id: string;
  alias_name: str;
  cognitive_tier_baseline: string;
  is_active: boolean;
}

export const patientService = {
  async getAllPatients(): Promise<PatientProfile[]> {
    return apiClient.get<PatientProfile[]>('/patients/');
  },

  async getPatientById(id: string): Promise<PatientProfile> {
    return apiClient.get<PatientProfile>(`/patients/${id}`);
  },

  async createPatient(aliasName: string, caregiverId: string): Promise<PatientProfile> {
    return apiClient.post<PatientProfile>('/patients/', {
      alias_name: aliasName,
      caregiver_id: caregiverId,
      cognitive_tier_baseline: 'medium'
    });
  }
};

import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSessionStore } from '../../store/session.store';

export const PatientListPage: React.FC = () => {
  const navigate = useNavigate();
  
  // Extract real-time state and action binds from our centralized Rule 3 Zustand cache
  const { patientsRegistry, isLoading, error, fetchPatientsRegistry, startPatientSession } = useSessionStore();

  // Lifecycle loop hook to automatically poll real-time profiles from port 8000
  useEffect(() => {
    fetchPatientsRegistry();
  }, [fetchPatientsRegistry]);

  const handleLaunchSession = async (patientId: string) => {
    if (confirm('Are you ready to instantiate an isolated cognitive monitoring session for this profile?')) {
      await startPatientSession(patientId);
      // Route the client view directly into the active gameplay arena shell
      navigate(`/session/sess_001`);
    }
  };

  return (
    <div style={{ padding: '24px', fontFamily: 'sans-serif', backgroundColor: '#f8fafc', minHeight: '100vh', boxSizing: 'border-box' }}>
      
      {/* Upper Control Bar Header Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', borderBottom: '2px solid #e2e8f0', paddingBottom: '20px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
            👥 Patient Command Directory
          </h1>
          <p style={{ margin: '6px 0 0 0', color: '#64748b', fontSize: '1rem' }}>
            Monitor obfuscated profiles and launch active localized cognitive sessions.
          </p>
        </div>
        
        {/* Dynamic Navigation Trigger to our fresh Masking Form Panel */}
        <Link 
          to="/caregiver/patients/new"
          style={{ padding: '12px 24px', backgroundColor: '#4f46e5', color: '#ffffff', borderRadius: '10px', fontWeight: '700', textDecoration: 'none', boxShadow: '0 4px 6px -1px rgb(79 70 229 / 0.15)', transition: 'background-color 0.2s' }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#4338ca'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#4f46e5'}
        >
          ➕ Register New Profile Alias
        </Link>
      </div>

      {/* Network Async State Monitors */}
      {isLoading && (
        <div style={{ padding: '40px', textAlign: 'center', fontSize: '1.2rem', color: '#64748b', fontWeight: '600' }}>
          ⏳ Synchronizing database registries over port 8000...
        </div>
      )}

      {error && (
        <div style={{ padding: '16px 20px', backgroundColor: '#fef2f2', border: '1px solid #fee2e2', color: '#b91c1c', borderRadius: '12px', fontWeight: '600', marginBottom: '24px' }}>
          ⚠️ Network Sync Conflict: {error}
        </div>
      )}

      {/* Primary Directory Data Layout Grid */}
      {!isLoading && !error && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
          {patientsRegistry.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', padding: '60px', textAlign: 'center', backgroundColor: '#ffffff', border: '2px dashed #cbd5e1', borderRadius: '16px', color: '#64748b' }}>
              <p style={{ fontSize: '1.2rem', fontWeight: '700', margin: '0 0 8px 0' }}>No Masked Patient Profiles Detected</p>
              <p style={{ margin: 0 }}>Click the registration button above to seed an anonymous token profile alias into PostgreSQL.</p>
            </div>
          ) : (
            patientsRegistry.map((patient) => (
              <div 
                key={patient.id}
                style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.02)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '20px' }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{padding: '4px 10px', backgroundColor: '#f1f5f9', color: '#475569', fontSize: '0.8rem', fontWeight: '700', borderRadius: '6px', textTransform: 'uppercase' }}>
                      {patient.id}
                    </span>
                    <span style={{ fontSize: '1.5rem' }}>👤</span>
                  </div>
                  
                  <h3 style={{ margin: '0 0 8px 0', fontSize: '1.35rem', fontWeight: '800', color: '#0f172a' }}>
                    {patient.display_name}
                  </h3>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.95rem', color: '#475569' }}>
                    <p style={{ margin: 0 }}><strong>📍 Community:</strong> {patient.community}</p>
                    <p style={{ margin: 0 }}><strong>🗣️ Lang Tag:</strong> <code style={{ backgroundColor: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>{patient.preferred_language}</code></p>
                  </div>
                </div>

                {/* Direct Patient Engagement Session Launch Key */}
                <button
                  onClick={() => handleLaunchSession(patient.id)}
                  style={{ width: '100%', padding: '12px', backgroundColor: '#10b981', color: '#ffffff', border: 'none', borderRadius: '10px', fontSize: '1rem', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgb(16 185 129 / 0.15)', transition: 'background-color 0.2s' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#059669'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#10b981'}
                >
                  🚀 Launch Active Session
                </button>
              </div>
            ))
          )}
        </div>
      )}

    </div>
  );
};

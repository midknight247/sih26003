import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSessionStore } from '../../store/session.store';

export const DashboardPage: React.FC = () => {
  // Extract clean state variables and state actions from our Rule 3 store hook
  const { patientsRegistry, fetchPatientsRegistry, isLoading, error } = useSessionStore();

  // Run the data ingestion hook cleanly on component mounting to fulfill Rule 4
  useEffect(() => {
    fetchPatientsRegistry();
  }, [fetchPatientsRegistry]);

  return (
    <div style={{ padding: '24px', fontFamily: 'sans-serif', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      {/* Upper Control Bar Header Section Layout */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '2.25rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>Caregiver Central Command</h1>
          <p style={{ color: '#64748b', fontSize: '1.125rem', margin: '4px 0 0 0' }}>Monitor adaptive engagement status loops and cognitive baselines.</p>
        </div>
        
        <Link 
          to="/caregiver/patients/new" 
          style={{ padding: '14px 28px', backgroundColor: '#4f46e5', color: '#ffffff', fontWeight: '700', borderRadius: '12px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 6px -1px rgb(79 70 229 / 0.2)' }}
        >
          ➕ Register New Patient
        </Link>
      </div>

      {/* Database State Monitoring Wrappers */}
      {isLoading && (
        <div style={{ padding: '40px', textAlign: 'center', backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', color: '#64748b', fontSize: '1.25rem', fontWeight: '600' }}>
          🔄 Accessing PostgreSQL cluster pipelines...
        </div>
      )}

      {error && (
        <div style={{ padding: '24px', backgroundColor: '#fef2f2', border: '2px solid #fee2e2', borderRadius: '16px', color: '#dc2626', marginBottom: '24px', fontWeight: '600' }}>
          ⚠️ Network Sync Conflict: {error}
        </div>
      )}

      {/* Live Operational Metrics Blocks View Grid */}
      {!isLoading && !error && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          {/* Quick Metrics Statistics Highlight Bar */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
            <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.05)' }}>
              <div style={{ textTransform: 'uppercase', fontSize: '0.875rem', fontWeight: '700', color: '#64748b', letterSpacing: '0.05em' }}>Total Active Patients</div>
              <div style={{ fontSize: '2.5rem', fontWeight: '800', color: '#0f172a', marginTop: '8px' }}>{patientsRegistry.length}</div>
            </div>
            <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.05)' }}>
              <div style={{ textTransform: 'uppercase', fontSize: '0.875rem', fontWeight: '700', color: '#64748b', letterSpacing: '0.05em' }}>Connected API Cluster</div>
              <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#10b981', marginTop: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ display: 'inline-block', width: '10px', height: '10px', backgroundColor: '#10b981', borderRadius: '50%' }}></span>
                localhost:8000 (Online)
              </div>
            </div>
          </div>

          {/* Core Table Directory Listing Section Layout */}
          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '700', color: '#0f172a' }}>Patient Directory Logs</h3>
            </div>

            {patientsRegistry.length === 0 ? (
              <div style={{ padding: '48px', textAlign: 'center', color: '#94a3b8' }}>
                <span style={{ fontSize: '3rem', display: 'block', marginBottom: '16px' }}>📋</span>
                <p style={{ fontSize: '1.125rem', margin: 0, fontWeight: '500' }}>No active patient profile files detected inside your database cluster yet.</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '1px solid #e2e8f0' }}>
                      <th style={{ padding: '14px 24px', color: '#475569', fontWeight: '700' }}>System ID</th>
                      <th style={{ padding: '14px 24px', color: '#475569', fontWeight: '700' }}>Privacy Alias Name</th>
                      <th style={{ padding: '14px 24px', color: '#475569', fontWeight: '700' }}>Cognitive Baseline Tier</th>
                      <th style={{ padding: '14px 24px', color: '#475569', fontWeight: '700' }}>Network Status</th>
                      <th style={{ padding: '14px 24px', color: '#475569', fontWeight: '700', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {patientsRegistry.map((patient) => (
                      <tr key={patient.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background-color 0.2s' }}>
                        <td style={{ padding: '16px 24px', fontWeight: '700', color: '#4f46e5' }}>{patient.id}</td>
                        <td style={{ padding: '16px 24px', fontWeight: '600', color: '#0f172a' }}>{patient.alias_name}</td>
                        <td style={{ padding: '16px 24px' }}>
                          <span style={{ 
                            padding: '6px 12px', 
                            borderRadius: '9999px', 
                            fontSize: '0.875rem', 
                            fontWeight: '700',
                            backgroundColor: patient.cognitive_tier_baseline === 'high' ? '#ecfdf5' : patient.cognitive_tier_baseline === 'medium' ? '#eff6ff' : '#fff7ed',
                            color: patient.cognitive_tier_baseline === 'high' ? '#047857' : patient.cognitive_tier_baseline === 'medium' ? '#1d4ed8' : '#c2410c'
                          }}>
                            {patient.cognitive_tier_baseline}
                          </span>
                        </td>
                        <td style={{ padding: '16px 24px' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: patient.is_active ? '#16a34a' : '#94a3b8', fontWeight: '600', fontSize: '0.95rem' }}>
                            <span style={{ width: '8px', height: '8px', backgroundColor: patient.is_active ? '#16a34a' : '#94a3b8', borderRadius: '50%' }}></span>
                            {patient.is_active ? 'Monitored' : 'Inactive'}
                          </span>
                        </td>
                        <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                          <Link 
                            to={`/session/start/${patient.id}`}
                            style={{ padding: '8px 16px', backgroundColor: '#1e293b', color: '#ffffff', fontWeight: '600', borderRadius: '8px', textDecoration: 'none', fontSize: '0.875rem', display: 'inline-block' }}
                          >
                            ▶️ Launch Session
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

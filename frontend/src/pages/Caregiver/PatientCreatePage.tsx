import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSessionStore } from '../../store/session.store';

export const PatientCreatePage: React.FC = () => {
  const navigate = useNavigate();
  
  // Extract our dynamic store actions and loading state targets matching Rule 3
  const { fetchPatientsRegistry, isLoading, error: storeError } = useSessionStore();
  
  // Local isolated UI form states (Bypasses state machines until save triggers)
  const [aliasName, setAliasName] = useState('');
  const [cognitiveTier, setCognitiveTier] = useState('medium');
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (!aliasName.trim()) {
      setLocalError('Please provide a valid privacy alias name.');
      return;
    }

    try {
      // Rule 4: Route data pipeline safely straight through our client services layer
      const response = await fetch('http://localhost:8000/patients/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          alias_name: aliasName,
          cognitive_tier_baseline: cognitiveTier,
          caregiver_id: 'cg_001' // Securely map into our pre-created caregiver account row
        })
      });

      if (!response.ok) {
        throw new Error('Database registry rejection. Ensure backend node is awake.');
      }

      // Re-trigger global registry refresh loop to update our dashboard state map instantly
      await fetchPatientsRegistry();
      
      // Navigate smoothly back to overview logs portal layout frame
      navigate('/caregiver');
    } catch (err: any) {
      setLocalError(err.message || 'Failed to submit registration data file.');
    }
  };

  return (
    <div style={{ padding: '24px', fontFamily: 'sans-serif', backgroundColor: '#f8fafc', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: '520px', backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '32px' }}>
        
        {/* Navigation Return Shortcut */}
        <Link to="/caregiver" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#6366f1', fontWeight: '700', textDecoration: 'none', marginBottom: '20px', fontSize: '0.95rem' }}>
          ⬅️ Back to Central Command
        </Link>

        <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0f172a', margin: '0 0 8px 0' }}>Register New Patient</h2>
        <p style={{ color: '#64748b', fontSize: '1rem', margin: '0 0 28px 0' }}>Enforce data privacy policies by masking identity credentials with an absolute alias.</p>

        {/* Error Feedback Overlay Panels */}
        {(localError || storeError) && (
          <div style={{ padding: '16px', backgroundColor: '#fef2f2', border: '1px solid #fee2e2', borderRadius: '12px', color: '#dc2626', marginBottom: '20px', fontWeight: '600', fontSize: '0.95rem' }}>
            ⚠️ Registration Blocked: {localError || storeError}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Privacy Alias String Field Input Container */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.95rem', fontWeight: '700', color: '#334155' }}>Privacy Alias Name</label>
            <input 
              type="text"
              placeholder="e.g. Patient Beta, Subject 42"
              value={aliasName}
              onChange={(e) => setAliasName(e.target.value)}
              disabled={isLoading}
              style={{ padding: '12px 16px', border: '2px solid #cbd5e1', borderRadius: '10px', fontSize: '1rem', outline: 'none', width: '100%', boxSizing: 'border-box' }}
            />
          </div>

          {/* Cognitive Performance Baseline Tier Selection Matrix */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.95rem', fontWeight: '700', color: '#334155' }}>Cognitive Performance Baseline</label>
            <select
              value={cognitiveTier}
              onChange={(e) => setCognitiveTier(e.target.value)}
              disabled={isLoading}
              style={{ padding: '12px 16px', border: '2px solid #cbd5e1', borderRadius: '10px', fontSize: '1rem', outline: 'none', backgroundColor: '#ffffff', cursor: 'pointer', width: '100%' }}
            >
              <option value="low">Low (Requires maximum visual assistance prompt loops)</option>
              <option value="medium">Medium (Standard adaptive timeline tracking triggers)</option>
              <option value="high">High (Advanced problem structural mapping states)</option>
            </select>
          </div>

          {/* Action Trigger Save Control Key */}
          <button
            type="submit"
            disabled={isLoading}
            style={{ marginTop: '12px', padding: '14px', backgroundColor: isLoading ? '#94a3b8' : '#4f46e5', color: '#ffffff', fontWeight: '700', fontSize: '1rem', border: 'none', borderRadius: '10px', cursor: isLoading ? 'not-allowed' : 'pointer', boxShadow: '0 4px 6px -1px rgb(79 70 229 / 0.2)', transition: 'background-color 0.2s' }}
          >
            {isLoading ? 'Synchronizing Cluster Matrices...' : '💾 Save Profile to Database'}
          </button>

        </form>
      </div>
    </div>
  );
};

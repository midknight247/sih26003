import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSessionStore } from '../../store/session.store';

export const PatientCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const fetchPatientsRegistry = useSessionStore((state) => state.fetchPatientsRegistry);

  // Core structured input tracking states
  const [displayName, setDisplayName] = useState('');
  const [preferredLanguage, setPreferredLanguage] = useState('en');
  const [community, setCommunity] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alertMessage, setAlertMessage] = useState<{ text: string; isError: boolean } | null>(null);

  const handleFormSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    setAlertMessage(null);
    setIsSubmitting(true);

    // Baseline validation rule checks
    if (!displayName.trim() || !community.trim()) {
      setAlertMessage({ text: '⚠️ Validation Error: Display Name and Cultural Community tags are required fields.', isError: true });
      setIsSubmitting(false);
      return;
    }

    try {
      // Hit our FastAPI backend POST /patients route over port 8000
      const response = await fetch('http://localhost:8000/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          display_name: displayName.trim(),
          caregiver_id: 'cg_001', // Attaching our frozen mock supervisor index
          preferred_language: preferredLanguage,
          community: community.trim()
        })
      });

      const responseData = await response.json();

      if (!response.ok) {
        // Automatically surface the security exception if the backend catches clinical diagnostic terms!
        throw new Error(responseData.detail || 'Failed to persist patient registration profile.');
      }

      setAlertMessage({ text: `🎉 Patient Profile Created Successfully! Generated Anonymous Key: ${responseData.id}`, isError: false });
      
      // Refresh the centralized Zustand store directory cache instantly
      await fetchPatientsRegistry();
      
      // Gracefully redirect back to the administrative patient grid screen
      setTimeout(() => {
        navigate('/caregiver');
      }, 1500);

    } catch (err: any) {
      setAlertMessage({ text: `❌ ${err.message}`, isError: true });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '640px', margin: '40px auto', padding: '32px', backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)', fontFamily: 'sans-serif' }}>
      
      {/* Title Header Block */}
      <div style={{ marginBottom: '28px', borderBottom: '2px solid #f1f5f9', paddingBottom: '16px' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
          ➕ Mask New Patient Profile
        </h2>
        <p style={{ margin: '6px 0 0 0', color: '#64748b', fontSize: '0.95rem' }}>
          Create an obfuscated alias configuration profile. No clinical diagnostics or raw medical descriptors permitted.
        </p>
      </div>

      {/* Dynamic Feedback Display Banner Panel */}
      {alertMessage && (
        <div style={{ padding: '14px 18px', borderRadius: '10px', fontSize: '1rem', fontWeight: '600', marginBottom: '24px', backgroundColor: alertMessage.isError ? '#fef2f2' : '#f0fdf4', border: alertMessage.isError ? '1px solid #fee2e2' : '1px solid #bbf7d0', color: alertMessage.isError ? '#991b1b' : '#166534' }}>
          {alertMessage.text}
        </div>
      )}

      {/* Main Structural Entry Input Form */}
      <form onSubmit={handleFormSubmission} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Field 1: Anonymous Alias Display Name */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '0.95rem', fontWeight: '700', color: '#334155' }}>
            Display Alias / Token Name <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Subject Delta, Patient Kappa (Do NOT use real names or severity metrics)"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            disabled={isSubmitting}
            style={{ padding: '12px 16px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '1rem', width: '100%', boxSizing: 'border-box' }}
          />
        </div>

        {/* Field 2: Regional Cultural Community Tag */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '0.95rem', fontWeight: '700', color: '#334155' }}>
            NER Cultural Community / Demographic Tag <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Assamese, Mizo, Naga, Bodo"
            value={community}
            onChange={(e) => setCommunity(e.target.value)}
            disabled={isSubmitting}
            style={{ padding: '12px 16px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '1rem', width: '100%', boxSizing: 'border-box' }}
          />
        </div>

        {/* Field 3: Preferred Communication Language Tag Dropdown */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '0.95rem', fontWeight: '700', color: '#334155' }}>
            Primary Activity Localized Language
          </label>
          <select
            value={preferredLanguage}
            onChange={(e) => setPreferredLanguage(e.target.value)}
            disabled={isSubmitting}
            style={{ padding: '12px 16px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '1rem', backgroundColor: '#ffffff', width: '100%', boxSizing: 'border-box' }}
          >
            <option value="en">English (en)</option>
            <option value="as">Assamese (as)</option>
            <option value="bn">Bengali (bn)</option>
            <option value="lus">Mizo / Lushai (lus)</option>
            <option value="ao">Ao Naga (ao)</option>
          </select>
        </div>

        {/* Form Control Command Triggers */}
        <div style={{ display: 'flex', justifyContent: 'end', gap: '14px', marginTop: '12px', borderTop: '1px solid #f1f5f9', paddingTop: '20px' }}>
          <button
            type="button"
            onClick={() => navigate('/caregiver')}
            disabled={isSubmitting}
            style={{ padding: '12px 24px', backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', color: '#475569', fontSize: '1rem', fontWeight: '600', cursor: 'pointer' }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            style={{ padding: '12px 28px', backgroundColor: '#4f46e5', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgb(79 70 229 / 0.15)' }}
          >
            {isSubmitting ? 'Registering...' : '💾 Save Profile Configuration'}
          </button>
        </div>

      </form>
    </div>
  );
};

import React from 'react';

interface ActivityShellProps {
  title: string;
  instructionText: string;
  assistanceLevel: number;
  onAbandon: () => void;
  children: React.ReactNode;
}

export const ActivityShell: React.FC<ActivityShellProps> = ({
  title,
  instructionText,
  assistanceLevel,
  onAbandon,
  children
}) => {
  return (
    <div style={{
      width: '100%',
      maxWidth: '890px',
      backgroundColor: '#ffffff',
      borderRadius: '24px',
      boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
      border: '4px solid #e2e8f0',
      padding: '32px',
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
      fontFamily: 'sans-serif'
    }}>
      {/* High-Contrast Accessible Header Panel */}
      <div style={{ display: 'flex', justifyContent: 'between', alignItems: 'center', borderBottom: '2px solid #f1f5f9', paddingBottom: '16px', width: '100%' }}>
        <div>
          <h2 style={{ fontSize: '2rem', fontWeight: '800', color: '#1e293b', margin: 0 }}>
            {title}
          </h2>
          <p style={{ fontSize: '1.35rem', fontWeight: '600', color: '#4f46e5', margin: '8px 0 0 0' }}>
            🔊 {instructionText}
          </p>
        </div>
        
        <button 
          onClick={onAbandon}
          style={{
            padding: '12px 20px',
            backgroundColor: '#fee2e2',
            color: '#dc2626',
            border: '2px solid #fca5a5',
            borderRadius: '12px',
            fontSize: '1.125rem',
            fontWeight: '700',
            cursor: 'pointer'
          }}
        >
          🛑 Stop Task
        </button>
      </div>

      {/* Main Interactive Stage Area Container */}
      <div style={{
        minHeight: '350px',
        backgroundColor: '#f8fafc',
        borderRadius: '16px',
        border: '2px dashed #cbd5e1',
        padding: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {children}
      </div>

      {/* Dynamic Automated Support Cue Overlay Interface */}
      {assistanceLevel > 0 && (
        <div style={{
          backgroundColor: '#eff6ff',
          border: '2px solid #bfdbfe',
          borderRadius: '16px',
          padding: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        }}>
          <span style={{ fontSize: '2.5rem' }}>💡</span>
          <div>
            <h4 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#1e40af', margin: 0 }}>Helpful Prompt</h4>
            <p style={{ fontSize: '1.15rem', color: '#1e3a8a', margin: '4px 0 0 0', fontWeight: '500' }}>
              Take your time. Look at the shapes carefully before making a selection.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

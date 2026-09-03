import React from 'react';
import { Link } from 'react-router-dom';

export const LandingPage: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: '#0f172a', color: 'white', fontFamily: 'sans-serif', padding: '24px' }}>
      <h1 style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '16px', color: '#818cf8' }}>SIH26003</h1>
      <p style={{ color: '#94a3b8', maxWidth: '400px', textAlign: 'center', fontSize: '1.125rem', marginBottom: '32px', lineHeight: '1.6' }}>
        Adaptive Cognitive Engagement Platform for Dementia Care Environment Tracking.
      </p>
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        <Link to='/caregiver' style={{ padding: '12px 24px', backgroundColor: '#4f46e5', color: 'white', fontWeight: '6xl', borderRadius: '8px', textDecoration: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
          Enter Caregiver Console
        </Link>
        <Link to='/session/start/patient_001' style={{ padding: '12px 24px', backgroundColor: '#334155', color: 'white', fontWeight: '6xl', borderRadius: '8px', textDecoration: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
          Launch Patient View
        </Link>
      </div>
    </div>
  );
};

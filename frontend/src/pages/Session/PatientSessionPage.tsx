import React from 'react';
import { ActivityRenderer } from '../../components/session/ActivityRenderer';

export const PatientSessionPage: React.FC = () => {
  // Simulating state ingestion variables that we will tie to the backend later
  return (
    <div style={{ width: '100%', display: 'flex', justifyContent: 'center', padding: '20px' }}>
      <ActivityRenderer 
        activityType="reminiscence" 
        difficulty="medium" 
        assistanceLevel={1} 
      />
    </div>
  );
};

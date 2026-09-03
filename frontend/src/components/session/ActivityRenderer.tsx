import React from 'react';
import { ActivityShell } from '../../activities/shared/ActivityShell';
import { CategorizationActivity } from '../../activities/Categorization/CategorizationActivity';
import { useSessionStore } from '../../store/session.store';
import { ReminiscenceActivity } from '../../activities/Reminiscence/ReminiscenceActivity';

interface ActivityRendererProps {
  activityType: 'categorization' | 'matching' | 'reminiscence' | 'sequencing';
  difficulty: 'low' | 'medium' | 'high';
  assistanceLevel: number;
}

export const ActivityRenderer: React.FC<ActivityRendererProps> = ({
  activityType,
  difficulty,
  assistanceLevel
}) => {
  const terminateSession = useSessionStore((state) => state.terminateSession);

  const handleAbandon = () => {
    if (confirm("Are you sure you want to stop this activity?")) {
      terminateSession();
      window.location.href = '/';
    }
  };

  // Maps the current active phase context layout block matching Rule 3.1.4 architecture
  switch (activityType) {
    case 'categorization':
      return (
        <ActivityShell 
          title="Familiar Object Grouping" 
          instructionText="Identify and touch the traditional items that belong in a kitchen environment."
          assistanceLevel={assistanceLevel}
          onAbandon={handleAbandon}
        >
          <CategorizationActivity />
        </ActivityShell>
      );

    case 'reminiscence':
      return (
        <ActivityShell 
          title="Cultural Memory Echoes" 
          instructionText="Look at the familiar regional item and touch how it makes you feel."
          assistanceLevel={assistanceLevel}
          onAbandon={handleAbandon}
        >
          <ReminiscenceActivity />
        </ActivityShell>
      );

    default:
      return (
        <ActivityShell 
          title="Cognitive Engagement Task" 
          instructionText="Look at the items displayed on your screen."
          assistanceLevel={assistanceLevel}
          onAbandon={handleAbandon}
        >
          <div style={{ fontSize: '1.5rem', fontWeight: '600', color: '#64748b' }}>
            Task module template layer initializing...
          </div>
        </ActivityShell>
      );
  }
};

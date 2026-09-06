import React, { useState, useEffect } from 'react';
import { useSessionStore } from '../../store/session.store';
import { apiClient } from '../../services/api';

interface ReminiscenceItem {
  id: string;
  title: string;
  content_metadata: string; // High-contrast visual anchor placeholder emoji matching database string maps
  is_active: boolean;
  activity_id: string;
}

export const ReminiscenceActivity: React.FC = () => {
  // Extract network-synchronized telemetry actions from the Rule 3 store hook
  const logInteractionTelemetry = useSessionStore((state) => state.logInteractionTelemetry);
  const nextStep = useSessionStore((state) => state.nextStep);
  
  // Extract active session meta context cleanly to match database filters
  const currentSessionId = useSessionStore((state) => state.sessionId || 'sess_001');

  const [memoryPool, setMemoryPool] = useState<ReminiscenceItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeMessage, setActiveMessage] = useState('Synchronizing localized cultural assets from database...');
  const [reactionLog, setReactionLog] = useState<{ [key: string]: string }>({});
  const [startTime] = useState(Date.now());
  const [isLoading, setIsLoading] = useState(true);

  // Poll database content filtered by running patient parameters matching the session context
  useEffect(() => {
    const fetchContent = async () => {
      try {
        setIsLoading(true);
        // Query our newly deployed localized content governance gateway over port 8000
        const data = await apiClient.get<ReminiscenceItem[]>(`/content/activity/act_rem_002?session_id=${currentSessionId}`);
        
        if (data && data.length > 0) {
          setMemoryPool(data);
          setActiveMessage('Look at the beautiful image below. Does it bring back any fond memories?');
        } else {
          // Fallback array mapping if the PostgreSQL seeding rows are empty
          setMemoryPool([
            { id: 'item_rem_001', title: 'Majuli River Island Sunset (Assam)', content_metadata: '🌅', is_active: true, activity_id: 'act_rem_002' },
            { id: 'item_rem_002', title: 'Srimanta Sankardev Kalakshetra (Guwahati)', content_metadata: '🏛️', is_active: true, activity_id: 'act_rem_002' },
            { id: 'item_rem_003', title: 'Familiar Woven Loom Silk Handloom', content_metadata: '🧵', is_active: true, activity_id: 'act_rem_002' }
          ]);
          setActiveMessage('Using localized fallback asset registry. Look at the sight below.');
        }
      } catch (err) {
        setActiveMessage('⚠️ Connection error. Running offline task context layer.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchContent();
  }, [currentSessionId]);

  const handlePatientReaction = async (feeling: 'happy' | 'thoughtful' | 'unsure') => {
    if (memoryPool.length === 0) return;
    
    const clickTime = Date.now();
    const dwellTime = clickTime - startTime;
    const currentItem = memoryPool[currentIndex];

    // Map reactions to text metrics for visual verification
    const feelingLabels = { happy: '😊 Happy', thoughtful: '🤔 Thoughtful', unsure: '❓ Unsure' };
    setReactionLog((prev) => ({ ...prev, [currentItem.id]: feelingLabels[feeling] }));

    // Rule 4: Route telemetry metrics safely across port 8000 to save straight to PostgreSQL tables
    await logInteractionTelemetry(
      'act_rem_002',       // activity_id matching our seeded database row
      currentItem.id,      // content_id
      'click',             // action_type
      dwellTime,           // dwell_time_ms
      true                 // is_correct (Reminiscence triggers are always intrinsically correct)
    );

    if (currentIndex < memoryPool.length - 1) {
      setActiveMessage(`Moving to the next familiar sight. Let's look together.`);
      setTimeout(() => {
        setCurrentIndex((prev) => prev + 1);
        setActiveMessage('Does this place or object look familiar to you?');
      }, 800);
    } else {
      setActiveMessage('🎉 Wonderful reflection! You have completed your memory journey today.');
    }
  };

  if (isLoading) {
    return <div style={{ padding: '40px', textAlign: 'center', fontSize: '1.25rem', fontWeight: 'bold', color: '#64748b' }}>⏳ Fetching audited memory anchors...</div>;
  }

  const currentItem = memoryPool[currentIndex];

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '28px', fontFamily: 'sans-serif' }}>
      
      {/* High-Contrast Guidance Alert Banner */}
      <div style={{ padding: '16px 24px', backgroundColor: '#eff6ff', border: '2px solid #bfdbfe', borderRadius: '16px', fontSize: '1.3rem', fontWeight: '700', color: '#1e40af', textAlign: 'center', width: '100%', boxSizing: 'border-box' }}>
        {activeMessage}
      </div>

      {/* Primary High-Visibility Visual Card Arena */}
      {currentIndex < memoryPool.length && currentItem && (
        <div style={{
          width: '100%',
          maxWidth: '500px',
          backgroundColor: '#ffffff',
          border: '4px solid #cbd5e1',
          borderRadius: '28px',
          padding: '24px',
          boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.05)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px',
          boxSizing: 'border-box'
        }}>
          {/* Main Accessible Visual Anchor */}
          <div style={{ fontSize: '7rem', lineHeight: '1', padding: '20px' }}>
            {currentItem.content_metadata}
          </div>

          <div style={{ textAlign: 'center' }}>
            <h3 style={{ margin: '0 0 6px 0', fontSize: '1.75rem', fontWeight: '800', color: '#0f172a' }}>
              {currentItem.title}
            </h3>
            <p style={{ margin: 0, fontSize: '1.15rem', fontWeight: '600', color: '#64748b' }}>
              📍 Seeded Asset Index: {currentItem.id}
            </p>
          </div>
        </div>
      )}

      {/* Giant Uncluttered Feeling Target Selection Bar (Rule 5 Compliant) */}
      {currentItem && reactionLog[currentItem.id] ? (
        <div style={{ padding: '12px 32px', backgroundColor: '#f0fdf4', border: '2px solid #bbf7d0', color: '#166534', borderRadius: '12px', fontSize: '1.15rem', fontWeight: '700' }}>
          Captured Reaction: {reactionLog[currentItem.id]}
        </div>
      ) : (
        currentIndex < memoryPool.length && (
          <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', width: '100%', flexWrap: 'wrap' }}>
            <button
              onClick={() => handlePatientReaction('happy')}
              style={{ padding: '16px 32px', backgroundColor: '#fef08a', color: '#854d0e', border: '3px solid #fde047', borderRadius: '20px', fontSize: '1.5rem', fontWeight: '800', cursor: 'pointer' }}
            >
              😊 Makes Me Happy
            </button>
            <button
              onClick={() => handlePatientReaction('thoughtful')}
              style={{ padding: '16px 32px', backgroundColor: '#e0e7ff', color: '#3730a3', border: '3px solid #c7d2fe', borderRadius: '20px', fontSize: '1.5rem', fontWeight: '800', cursor: 'pointer' }}
            >
              🤔 Brings Memories
            </button>
          </div>
        )
      )}

      {/* Task Completed Finish Command Key */}
      {memoryPool.length > 0 && Object.keys(reactionLog).length === memoryPool.length && (
        <button
          onClick={() => { nextStep(); window.location.href = '/caregiver'; }}
          style={{ marginTop: '12px', padding: '18px 40px', backgroundColor: '#4f46e5', color: '#ffffff', fontSize: '1.3rem', fontWeight: '800', border: 'none', borderRadius: '16px', cursor: 'pointer', boxShadow: '0 4px 10px rgb(79 70 229 / 0.3)' }}
        >
          🏁 Complete Memory Walk & Save Logs
        </button>
      )}

    </div>
  );
};


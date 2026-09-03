import React, { useState } from 'react';
import { useSessionStore } from '../../store/session.store';

interface ReminiscenceItem {
  id: string;
  title: string;
  imageEmoji: string; // High-contrast visual anchor placeholder matching seeded content types
  locationDescription: string;
  isTriggerTarget: boolean;
}

export const ReminiscenceActivity: React.FC = () => {
  const logInteraction = useSessionStore((state) => state.logInteraction);
  const nextStep = useSessionStore((state) => state.nextStep);

  // Seeded regional memory anchors specific to the Northeast Region (NER)
  const [memoryPool] = useState<ReminiscenceItem[]>([
    {
      id: 'item_rem_001',
      title: 'Majuli River Island Sunset',
      imageEmoji: '🌅',
      locationDescription: 'The serene Brahmaputra river waters of Assam.',
      isTriggerTarget: true,
    },
    {
      id: 'item_rem_002',
      title: 'Srimanta Sankardev Kalakshetra',
      imageEmoji: '🏛️',
      locationDescription: 'Cultural preservation institution in Guwahati.',
      isTriggerTarget: true,
    },
    {
      id: 'item_rem_003',
      title: 'Familiar Woven Loom',
      imageEmoji: '🧵',
      locationDescription: 'Traditional handloom setup weaving pure silk.',
      isTriggerTarget: true,
    }
  ]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeMessage, setActiveMessage] = useState('Look at the beautiful image below. Does it bring back any fond memories?');
  const [reactionLog, setReactionLog] = useState<{ [key: string]: string }>({});
  const [startTime] = useState(Date.now());

  const currentItem = memoryPool[currentIndex];

  const handlePatientReaction = (feeling: 'happy' | 'thoughtful' | 'unsure') => {
    const clickTime = Date.now();
    const dwellTime = clickTime - startTime;

    // Map reactions to text metrics
    const feelingLabels = { happy: '😊 Happy', thoughtful: '🤔 Thoughtful', unsure: '❓ Unsure' };
    setReactionLog((prev) => ({ ...prev, [currentItem.id]: feelingLabels[feeling] }));

    // Rule 3: Fire clean behavioral metrics logs straight into the central store room
    logInteraction({
      timestamp: clickTime,
      actionType: 'click',
      isCorrect: true, // Reminiscence responses are always intrinsically valid to prevent failure feelings
      dwellTimeMs: dwellTime
    });

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

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '28px', fontFamily: 'sans-serif' }}>
      
      {/* High-Contrast Guidance Alert Banner */}
      <div style={{ padding: '16px 24px', backgroundColor: '#eff6ff', border: '2px solid #bfdbfe', borderRadius: '16px', fontSize: '1.3rem', fontWeight: '700', color: '#1e40af', textAlign: 'center', width: '100%', boxSizing: 'border-box' }}>
        {activeMessage}
      </div>

      {/* Primary High-Visibility Visual Card Arena */}
      {currentIndex < memoryPool.length && (
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
            {currentItem.imageEmoji}
          </div>

          <div style={{ textAlign: 'center' }}>
            <h3 style={{ margin: '0 0 6px 0', fontSize: '1.75rem', fontWeight: '800', color: '#0f172a' }}>
              {currentItem.title}
            </h3>
            <p style={{ margin: 0, fontSize: '1.15rem', fontWeight: '600', color: '#64748b' }}>
              📍 {currentItem.locationDescription}
            </p>
          </div>
        </div>
      )}

      {/* Giant Uncluttered Feeling Target Selection Bar (Rule 5 Compliant) */}
      {reactionLog[currentItem.id] ? (
        <div style={{ padding: '12px 32px', backgroundColor: '#f0fdf4', border: '2px solid #bbf7d0', color: '#166534', borderRadius: '12px', fontSize: '1.15rem', fontWeight: '700' }}>
          Captured Reaction: {reactionLog[currentItem.id]}
        </div>
      ) : (
        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', width: '100%', flexWrap: 'wrap' }}>
          <button
            onClick={() => handlePatientReaction('happy')}
            style={{ padding: '16px 32px', backgroundColor: '#fef08a', color: '#854d0e', border: '3px solid #fde047', borderRadius: '20px', fontSize: '1.5rem', fontWeight: '800', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}
          >
            😊 Makes Me Happy
          </button>
          <button
            onClick={() => handlePatientReaction('thoughtful')}
            style={{ padding: '16px 32px', backgroundColor: '#e0e7ff', color: '#3730a3', border: '3px solid #c7d2fe', borderRadius: '20px', fontSize: '1.5rem', fontWeight: '800', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}
          >
            🤔 Brings Memories
          </button>
        </div>
      )}

      {/* Task Completed Finish Command Key */}
      {Object.keys(reactionLog).length === memoryPool.length && (
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

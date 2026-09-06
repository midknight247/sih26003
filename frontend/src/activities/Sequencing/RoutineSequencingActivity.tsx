import React, { useState, useEffect } from 'react';
import { useSessionStore } from '../../store/session.store';

interface StepItem {
  id: string;
  label: string;
  icon: string;
  correctOrderIndex: number; // The absolute chronological sequence target rank
}

export const RoutineSequencingActivity: React.FC = () => {
  // Extract real-time telemetry log actions and support tiers from the central store hook (Rule 3)
  const logInteractionTelemetry = useSessionStore((state) => state.logInteractionTelemetry);
  const currentSupportLevel = useSessionStore((state) => state.currentSupportLevel);
  const nextStep = useSessionStore((state) => state.nextStep);

  // Seeded regional routine tracking data sequence: Brewing Traditional Assam Tea
  const [initialSteps] = useState<StepItem[]>([
    { id: 'seq_step_01', label: 'Boil Fresh Water', icon: '🔥', correctOrderIndex: 0 },
    { id: 'seq_step_02', label: 'Add Assam Tea Leaves', icon: '🍃', correctOrderIndex: 1 },
    { id: 'seq_step_03', label: 'Pour Milk & Strain', icon: '☕', correctOrderIndex: 2 }
  ]);

  const [shuffledPool, setShuffledPool] = useState<StepItem[]>([]);
  const [timeline, setTimeline] = useState<StepItem[]>([]);
  const [activeMessage, setActiveMessage] = useState('Touch the steps in order to arrange the daily routine loop.');
  const [startTime] = useState(Date.now());

  // Scatter the timeline cards randomly across the selection deck on initialization pass
  useEffect(() => {
    const randomized = [...initialSteps].sort(() => Math.random() - 0.5);
    setShuffledPool(randomized);
  }, [initialSteps]);

  const handleStepSelect = async (selectedStep: StepItem) => {
    const clickTime = Date.now();
    const dwellTime = clickTime - startTime;
    const incomingIndex = timeline.length; // The next index path spot filled in the timeline

    if (selectedStep.correctOrderIndex === incomingIndex) {
      // 🌟 Correct sequential item placement hit
      setTimeline((prev) => [...prev, selectedStep]);
      setShuffledPool((prev) => prev.filter((item) => item.id !== selectedStep.id));
      setActiveMessage(`🌟 Perfect! "${selectedStep.label}" is positioned accurately.`);

      // Rule 4: Sync metric data packets across port 8000 straight down to PostgreSQL tables
      await logInteractionTelemetry(
        'act_seq_004',        // activity_id matching seeded structural matrix tables
        selectedStep.id,      // content_id
        'drop',               // action_type
        dwellTime,            // dwell_time_ms
        true                  // is_correct
      );
    } else {
      // 🔊 Out-of-sequence step error event triggered
      setActiveMessage(`🔊 Think about what happens first. Try selecting another step step!`);
      
      await logInteractionTelemetry(
        'act_seq_004',
        selectedStep.id,
        'click',
        dwellTime,
        false // Logs a telemetry struggle footprint to fire the Adaptation Engine calculations
      );
    }
  };

  const handleClearTimeline = () => {
    setTimeline([]);
    setShuffledPool([...initialSteps].sort(() => Math.random() - 0.5));
    setActiveMessage('Timeline reset. Let’s start the routine layout over!');
  };

  const isSequenceComplete = timeline.length === initialSteps.length;

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '32px', fontFamily: 'sans-serif' }}>
      
      {/* High-Contrast Interactive Guidance Banner */}
      <div style={{ padding: '16px 24px', backgroundColor: '#f8fafc', border: '2px solid #cbd5e1', borderRadius: '16px', fontSize: '1.25rem', fontWeight: '700', color: '#0f172a', textAlign: 'center', width: '100%', boxSizing: 'border-box' }}>
        {activeMessage}
      </div>

      {/* Primary Selection Deck Pools (Unarranged Tasks Area) */}
      <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap', minHeight: '140px', width: '100%' }}>
        {shuffledPool.map((step) => {
          // Rule 5 Hint: If support escalates, match index flags to illuminate the target next card
          const isNextTargetHint = currentSupportLevel > 0 && step.correctOrderIndex === timeline.length;

          return (
            <button
              key={step.id}
              onClick={() => handleStepSelect(step)}
              style={{
                width: '140px',
                height: '140px',
                backgroundColor: '#ffffff',
                border: isNextTargetHint ? '5px solid #eab308' : '4px solid #6366f1', // High contrast yellow glow helper
                borderRadius: '24px',
                fontSize: '3.5rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: isNextTargetHint ? '0 0 15px #fde047' : '0 10px 15px -3px rgb(0 0 0 / 0.05)',
                position: 'relative'
              }}
            >
              {step.icon}
              <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginTop: '6px', textAlign: 'center', display: 'block', padding: '0 4px' }}>
                {step.label}
              </span>
              {isNextTargetHint && (
                <span style={{ position: 'absolute', top: '-10px', right: '-10px', backgroundColor: '#eab308', color: '#ffffff', borderRadius: '50%', width: '28px', height: '28px', fontSize: '0.9rem', fontWeight: '800', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center' }}>⭐</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Target Timeline Structural Canvas (Chronological Array Slot Grid) */}
      <div style={{
        width: '100%',
        maxWidth: '600px',
        backgroundColor: '#f0fdf4',
        border: '4px dashed #22c55e',
        borderRadius: '32px',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px',
        boxSizing: 'border-box'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
          <h3 style={{ margin: 0, color: '#166534', fontSize: '1.4rem', fontWeight: '800' }}>
            📅 Sorted Morning Routine Timeline
          </h3>
          {timeline.length > 0 && !isSequenceComplete && (
            <button onClick={handleClearTimeline} style={{ padding: '6px 12px', backgroundColor: '#ef4444', color: '#ffffff', border: 'none', borderRadius: '6px', fontSize: '0.85rem', fontWeight: '700', cursor: 'pointer' }}>Reset</button>
          )}
        </div>

        <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center', minHeight: '100px', width: '100%' }}>
          {timeline.length === 0 ? (
            <p style={{ color: '#15803d', fontSize: '1.1rem', fontWeight: '600', margin: 0 }}>
              Timeline is completely empty. Press the steps above in chronological sequence!
            </p>
          ) : (
            timeline.map((step, idx) => (
              <React.Fragment key={step.id}>
                <div style={{ padding: '12px 18px', backgroundColor: '#ffffff', border: '3px solid #22c55e', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}>
                  <span style={{ fontSize: '1.75rem' }}>{step.icon}</span>
                  <span style={{ fontSize: '0.95rem', fontWeight: '800', color: '#1f2937' }}>{idx + 1}. {step.label}</span>
                </div>
                {idx < timeline.length - 1 && <span style={{ fontSize: '1.5rem', color: '#22c55e', fontWeight: '800' }}>➔</span>}
              </React.Fragment>
            ))
          )}
        </div>
      </div>

      {/* Interactive Task Advance Finish Control Key Trigger */}
      {isSequenceComplete && (
        <button
          onClick={() => { nextStep(); window.location.href = '/caregiver'; }}
          style={{ padding: '16px 36px', backgroundColor: '#22c55e', color: '#ffffff', fontSize: '1.25rem', fontWeight: '800', border: 'none', borderRadius: '14px', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgb(34 197 94 / 0.2)' }}
        >
          🏁 Complete Routine Sequencing & Log Results
        </button>
      )}

    </div>
  );
};

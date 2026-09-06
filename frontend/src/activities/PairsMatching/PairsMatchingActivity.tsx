import React, { useState, useEffect } from 'react';
import { useSessionStore } from '../../store/session.store';

interface AssociationCard {
  id: string;
  label: string;
  icon: string;
  matchId: string;
  side: 'left' | 'right'; // Split items explicitly to support side-by-side comparison
}

export const PairsMatchingActivity: React.FC = () => {
  // Pull live telemetry log actions and support tiers from the central store hook (Rule 3)
  const logInteractionTelemetry = useSessionStore((state) => state.logInteractionTelemetry);
  const currentSupportLevel = useSessionStore((state) => state.currentSupportLevel);
  const nextStep = useSessionStore((state) => state.nextStep);

  // Local state tracking memory triggers specific to the Northeast Region (NER)
  const [leftDeck, setLeftDeck] = useState<AssociationCard[]>([]);
  const [rightDeck, setRightDeck] = useState<AssociationCard[]>([]);
  const [selectedLeft, setSelectedLeft] = useState<number | null>(null);
  const [selectedRight, setSelectedRight] = useState<number | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<string[]>([]);
  const [activeMessage, setActiveMessage] = useState('Look at all items. Select one item from the left and its matching partner on the right.');
  const [startTime] = useState(Date.now());

  // Initialize separated decks on component mount (Items are ALWAYS visible face-up to prevent working memory drain)
  useEffect(() => {
    const leftItems: AssociationCard[] = [
      { id: 'tea_leaf', label: 'Tea Leaf Basket', icon: '🧺', matchId: 'pair_1', side: 'left' },
      { id: 'rhino', label: 'One-Horned Rhino', icon: '🦏', matchId: 'pair_2', side: 'left' },
    ];

    const rightItems: AssociationCard[] = [
      { id: 'tea_garden', label: 'Assam Tea Garden', icon: '🌿', matchId: 'pair_1', side: 'right' },
      { id: 'kaziranga', label: 'Kaziranga Forest', icon: '🌳', matchId: 'pair_2', side: 'right' },
    ];

    // Shuffle each deck independently to randomize target positions while maintaining visibility
    setLeftDeck([...leftItems].sort(() => Math.random() - 0.5));
    setRightDeck([...rightItems].sort(() => Math.random() - 0.5));
  }, []);

  const handleSelection = async (index: number, side: 'left' | 'right') => {
    let nextLeft = selectedLeft;
    let nextRight = selectedRight;

    if (side === 'left') {
      // Toggle selection or select fresh card
      nextLeft = selectedLeft === index ? null : index;
      setSelectedLeft(nextLeft);
    } else {
      nextRight = selectedRight === index ? null : index;
      setSelectedRight(nextRight);
    }

    // Process matching check once one item from each side is active
    if (nextLeft !== null && nextRight !== null) {
      const clickTime = Date.now();
      const dwellTime = clickTime - startTime;
      
      const leftCard = leftDeck[nextLeft];
      const rightCard = rightDeck[nextRight];

      if (leftCard.matchId === rightCard.matchId) {
        // 🌟 Correct Association Identified
        setMatchedPairs((prev) => [...prev, leftCard.matchId]);
        setActiveMessage(`🌟 Excellent! The "${leftCard.label}" belongs with the "${rightCard.label}".`);
        
        setSelectedLeft(null);
        setSelectedRight(null);

        // Rule 4: Sync interaction metrics over port 8000 live to PostgreSQL
        await logInteractionTelemetry(
          'act_pairs_003',  // activity_id
          leftCard.id,      // content_id
          'click',          // action_type
          dwellTime,        // dwell_time_ms
          true              // is_correct
        );
      } else {
        // 🔊 Friction block: mismatched selection indices
        setActiveMessage('🔊 Those two do not quite match. Look closely and try another combination!');
        
        setSelectedLeft(null);
        setSelectedRight(null);

        await logInteractionTelemetry(
          'act_pairs_003',
          leftCard.id,
          'click',
          dwellTime,
          false // Logs a struggle footprint to fire the Adaptation Engine logic loops
        );
      }
    }
  };

  const isGameComplete = leftDeck.length > 0 && matchedPairs.length === leftDeck.length;

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '32px', fontFamily: 'sans-serif' }}>
      
      {/* Dynamic Accessible Feedback Panel Indicator */}
      <div style={{ padding: '16px 24px', backgroundColor: '#f8fafc', border: '2px solid #cbd5e1', borderRadius: '16px', fontSize: '1.25rem', fontWeight: '700', color: '#0f172a', textAlign: 'center', width: '100%', boxSizing: 'border-box' }}>
        {activeMessage}
      </div>

      {/* Side-by-Side Visual Split Arena Grid Layout */}
      <div style={{ display: 'flex', gap: '60px', justifyContent: 'center', width: '100%', maxWidth: '640px', boxSizing: 'border-box' }}>
        
        {/* LEFT COLUMN: Cultural Anchor Base Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h4 style={{ margin: 0, textAlign: 'center', color: '#4f46e5', fontWeight: '800' }}>Left Group</h4>
          {leftDeck.map((card, index) => {
            const isMatched = matchedPairs.includes(card.matchId);
            const isSelected = selectedLeft === index;
            // Rule 5 Hint: If support escalates, automatically flash matching borders to clear friction
            const hasSupportHint = currentSupportLevel > 0 && selectedRight !== null && rightDeck[selectedRight].matchId === card.matchId;

            return (
              <button
                key={card.id}
                onClick={() => !isMatched && handleSelection(index, 'left')}
                disabled={isMatched}
                style={{
                  width: '140px',
                  height: '140px',
                  backgroundColor: isMatched ? '#f0fdf4' : '#ffffff',
                  border: isMatched 
                    ? '4px solid #22c55e' 
                    : hasSupportHint
                    ? '5px solid #eab308' // Glowing yellow support prompt border
                    : isSelected 
                    ? '4px solid #4f46e5' 
                    : '3px solid #cbd5e1',
                  borderRadius: '24px',
                  fontSize: '3.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: isMatched ? 'default' : 'pointer',
                  opacity: isMatched ? 0.5 : 1,
                  boxShadow: hasSupportHint ? '0 0 15px #fde047' : '0 4px 6px -1px rgb(0 0 0 / 0.05)',
                  transition: 'border-color 0.15s, transform 0.1s'
                }}
              >
                {card.icon}
                <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginTop: '6px', textAlign: 'center', display: 'block' }}>
                  {card.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* RIGHT COLUMN: Associative Match Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h4 style={{ margin: 0, textAlign: 'center', color: '#4f46e5', fontWeight: '800' }}>Right Group</h4>
          {rightDeck.map((card, index) => {
            const isMatched = matchedPairs.includes(card.matchId);
            const isSelected = selectedRight === index;
            const hasSupportHint = currentSupportLevel > 0 && selectedLeft !== null && leftDeck[selectedLeft].matchId === card.matchId;

            return (
              <button
                key={card.id}
                onClick={() => !isMatched && handleSelection(index, 'right')}
                disabled={isMatched}
                style={{
                  width: '140px',
                  height: '140px',
                  backgroundColor: isMatched ? '#f0fdf4' : '#ffffff',
                  border: isMatched 
                    ? '4px solid #22c55e' 
                    : hasSupportHint
                    ? '5px solid #eab308'
                    : isSelected 
                    ? '4px solid #4f46e5' 
                    : '3px solid #cbd5e1',
                  borderRadius: '24px',
                  fontSize: '3.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: isMatched ? 'default' : 'pointer',
                  opacity: isMatched ? 0.5 : 1,
                  boxShadow: hasSupportHint ? '0 0 15px #fde047' : '0 4px 6px -1px rgb(0 0 0 / 0.05)',
                  transition: 'border-color 0.15s, transform 0.1s'
                }}
              >
                {card.icon}
                <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginTop: '6px', textAlign: 'center', display: 'block' }}>
                  {card.label}
                </span>
              </button>
            );
          })}
        </div>

      </div>

            {/* Rule 5 Low-Friction Hint Panel Overlay */}
      {currentSupportLevel > 0 && (
        <div style={{ width: '100%', maxWidth: '440px', backgroundColor: '#eff6ff', border: '2px solid #bfdbfe', borderRadius: '16px', padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '2rem' }}>💡</span>
          <p style={{ margin: 0, fontSize: '1.1rem', color: '#1e3a8a', fontWeight: '600' }}>
            Support Level {currentSupportLevel} Active: Select an item, and the target matching card will glow with a golden star frame to guide your path.
          </p>
        </div>
      )}

      {/* Completion Stage Advance Command Button */}
      {isGameComplete && (
        <button
          onClick={() => { nextStep(); window.location.href = '/caregiver'; }}
          style={{ padding: '16px 36px', backgroundColor: '#22c55e', color: '#ffffff', fontSize: '1.25rem', fontWeight: '800', border: 'none', borderRadius: '14px', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgb(34 197 94 / 0.2)' }}
        >
          ➡️ Task Complete & Save Live Metrics
        </button>
      )}

    </div>
  );
};

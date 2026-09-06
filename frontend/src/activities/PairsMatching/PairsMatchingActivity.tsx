import React, { useState, useEffect } from 'react';
import { useSessionStore } from '../../store/session.store';

interface CardItem {
  id: string;
  uniqueId: string; // Combined index key to allow duplicate pairs on the canvas
  label: string;
  icon: string;
  matchId: string;  // Ties the matching pairs together cleanly
}

export const PairsMatchingActivity: React.FC = () => {
  // Pull core state actions and real-time support level indexes from the central Rule 3 store hook
  const logInteractionTelemetry = useSessionStore((state) => state.logInteractionTelemetry);
  const currentSupportLevel = useSessionStore((state) => state.currentSupportLevel);
  const nextStep = useSessionStore((state) => state.nextStep);

  // Local state tracking memory triggers specific to the Northeast Region (NER)
  const [cards, setCards] = useState<CardItem[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [matchedIds, setMatchedIds] = useState<string[]>([]);
  const [activeMessage, setActiveMessage] = useState('Touch two cards to find matching regional pairs.');
  const [startTime] = useState(Date.now());

  // Initialize and shuffle card parameters on component mount
  useEffect(() => {
    const rawPairs = [
      { id: 'tea_leaf', label: 'Tea Leaf Basket', icon: '🧺', matchId: 'pair_1' },
      { id: 'tea_garden', label: 'Assam Tea Garden', icon: '🌿', matchId: 'pair_1' },
      { id: 'rhino', label: 'One-Horned Rhino', icon: '🦏', matchId: 'pair_2' },
      { id: 'kaziranga', label: 'Kaziranga Forest', icon: '🌳', matchId: 'pair_2' },
    ];

    // Duplicate and map unique keys for the layout grid canvas
    const gameDeck: CardItem[] = [...rawPairs].map((card, idx) => ({
      ...card,
      uniqueId: `${card.id}_${idx}`
    })).sort(() => Math.random() - 0.5); // Random shuffle matching stable MVP criteria bounds

    setCards(gameDeck);
  }, []);

  const handleCardTouch = async (clickedIndex: number) => {
    // Safety block: prevent double-clicks, clicking flipped cards, or clicking locked pairs
    if (flippedIndices.length >= 2 || flippedIndices.includes(clickedIndex) || matchedIds.includes(cards[clickedIndex].matchId)) {
      return;
    }

    const currentFlipped = [...flippedIndices, clickedIndex];
    setFlippedIndices(currentFlipped);

    // If it's the second card being turned over, verify matching conditions
    if (currentFlipped.length === 2) {
      const clickTime = Date.now();
      const dwellTime = clickTime - startTime;
      
      const firstCard = cards[currentFlipped[0]];
      const secondCard = cards[currentFlipped[1]];

      if (firstCard.matchId === secondCard.matchId) {
        // 🌟 Found a valid link combination pair
        setMatchedIds((prev) => [...prev, firstCard.matchId]);
        setFlippedIndices([]);
        setActiveMessage(`🌟 Wonderful! The ${firstCard.label} matches the ${secondCard.label}.`);

        // Rule 4: Sync interaction footprint directly to PostgreSQL tables via port 8000
        await logInteractionTelemetry(
          'act_pairs_003',  // activity_id matching seeded master data
          firstCard.id,     // content_id 
          'click',          // action_type
          dwellTime,        // dwell_time_ms
          true              // is_correct
        );
      } else {
        // 🔊 Friction block: mismatched selection indices
        setActiveMessage('🔊 Those items do not quite match. Try turning over another pair!');
        
        await logInteractionTelemetry(
          'act_pairs_003',
          firstCard.id,
          'click',
          dwellTime,
          false // Logs a struggle footprint to trigger Adaptation Engine assistance levels if criteria match
        );

        // Turn the cards back face-down after a brief accessible display delay window
        setTimeout(() => {
          setFlippedIndices([]);
        }, 1500);
      }
    }
  };

  const isGameComplete = cards.length > 0 && matchedIds.length === (cards.length / 2);

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '32px', fontFamily: 'sans-serif' }}>
      
      {/* High-Contrast Interactive Feedback Alert Banner */}
      <div style={{ padding: '16px 24px', backgroundColor: '#f8fafc', border: '2px solid #cbd5e1', borderRadius: '16px', fontSize: '1.25rem', fontWeight: '700', color: '#0f172a', textAlign: 'center', width: '100%', boxSizing: 'border-box' }}>
        {activeMessage}
      </div>

      {/* Main Structural Matching Card Grid Canvas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 140px)', gap: '24px', justifyContent: 'center' }}>
        {cards.map((card, index) => {
          const isFlipped = flippedIndices.includes(index);
          const isMatched = matchedIds.includes(card.matchId);
          const showFace = isFlipped || isMatched || currentSupportLevel > 0; // Support Level 1 exposes hints automatically

          return (
            <button
              key={card.uniqueId}
              onClick={() => handleCardTouch(index)}
              disabled={isMatched}
              style={{
                width: '140px',
                height: '140px',
                backgroundColor: showFace ? '#ffffff' : '#4f46e5',
                border: isMatched ? '4px solid #22c55e' : '4px solid #6366f1',
                borderRadius: '24px',
                fontSize: showFace ? '3.5rem' : '0rem', // Collapses icon visibility safely if facedown
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: isMatched ? 'default' : 'pointer',
                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.05)',
                transition: 'background-color 0.2s, transform 0.1s',
              }}
            >
              {showFace ? (
                <>
                  {card.icon}
                  <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginTop: '6px', textAlign: 'center', display: 'block', padding: '0 4px' }}>
                    {card.label}
                  </span>
                </>
              ) : (
                <span style={{ fontSize: '2rem', color: '#ffffff', fontWeight: '800' }}>?</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Rule 5 Hint Overlay Panel (Fires only if triggered by backend math exceptions) */}
      {currentSupportLevel > 0 && (
        <div style={{ width: '100%', maxWidth: '400px', backgroundColor: '#eff6ff', border: '2px solid #bfdbfe', borderRadius: '16px', padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '2rem' }}>💡</span>
          <p style={{ margin: 0, fontSize: '1.1rem', color: '#1e3a8a', fontWeight: '600' }}>
            Support Active: Cards have been turned semi-visible to assist memory alignment. Take your time!
          </p>
        </div>
      )}

      {/* Completion Advance Step Action Key */}
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

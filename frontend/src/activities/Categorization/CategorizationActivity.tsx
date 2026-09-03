import React, { useState } from 'react';
import { useSessionStore } from '../../store/session.store';

// Mocking content items pulling directly from our seeded database models context
interface GameItem {
  id: string;
  name: string;
  icon: string;
  isKitchenItem: boolean;
}

export const CategorizationActivity: React.FC = () => {
  const logInteraction = useSessionStore((state) => state.logInteraction);
  const nextStep = useSessionStore((state) => state.nextStep);

  // Local state tracking the interactive game flow metrics
  const [itemsPool, setItemsPool] = useState<GameItem[]>([
    { id: 'item_cat_001', name: 'Xorai (Brass Tray)', icon: '盤', isKitchenItem: true },
    { id: 'item_cat_002', name: 'Gamosa (Textile Fabric)', icon: '🧣', isKitchenItem: false },
    { id: 'item_cat_003', name: 'Jaapi (Bamboo Hat)', icon: '👒', isKitchenItem: false },
    { id: 'item_cat_004', name: 'Kahi (Traditional Plate)', icon: '🍽️', isKitchenItem: true }
  ]);

  const [basket, setBasket] = useState<GameItem[]>([]);
  const [activeMessage, setActiveMessage] = useState('Touch an item to sort it into the Kitchen Basket.');
  const [startTime] = useState(Date.now());

  const handleItemSort = (selectedItem: GameItem) => {
    const clickTime = Date.now();
    const dwellTime = clickTime - startTime;

    if (selectedItem.isKitchenItem) {
      // Correct sorting behavior metrics log
      setBasket((prev) => [...prev, selectedItem]);
      setItemsPool((prev) => prev.filter((item) => item.id !== selectedItem.id));
      setActiveMessage(`🌟 Excellent! The ${selectedItem.name} goes into the Kitchen.`);
      
      // Rule 3: Deliver clean behavioral footprints straight into the central store room
      logInteraction({
        timestamp: clickTime,
        actionType: 'drop',
        isCorrect: true,
        dwellTimeMs: dwellTime
      });
    } else {
      // Struggle event captured for our Adaptation Decision matrix engine logs
      setActiveMessage(`🔊 The ${selectedItem.name} belongs somewhere else. Try again!`);
      
      logInteraction({
        timestamp: clickTime,
        actionType: 'click',
        isCorrect: false,
        dwellTimeMs: dwellTime
      });
    }
  };

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '32px', fontFamily: 'sans-serif' }}>
      
      {/* Dynamic Accessible Feedback Panel Indicator */}
      <div style={{ padding: '16px 24px', backgroundColor: '#f1f5f9', border: '2px solid #cbd5e1', borderRadius: '16px', fontSize: '1.25rem', fontWeight: '700', color: '#1e293b', textAlign: 'center', width: '100%', boxSizing: 'border-box' }}>
        {activeMessage}
      </div>

      {/* Primary Items Pool Stage Canvas */}
      <div style={{ display: 'flex', gap: '24px', justifyContent: 'center', flexWrap: 'wrap', minHeight: '140px', width: '100%' }}>
        {itemsPool.map((item) => (
          <button
            key={item.id}
            onClick={() => handleItemSort(item)}
            style={{
              width: '130px',
              height: '130px',
              backgroundColor: '#ffffff',
              border: '4px solid #6366f1',
              borderRadius: '24px',
              fontSize: '3.5rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.05)',
              transition: 'transform 0.2s, border-color 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          >
            {item.icon}
            <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#475569', marginTop: '6px', textAlign: 'center', display: 'block', padding: '0 4px' }}>
              {item.name.split(' ')[0]}
            </span>
          </button>
        ))}
      </div>

      {/* Targeted Categorization Basket Area Wrapper Element */}
      <div style={{
        width: '100%',
        maxWidth: '580px',
        minHeight: '160px',
        backgroundColor: '#f0fdf4',
        border: '4px dashed #22c55e',
        borderRadius: '32px',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '16px',
        boxSizing: 'border-box'
      }}>
        <h3 style={{ margin: 0, color: '#166534', fontSize: '1.5rem', fontWeight: '800' }}>
          🧺 Traditional Kitchen Basket
        </h3>
        
        {basket.length === 0 ? (
          <p style={{ color: '#15803d', fontSize: '1.15rem', fontWeight: '600', margin: 0 }}>
            Basket is empty. Select traditional utensils above!
          </p>
        ) : (
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
            {basket.map((item) => (
              <div 
                key={item.id} 
                style={{ fontSize: '3rem', width: '80px', height: '80px', backgroundColor: '#ffffff', border: '3px solid #22c55e', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)', animation: 'bounce 0.5s ease' }}
              >
                {item.icon}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Completion Advance Command Trigger */}
      {itemsPool.filter(i => i.isKitchenItem).length === 0 && (
        <button
          onClick={() => { alert("Cognitive batch phase registered successfully."); nextStep(); window.location.href = '/caregiver'; }}
          style={{ padding: '16px 36px', backgroundColor: '#22c55e', color: '#ffffff', fontSize: '1.25rem', fontWeight: '800', border: 'none', borderRadius: '14px', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgb(34 197 94 / 0.2)' }}
        >
          ➡️ Complete Task & Save Logs
        </button>
      )}

    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { useSessionStore } from '../../store/session.store';
import { apiClient } from '../../services/api';

interface GameItem {
  id: string;
  title: string;
  content_metadata: string; // Used to store the emoji/icon mapping string
  is_active: boolean;
  activity_id: string;
}

export const CategorizationActivity: React.FC = () => {
  const logInteractionTelemetry = useSessionStore((state) => state.logInteractionTelemetry);
  const currentSupportLevel = useSessionStore((state) => state.currentSupportLevel);
  const nextStep = useSessionStore((state) => state.nextStep);
  
  // Extract active session meta context to pull appropriate linguistic files
  const currentSessionId = useSessionStore((state) => state.sessionId || 'sess_001');

  const [itemsPool, setItemsPool] = useState<GameItem[]>([]);
  const [basket, setBasket] = useState<GameItem[]>([]);
  const [activeMessage, setActiveMessage] = useState('Synchronizing dynamic cultural assets from database...');
  const [startTime] = useState(Date.now());
  const [isLoading, setIsLoading] = useState(true);

  // Poll database content filtered by language/community parameters matching current session context
  useEffect(() => {
    const fetchContent = async () => {
      try {
        setIsLoading(true);
        // Query the content route gateway over port 8000
        const data = await apiClient.get<GameItem[]>(`/content/activity/act_cat_001?session_id=${currentSessionId}`);
        
        if (data && data.length > 0) {
          setItemsPool(data);
          setActiveMessage('Touch an item to sort it into the Kitchen Basket.');
        } else {
          // Fallback pool array if the live database seed row array is uncommitted
          setItemsPool([
            { id: 'item_cat_001', title: 'Xorai (Brass Tray)', content_metadata: '盤', is_active: true, activity_id: 'act_cat_001' },
            { id: 'item_cat_002', title: 'Gamosa (Textile Fabric)', content_metadata: '🧣', is_active: true, activity_id: 'act_cat_001' },
            { id: 'item_cat_003', title: 'Jaapi (Bamboo Hat)', content_metadata: '👒', is_active: true, activity_id: 'act_cat_001' },
            { id: 'item_cat_004', title: 'Kahi (Traditional Plate)', content_metadata: '🍽️', is_active: true, activity_id: 'act_cat_001' }
          ]);
          setActiveMessage('Using localized fallback asset registry. Touch an item to sort.');
        }
      } catch (err) {
        setActiveMessage('⚠️ Connection error. Running offline task context layer.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchContent();
  }, [currentSessionId]);

  const handleItemSort = async (selectedItem: GameItem) => {
    const clickTime = Date.now();
    const dwellTime = clickTime - startTime;

    // A simple intrinsic indicator: check metadata to classify utensils
    const isKitchenItem = selectedItem.content_metadata === '盤' || selectedItem.content_metadata === '🍽️' || selectedItem.title.toLowerCase().includes('tray') || selectedItem.title.toLowerCase().includes('plate');

    if (isKitchenItem) {
      setBasket((prev) => [...prev, selectedItem]);
      setItemsPool((prev) => prev.filter((item) => item.id !== selectedItem.id));
      setActiveMessage(`🌟 Excellent! The ${selectedItem.title} goes into the Kitchen.`);
      
      await logInteractionTelemetry('act_cat_001', selectedItem.id, 'drop', dwellTime, true);
    } else {
      setActiveMessage(`🔊 The ${selectedItem.title} belongs somewhere else. Try again!`);
      
      await logInteractionTelemetry('act_cat_001', selectedItem.id, 'click', dwellTime, false);
    }
  };

  if (isLoading) {
    return <div style={{ padding: '24px', textAlign: 'center', fontSize: '1.25rem', fontWeight: 'bold' }}>⏳ Querying repository layer...</div>;
  }

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '32px', fontFamily: 'sans-serif' }}>
      
      <div style={{ padding: '16px 24px', backgroundColor: '#f1f5f9', border: '2px solid #cbd5e1', borderRadius: '16px', fontSize: '1.25rem', fontWeight: '700', color: '#1e293b', textAlign: 'center', width: '100%', boxSizing: 'border-box' }}>
        {activeMessage}
      </div>

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
              boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.05)'
            }}
          >
            {item.content_metadata}
            <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#475569', marginTop: '6px', textAlign: 'center', display: 'block', padding: '0 4px' }}>
              {item.title}
            </span>
          </button>
        ))}
      </div>

      <div style={{ width: '100%', maxWidth: '580px', minHeight: '160px', backgroundColor: '#f0fdf4', border: '4px dashed #22c55e', borderRadius: '32px', padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', boxSizing: 'border-box' }}>
        <h3 style={{ margin: 0, color: '#166534', fontSize: '1.5rem', fontWeight: '800' }}>🧺 Traditional Kitchen Basket</h3>
        {basket.length === 0 ? (
          <p style={{ color: '#15803d', fontSize: '1.15rem', fontWeight: '600', margin: 0 }}>Basket is empty. Select traditional utensils above!</p>
        ) : (
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
            {basket.map((item) => (
              <div key={item.id} style={{ fontSize: '3rem', width: '80px', height: '80px', backgroundColor: '#ffffff', border: '3px solid #22c55e', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {item.content_metadata}
              </div>
            ))}
          </div>
        )}
      </div>

      {currentSupportLevel > 0 && (
        <div style={{ width: '100%', maxWidth: '580px', backgroundColor: '#eff6ff', border: '2px solid #bfdbfe', borderRadius: '16px', padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '2rem' }}>💡</span>
          <p style={{ margin: 0, fontSize: '1.1rem', color: '#1e3a8a', fontWeight: '600' }}>Support Level {currentSupportLevel} Active: Look for items made of wood or brass metals to put in the basket. Take your time!</p>
        </div>
      )}

      {itemsPool.length === 0 && basket.length > 0 && (
        <button
          onClick={() => { nextStep(); window.location.href = '/caregiver'; }}
          style={{ padding: '16px 36px', backgroundColor: '#22c55e', color: '#ffffff', fontSize: '1.25rem', fontWeight: '800', border: 'none', borderRadius: '14px', cursor: 'pointer' }}
        >
          ➡️ Complete Task & Save Logs
        </button>
      )}

    </div>
  );
};

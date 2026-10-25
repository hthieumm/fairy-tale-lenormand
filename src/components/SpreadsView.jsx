import React, { useState } from 'react';
import { Compass, Sparkles, HelpCircle, Layers, ArrowRight } from 'lucide-react';
import { SPREADS_DATA } from '../data/cardsData';

export default function SpreadsView({ onSelectSpreadForReading }) {
  const [activeSpreadId, setActiveSpreadId] = useState('fan');

  const selectedSpread = SPREADS_DATA.find((s) => s.id === activeSpreadId) || SPREADS_DATA[0];

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2.5rem 1.5rem' }}>
      
      {/* Header Banner */}
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.4rem',
          backgroundColor: '#FFFDF0',
          color: '#9A7410',
          border: '1px solid #D4AF37',
          padding: '0.3rem 0.9rem',
          borderRadius: '20px',
          fontSize: '0.85rem',
          fontWeight: 700,
          marginBottom: '0.8rem'
        }}>
          <Compass size={15} /> QUY TẮC & SƠ ĐỒ TRẢI BÀI
        </div>
        <h2 style={{ fontSize: '2.6rem', color: '#143820', margin: '0.2rem 0' }}>
          Các Kiểu Trải Bài Lenormand Cổ Tích
        </h2>
        <p style={{ fontSize: '1.05rem', color: '#4A5850', maxWidth: '680px', margin: '0.5rem auto 0 auto' }}>
          Khám phá các sơ đồ trải bài độc đáo như Trải bài Chiếc Quạt, Ngã Tư Đường, Tòa Tháp Rapunzel và Kết Thúc Có Hậu.
        </p>
      </div>

      {/* Spread Selection Tabs */}
      <div style={{
        display: 'flex',
        gap: '0.8rem',
        overflowX: 'auto',
        paddingBottom: '0.5rem',
        marginBottom: '2rem',
        justifyContent: 'center',
        flexWrap: 'wrap'
      }}>
        {SPREADS_DATA.map((spread) => {
          const isActive = activeSpreadId === spread.id;
          return (
            <button
              key={spread.id}
              onClick={() => setActiveSpreadId(spread.id)}
              style={{
                padding: '0.8rem 1.4rem',
                borderRadius: '12px',
                fontSize: '0.95rem',
                fontWeight: isActive ? 700 : 500,
                cursor: 'pointer',
                border: isActive ? '2px solid #D4AF37' : '1px solid #E8F2EC',
                backgroundColor: isActive ? '#1E4D2B' : '#FFFFFF',
                color: isActive ? '#F4E7B2' : '#4A5850',
                boxShadow: isActive ? '0 6px 20px rgba(30, 77, 43, 0.15)' : '0 2px 8px rgba(0,0,0,0.02)',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <Layers size={18} color={isActive ? '#F4E7B2' : '#9A7410'} />
              {spread.title} ({spread.cardsCount} lá)
            </button>
          );
        })}
      </div>

      {/* Main Spread Detail Box */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '20px',
        border: '2px solid #D4AF37',
        padding: '2.5rem',
        boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
        display: 'grid',
        gridTemplateColumns: 'minmax(280px, 360px) 1fr',
        gap: '2.5rem',
        alignItems: 'start'
      }}>
        
        {/* Left Column: Visual Diagram representation */}
        <div style={{
          backgroundColor: '#FAF8F5',
          borderRadius: '16px',
          padding: '2rem 1.5rem',
          border: '1px solid rgba(212, 175, 55, 0.3)',
          textAlign: 'center'
        }}>
          <h4 style={{ fontSize: '1.2rem', color: '#1E4D2B', marginBottom: '1.2rem' }}>
            Mô Hình Sơ Đồ Trải Bài
          </h4>

          {/* Diagram Layout Renderer */}
          {selectedSpread.id === 'fan' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '1rem 0' }}>
              <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'center' }}>
                <div className="card-slot">Lá 2 (Folds)</div>
                <div className="card-slot highlight">Lá 3 (Folds)</div>
                <div className="card-slot">Lá 4 (Folds)</div>
              </div>
              <div className="card-slot focus">Lá 1 (Trọng tâm Đáy)</div>
            </div>
          )}

          {selectedSpread.id === 'crossroads' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.2rem' }}>
              <div style={{ display: 'flex', gap: '2rem' }}>
                <div style={{ border: '1px dashed #D4AF37', padding: '0.6rem', borderRadius: '8px' }}>
                  <small style={{ fontWeight: 700, color: '#9A7410' }}>Quạt 1 (Con đường A)</small>
                </div>
                <div style={{ border: '1px dashed #D4AF37', padding: '0.6rem', borderRadius: '8px' }}>
                  <small style={{ fontWeight: 700, color: '#9A7410' }}>Quạt 2 (Con đường B)</small>
                </div>
              </div>
              <div style={{ border: '1px dashed #1E4D2B', padding: '0.6rem', borderRadius: '8px', width: '80%' }}>
                <small style={{ fontWeight: 700, color: '#1E4D2B' }}>Quạt 3 (Hiện tại & Động lực)</small>
              </div>
            </div>
          )}

          {selectedSpread.id === 'tower' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center' }}>
              {['Tầng 4: Lối thoát', 'Tầng 3: Bài học', 'Tầng 2: Nguyên nhân giam hãm', 'Tầng 1: Lý do bị mắc kẹt'].map((level, i) => (
                <div key={i} style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: i === 0 ? '#FFFDF0' : '#FFFFFF',
                  border: '1px solid #D4AF37',
                  borderRadius: '6px',
                  width: '90%',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  color: '#1E4D2B'
                }}>
                  {level}
                </div>
              ))}
            </div>
          )}

          {selectedSpread.id === 'happily-ever-after' && (
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              {['Quạt 1: Bản thân', 'Quạt 2: Tri kỷ', 'Quạt 3: Nơi chốn'].map((fan, i) => (
                <div key={i} style={{
                  padding: '0.8rem 0.5rem',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #1E4D2B',
                  borderRadius: '8px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: '#1E4D2B',
                  flex: '1 1 80px'
                }}>
                  {fan}
                </div>
              ))}
            </div>
          )}

          <button
            onClick={() => onSelectSpreadForReading && onSelectSpreadForReading(selectedSpread.id)}
            style={{
              marginTop: '1.8rem',
              width: '100%',
              padding: '0.75rem 1rem',
              backgroundColor: '#1E4D2B',
              color: '#F4E7B2',
              border: '1px solid #D4AF37',
              borderRadius: '10px',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              boxShadow: '0 4px 12px rgba(30, 77, 43, 0.2)'
            }}
          >
            <Sparkles size={16} color="#D4AF37" />
            Thực Hiện Trải Bài Này Ngay
          </button>
        </div>

        {/* Right Column: Full Instructions & Details */}
        <div>
          <h3 style={{ fontSize: '2rem', color: '#143820', marginBottom: '0.5rem' }}>
            {selectedSpread.title}
          </h3>
          <div style={{ fontSize: '0.9rem', color: '#9A7410', fontWeight: 700, marginBottom: '1.2rem' }}>
            Tổng số lá bài sử dụng: {selectedSpread.cardsCount} lá
          </div>

          <p style={{
            fontSize: '1rem',
            color: '#2C3E50',
            lineHeight: 1.7,
            backgroundColor: '#FAF8F5',
            padding: '1.2rem',
            borderRadius: '12px',
            borderLeft: '4px solid #D4AF37',
            marginBottom: '1.5rem'
          }}>
            {selectedSpread.description}
          </p>

          <h4 style={{ fontSize: '1.2rem', color: '#1E4D2B', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <ArrowRight size={18} color="#D4AF37" /> Các Bước Trực Tiếp Luận Giải:
          </h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            {selectedSpread.instructions.map((step, idx) => (
              <div key={idx} style={{
                backgroundColor: '#FFFFFF',
                padding: '0.9rem 1.1rem',
                borderRadius: '10px',
                border: '1px solid #E8F2EC',
                fontSize: '0.95rem',
                color: '#1A231E',
                lineHeight: 1.6
              }}>
                {step}
              </div>
            ))}
          </div>
        </div>

      </div>

      <style>{`
        .card-slot {
          padding: 0.5rem 0.8rem;
          border: 1.5px solid #D4AF37;
          border-radius: 6px;
          background-color: #FFFFFF;
          font-size: 0.75rem;
          font-weight: 700;
          color: #4A5850;
        }
        .card-slot.focus {
          background-color: #1E4D2B;
          color: #F4E7B2;
          border-color: #D4AF37;
          box-shadow: 0 4px 10px rgba(30, 77, 43, 0.2);
        }
      `}</style>
    </div>
  );
}

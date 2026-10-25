import React from 'react';
import { X, BookOpen, Sparkles, Heart, ShieldAlert, Award } from 'lucide-react';
import CardVisual from './CardVisual';

export default function CardDetailModal({ card, onClose }) {
  if (!card) return null;

  const isRedSuit = card.suit === 'hearts' || card.suit === 'diamonds';

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 1000,
      backgroundColor: 'rgba(20, 56, 32, 0.65)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
      animation: 'fadeIn 0.25s ease-out'
    }} onClick={onClose}>
      
      <div style={{
        backgroundColor: '#FAF8F5',
        borderRadius: '20px',
        maxWidth: '900px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        border: '2px solid #D4AF37',
        boxShadow: '0 20px 50px rgba(0,0,0,0.25)',
        position: 'relative',
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: '0'
      }} onClick={(e) => e.stopPropagation()}>

        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1.2rem',
            right: '1.2rem',
            zIndex: 10,
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            backgroundColor: '#FFFDF0',
            border: '1px solid #D4AF37',
            color: '#143820',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}
        >
          <X size={20} />
        </button>

        {/* Modal Layout Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(260px, 320px) 1fr',
          gap: '2rem',
          padding: '2rem'
        }}>
          {/* Left Column: Big Card Visual & Meta Info */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.2rem' }}>
            <div style={{ width: '100%', maxWidth: '280px' }}>
              <CardVisual card={card} showDetail={true} />
            </div>

            {/* Meta Tags */}
            <div style={{
              width: '100%',
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              padding: '1rem',
              border: '1px solid rgba(212, 175, 55, 0.3)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
            }}>
              <div style={{ fontSize: '0.85rem', color: '#4A5850', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Award size={16} color="#9A7410" />
                <strong>Số thứ tự:</strong> #{card.id} / 36
              </div>
              <div style={{ fontSize: '0.85rem', color: '#4A5850', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Heart size={16} color={isRedSuit ? '#C0392B' : '#2C3E50'} />
                <strong>Quân bài Tây:</strong> 
                <span style={{ 
                  color: isRedSuit ? '#C0392B' : '#2C3E50',
                  fontWeight: 700
                }}>
                  {card.playingCard}
                </span>
              </div>
              <div style={{ fontSize: '0.85rem', color: '#4A5850', display: 'flex', alignItems: 'flex-start', gap: '0.4rem' }}>
                <Sparkles size={16} color="#D4AF37" style={{ marginTop: '2px' }} />
                <div>
                  <strong>Truyện cổ tích:</strong>
                  <div style={{ color: '#1E4D2B', fontWeight: 600, marginTop: '2px' }}>
                    {card.fairyTale}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Full Detailed Vietnamese Explanations */}
          <div>
            {/* Header Title */}
            <div style={{ borderBottom: '2px dashed rgba(212, 175, 55, 0.4)', paddingBottom: '1rem', marginBottom: '1.2rem' }}>
              <div style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: '#9A7410', fontWeight: 700, letterSpacing: '0.08em' }}>
                Fairy Tale Lenormand Card #{card.id}
              </div>
              <h2 style={{ fontSize: '2.2rem', color: '#143820', margin: '0.2rem 0' }}>
                {card.id}. {card.name}
              </h2>
              <div style={{ 
                backgroundColor: '#E8F2EC',
                color: '#1E4D2B',
                padding: '0.5rem 0.8rem',
                borderRadius: '8px',
                fontSize: '0.9rem',
                fontWeight: 600,
                marginTop: '0.5rem'
              }}>
                🔑 Từ khóa: {card.keywords}
              </div>
            </div>

            {/* Summary */}
            <p style={{
              fontSize: '1rem',
              color: '#1A231E',
              fontStyle: 'italic',
              lineHeight: 1.5,
              marginBottom: '1.5rem',
              backgroundColor: '#FFFDF0',
              padding: '0.8rem 1rem',
              borderRadius: '8px',
              borderLeft: '4px solid #D4AF37'
            }}>
              "{card.summary}"
            </p>

            {/* Fairy Tale Story Section */}
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{
                fontSize: '1.3rem',
                color: '#1E4D2B',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '0.6rem'
              }}>
                <BookOpen size={20} color="#D4AF37" />
                Câu Chuyện Cổ Tích Nguồn Cảm Hứng
              </h3>
              <p style={{
                fontSize: '0.95rem',
                color: '#2C3E50',
                lineHeight: 1.7,
                whiteSpace: 'pre-line',
                backgroundColor: '#FFFFFF',
                padding: '1rem',
                borderRadius: '10px',
                border: '1px solid #EAECEE'
              }}>
                {card.story}
              </p>
            </div>

            {/* Detailed Interpretation Section */}
            <div>
              <h3 style={{
                fontSize: '1.3rem',
                color: '#1E4D2B',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '0.6rem'
              }}>
                <Sparkles size={20} color="#D4AF37" />
                Luận Giải Chi Tiết Như Trong PDF Sách Hướng Dẫn
              </h3>
              <p style={{
                fontSize: '0.95rem',
                color: '#1A231E',
                lineHeight: 1.75,
                whiteSpace: 'pre-line',
                backgroundColor: '#FFFFFF',
                padding: '1.2rem',
                borderRadius: '10px',
                border: '1px solid #E8F2EC',
                boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
              }}>
                {card.interpretation}
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

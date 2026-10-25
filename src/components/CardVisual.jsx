import React from 'react';

// Storybook icons / motifs for each card
const CARD_MOTIFS = {
  1: '🎠', 2: '🍀', 3: '⛵', 4: '🏡', 5: '🌲', 6: '☁️', 7: '🐍', 8: '⚰️',
  9: '💐', 10: '🌾', 11: '🪢', 12: '🐦', 13: '🧒', 14: '🦊', 15: '🐻', 16: '⭐',
  17: '🦩', 18: '🐕', 19: '🏰', 20: '🌷', 21: '⛰️', 22: '🔀', 23: '🐀', 24: '💖',
  25: '💍', 26: '📜', 27: '✉️', 28: '🤴', 29: '👸', 30: '🪷', 31: '☀️', 32: '🌙',
  33: '🔑', 34: '🐟', 35: '⚓', 36: '✝️'
};

function CardVisual({ card, width = '100%', showDetail = false, isFlipped = true }) {
  if (!card) return null;

  const isRedSuit = card.suit === 'hearts' || card.suit === 'diamonds';
  const suitSymbol = card.suit === 'hearts' ? '♥' : card.suit === 'diamonds' ? '♦' : card.suit === 'clubs' ? '♣' : '♠';
  const motif = CARD_MOTIFS[card.id] || '✨';

  // Use explicit card.image if specified, otherwise default to /assets/cards/card-{id}.jpg
  const imagePath = card.image || `/assets/cards/card-${card.id}.jpg`;

  if (!isFlipped) {
    return (
      <div style={{
        width,
        aspectRatio: '2/3',
        borderRadius: '12px',
        background: 'linear-gradient(135deg, #143820 0%, #1E4D2B 50%, #0D2615 100%)',
        border: '3px solid #D4AF37',
        boxShadow: '0 6px 18px rgba(0,0,0,0.15)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Back of Card Pattern */}
        <div style={{
          position: 'absolute',
          inset: '8px',
          border: '1px solid rgba(212, 175, 55, 0.5)',
          borderRadius: '8px',
          background: 'radial-gradient(circle, rgba(212,175,55,0.15) 0%, transparent 70%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            border: '2px solid #D4AF37',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.8rem'
          }}>
            🪷
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      width,
      aspectRatio: '2/3',
      borderRadius: '12px',
      background: '#FFFDF9',
      border: '3px solid #D4AF37',
      boxShadow: '0 6px 20px rgba(30, 77, 43, 0.12)',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      overflow: 'hidden',
      transition: 'transform 0.3s ease, box-shadow 0.3s ease'
    }}>
      {/* Outer Decorative Border */}
      <div style={{
        position: 'absolute',
        inset: '4px',
        border: '1px solid rgba(212, 175, 55, 0.4)',
        borderRadius: '8px',
        pointerEvents: 'none',
        zIndex: 2
      }} />

      {/* Top Header Badge (Card No & Playing Card) */}
      <div style={{
        padding: '0.4rem 0.6rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'linear-gradient(to bottom, #F8F4EB, #FFFDF9)',
        borderBottom: '1px solid rgba(212, 175, 55, 0.3)',
        zIndex: 3
      }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#1E4D2B', fontFamily: 'Cormorant Garamond, serif' }}>
          #{card.id}
        </span>
        <span style={{
          fontSize: '0.85rem',
          fontWeight: 700,
          color: isRedSuit ? '#C0392B' : '#2C3E50',
          backgroundColor: isRedSuit ? '#FDEDEC' : '#EAECEE',
          padding: '0.15rem 0.4rem',
          borderRadius: '4px',
          fontFamily: 'sans-serif'
        }}>
          {card.playingCard}
        </span>
      </div>

      {/* Center Image or Fairy Tale Visual Artwork */}
      <div style={{
        flex: 1,
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: imagePath ? '#000' : 'linear-gradient(135deg, #E8F2EC 0%, #FAF8F5 100%)',
        overflow: 'hidden'
      }}>
        {imagePath ? (
          <img 
            src={imagePath} 
            alt={card.name}
            loading="lazy"
            decoding="async"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <div style={{
            textAlign: 'center',
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <div style={{
              fontSize: showDetail ? '3.5rem' : '2.5rem',
              marginBottom: '0.3rem',
              filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))'
            }}>
              {motif}
            </div>
            <div style={{
              fontSize: '0.75rem',
              color: '#9A7410',
              fontWeight: 600,
              fontStyle: 'italic',
              maxWidth: '90%',
              lineHeight: 1.2
            }}>
              {card.fairyTale.split('(')[0]}
            </div>
          </div>
        )}
      </div>

      {/* Footer Title Banner */}
      <div style={{
        padding: '0.4rem 0.3rem',
        textAlign: 'center',
        background: 'linear-gradient(135deg, #1E4D2B 0%, #143820 100%)',
        color: '#F4E7B2',
        borderTop: '2px solid #D4AF37',
        zIndex: 3
      }}>
        <div style={{
          fontSize: '0.9rem',
          fontWeight: 700,
          fontFamily: 'Cormorant Garamond, serif',
          letterSpacing: '0.05em',
          lineHeight: 1.1
        }}>
          {card.name}
        </div>
      </div>
    </div>
  );
}

const MemoizedCardVisual = React.memo(CardVisual, (prevProps, nextProps) => {
  return (
    prevProps.card?.id === nextProps.card?.id &&
    prevProps.isFlipped === nextProps.isFlipped &&
    prevProps.width === nextProps.width &&
    prevProps.showDetail === nextProps.showDetail
  );
});

export default MemoizedCardVisual;

import React, { useState, useMemo } from 'react';
import { Search, Filter, Sparkles, BookOpen } from 'lucide-react';
import CardVisual from './CardVisual';
import CardDetailModal from './CardDetailModal';

export default function CardList({ cardsData }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSuit, setSelectedSuit] = useState('all');
  const [selectedCard, setSelectedCard] = useState(null);

  // Real-time search & filter logic
  const filteredCards = useMemo(() => {
    return cardsData.filter((card) => {
      // Suit filter
      if (selectedSuit !== 'all' && card.suit !== selectedSuit) {
        return false;
      }

      // Text search matching (English Name, Card Number, Playing Card, Keywords, Fairy Tale Story)
      if (searchTerm.trim() === '') return true;

      const query = searchTerm.toLowerCase();
      const matchName = card.name.toLowerCase().includes(query);
      const matchId = card.id.toString() === query || `#${card.id}` === query;
      const matchPlayingCard = card.playingCard.toLowerCase().includes(query);
      const matchKeywords = card.keywords.toLowerCase().includes(query);
      const matchFairyTale = card.fairyTale.toLowerCase().includes(query);
      const matchSummary = card.summary.toLowerCase().includes(query);

      return matchName || matchId || matchPlayingCard || matchKeywords || matchFairyTale || matchSummary;
    });
  }, [cardsData, searchTerm, selectedSuit]);

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      
      {/* Page Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #1E4D2B 0%, #143820 100%)',
        borderRadius: '20px',
        padding: '2.5rem 2rem',
        color: '#FFFFFF',
        marginBottom: '2.5rem',
        border: '2px solid #D4AF37',
        boxShadow: '0 10px 30px rgba(20, 56, 32, 0.15)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          right: '-20px',
          bottom: '-30px',
          opacity: 0.1,
          fontSize: '12rem',
          pointerEvents: 'none',
          userSelect: 'none'
        }}>
          🪷
        </div>
        
        <div style={{ maxWidth: '750px', position: 'relative', zIndex: 2 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            backgroundColor: 'rgba(212, 175, 55, 0.2)',
            color: '#F4E7B2',
            padding: '0.3rem 0.8rem',
            borderRadius: '20px',
            fontSize: '0.8rem',
            fontWeight: 700,
            letterSpacing: '0.05em',
            marginBottom: '0.8rem',
            border: '1px solid rgba(212, 175, 55, 0.4)'
          }}>
            <Sparkles size={14} /> BỘ BÀI FAIRY TALE LENORMAND TRỌN BỘ (42 LÁ)
          </div>
          <h2 style={{ fontSize: '2.5rem', margin: '0 0 0.6rem 0', color: '#F4E7B2' }}>
            Nội Dung & Ý Nghĩa Chi Tiết 42 Lá Bài (Gồm Nam / Nữ Phụ)
          </h2>
          <p style={{ fontSize: '1rem', color: '#E8F2EC', lineHeight: 1.6, margin: 0 }}>
            Tên các lá bài được giữ nguyên Tiếng Anh gốc (1. Rider ... 40. Market, 41. Man (Nam phụ), 42. Woman (Nữ phụ)). Phần giải thích, từ khóa và câu chuyện cổ tích nguồn cảm hứng được chuẩn hóa theo trọn bộ tài liệu Fairy Tale Lenormand.
          </p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '16px',
        padding: '1.2rem 1.5rem',
        marginBottom: '2rem',
        border: '1px solid rgba(212, 175, 55, 0.3)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '1rem',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        
        {/* Search Input */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          backgroundColor: '#FAF8F5',
          border: '1.5px solid #E8F2EC',
          borderRadius: '10px',
          padding: '0.6rem 1rem',
          flex: '1 1 320px',
          transition: 'all 0.2s ease'
        }}>
          <Search size={20} color="#9A7410" />
          <input
            type="text"
            placeholder="Tìm kiếm lá bài (VD: Rider, Thumbelina, #1, 9♥, Cỏ ba lá, Thuyền...)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              border: 'none',
              outline: 'none',
              backgroundColor: 'transparent',
              width: '100%',
              fontSize: '0.95rem',
              color: '#1A231E'
            }}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              style={{
                border: 'none',
                background: 'none',
                color: '#6E7E75',
                cursor: 'pointer',
                fontSize: '0.85rem'
              }}
            >
              Xóa
            </button>
          )}
        </div>

        {/* Filter Buttons */}
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: '0.85rem', color: '#6E7E75', fontWeight: 600, marginRight: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <Filter size={16} /> Chất bài:
          </span>

          {[
            { id: 'all', label: `Tất cả (${cardsData.length})` },
            { id: 'hearts', label: '♥ Cơ' },
            { id: 'diamonds', label: '♦ Rô' },
            { id: 'clubs', label: '♣ Chuồn' },
            { id: 'spades', label: '♠ Bích' }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setSelectedSuit(item.id)}
              style={{
                padding: '0.45rem 0.85rem',
                borderRadius: '8px',
                fontSize: '0.85rem',
                fontWeight: selectedSuit === item.id ? 700 : 500,
                cursor: 'pointer',
                border: selectedSuit === item.id ? '1px solid #D4AF37' : '1px solid #E8F2EC',
                backgroundColor: selectedSuit === item.id ? '#1E4D2B' : '#FAF8F5',
                color: selectedSuit === item.id ? '#F4E7B2' : '#4A5850',
                transition: 'all 0.2s ease'
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Cards Count Info */}
      <div style={{ marginBottom: '1.2rem', color: '#6E7E75', fontSize: '0.9rem' }}>
        Hiển thị <strong>{filteredCards.length}</strong> / {cardsData.length} lá bài
      </div>

      {/* Cards Grid */}
      {filteredCards.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '4rem 2rem',
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          border: '1px dashed #D4AF37'
        }}>
          <p style={{ fontSize: '1.2rem', color: '#9A7410', fontWeight: 600, margin: 0 }}>
            Không tìm thấy lá bài nào khớp với "{searchTerm}"
          </p>
          <button
            onClick={() => { setSearchTerm(''); setSelectedSuit('all'); }}
            style={{
              marginTop: '1rem',
              padding: '0.6rem 1.2rem',
              backgroundColor: '#1E4D2B',
              color: '#F4E7B2',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 600
            }}
          >
            Hiển thị lại tất cả bài
          </button>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: '1.5rem'
        }}>
          {filteredCards.map((card) => (
            <div
              key={card.id}
              onClick={() => setSelectedCard(card)}
              style={{
                cursor: 'pointer',
                transition: 'all 0.25s ease',
                borderRadius: '14px',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                backgroundColor: '#FFFFFF',
                border: '1px solid #E8F2EC'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-6px)';
                e.currentTarget.style.boxShadow = '0 12px 25px rgba(30, 77, 43, 0.18)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <CardVisual card={card} />
              <div style={{
                padding: '0.85rem 0.9rem',
                backgroundColor: '#FFFFFF',
                borderRadius: '0 0 12px 12px',
                flex: 1,
                display: 'flex',
                flexDirection: 'column'
              }}>
                {/* Upper Block: Fixed minHeight so key section aligns perfectly across cards */}
                <div style={{ minHeight: '76px', marginBottom: '0.5rem' }}>
                  <div style={{
                    fontSize: '0.95rem',
                    color: '#1E4D2B',
                    fontWeight: 800,
                    marginBottom: '0.3rem',
                    fontFamily: 'Cormorant Garamond, serif',
                    lineHeight: 1.3
                  }}>
                    Lá #{card.id} - {card.vnName || card.name}
                  </div>
                  <div style={{
                    fontSize: '0.82rem',
                    color: '#9A7410',
                    fontWeight: 600,
                    lineHeight: 1.4
                  }}>
                    📖 {card.fairyTale}
                  </div>
                </div>

                {/* Lower Block: Key Section (Fixed Equal Height Reserved) */}
                <div style={{
                  borderTop: '1px dashed #E8F2EC',
                  paddingTop: '0.5rem',
                  fontSize: '0.82rem',
                  color: '#4A5850',
                  lineHeight: 1.45,
                  minHeight: '65px'
                }}>
                  🔑 {card.keywords}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Card Detail Modal */}
      {selectedCard && (
        <CardDetailModal
          card={selectedCard}
          onClose={() => setSelectedCard(null)}
        />
      )}

    </div>
  );
}

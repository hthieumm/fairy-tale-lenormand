import React, { useState } from 'react';
import { Sparkles, X, RotateCw, Eye, Wand2, Star } from 'lucide-react';

export default function ArtisticReadingButton({ onOpenArtisticPage }) {
  const [isHovered, setIsHovered] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('spread'); // 'spread', '3dview'
  const [spinSpeed, setSpinSpeed] = useState('medium'); // 'slow', 'medium', 'fast', 'paused'
  const [drawnCards] = useState([
    { id: 1, title: 'Giấc Mơ Vũ Trụ (Past)', interpretation: 'Khởi nguồn năng lượng nghệ thuật, cảm hứng tinh thần và những ước mơ bay bổng xa xôi.' },
    { id: 2, title: 'Hòa Hợp Kỳ Diệu (Present)', interpretation: 'Sự giao thoa giữa ánh sáng và bóng tối, biến chuyển thực tại thành tác phẩm nghệ thuật.' },
    { id: 3, title: 'Tương Lai Rực Rỡ (Future)', interpretation: 'Thành quả tỏa sáng, chân lý nghệ thuật và định hướng tương lai tràn đầy hy vọng.' }
  ]);

  const frontImg = '/assets/artistic/card_front.png';
  const backImg = '/assets/artistic/card_back.png';

  const spinSpeedMap = {
    slow: '12s',
    medium: '6s',
    fast: '3s',
    paused: '0s'
  };

  const handleClick = () => {
    if (onOpenArtisticPage) {
      onOpenArtisticPage();
    } else {
      setIsModalOpen(true);
    }
  };

  return (
    <>
      {/* Floating Bottom-Right Cosmic Button Container */}
      <div 
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          pointerEvents: 'auto'
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* 3D Continuously Rotating Card Hover Preview */}
        {isHovered && !isModalOpen && (
          <div style={{
            position: 'absolute',
            bottom: 'calc(100% + 16px)',
            right: '0',
            perspective: '1000px',
            animation: 'fadeInScale 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
            pointerEvents: 'none'
          }}>
            {/* Cosmic Glow Background Aura behind hover preview */}
            <div style={{
              position: 'relative',
              padding: '16px 16px 20px 16px',
              background: 'rgba(11, 9, 26, 0.92)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1.5px solid rgba(212, 175, 55, 0.6)',
              borderRadius: '20px',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6), 0 0 30px rgba(168, 85, 247, 0.4), 0 0 15px rgba(59, 130, 246, 0.3)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              width: '210px'
            }}>
              {/* Header Label */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                marginBottom: '12px',
                color: '#F4E7B2',
                fontFamily: 'Cormorant Garamond, serif',
                fontSize: '0.95rem',
                fontWeight: 700,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                textShadow: '0 0 8px rgba(244, 231, 178, 0.6)'
              }}>
                <Sparkles size={14} color="#FFE678" style={{ animation: 'spinSlow 6s linear infinite' }} />
                <span>Trải Bài Nghệ Thuật</span>
                <Sparkles size={14} color="#FFE678" style={{ animation: 'spinSlow 6s linear infinite' }} />
              </div>

              {/* 3D Spinning Card Wrapper */}
              <div style={{
                width: '150px',
                height: '230px',
                position: 'relative',
                transformStyle: 'preserve-3d',
                animation: 'continuousRotate 6s linear infinite'
              }}>
                {/* FRONT FACE OF CARD */}
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                  borderRadius: '12px',
                  border: '2px solid #D4AF37',
                  overflow: 'hidden',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.5), 0 0 15px rgba(212, 175, 55, 0.3)',
                  background: '#0a0a16'
                }}>
                  <img 
                    src={frontImg} 
                    alt="Mặt trước bài nghệ thuật" 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/Img_FairyDreamTale_Lenoamd-20260730T165425Z-1-001/bnt_pro/rmbg_bnt/1131529475143744933.png';
                    }}
                  />
                  <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    background: 'linear-gradient(to top, rgba(10, 8, 20, 0.95), transparent)',
                    padding: '6px',
                    textAlign: 'center',
                    color: '#FFFDF0',
                    fontSize: '0.7rem',
                    fontFamily: 'Cormorant Garamond, serif',
                    letterSpacing: '0.05em'
                  }}>
                    Mặt Trước • Art Lenormand
                  </div>
                </div>

                {/* BACK FACE OF CARD */}
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)',
                  borderRadius: '12px',
                  border: '2px solid #D4AF37',
                  overflow: 'hidden',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.5), 0 0 15px rgba(168, 85, 247, 0.4)',
                  background: '#0a0a16'
                }}>
                  <img 
                    src={backImg} 
                    alt="Mặt sau bài nghệ thuật" 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/Img_FairyDreamTale_Lenoamd-20260730T165425Z-1-001/bnt_pro/rmbg_bnt/581316264452036820.png';
                    }}
                  />
                  <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    background: 'linear-gradient(to top, rgba(10, 8, 20, 0.95), transparent)',
                    padding: '6px',
                    textAlign: 'center',
                    color: '#F4E7B2',
                    fontSize: '0.7rem',
                    fontFamily: 'Cormorant Garamond, serif',
                    letterSpacing: '0.05em'
                  }}>
                    Mặt Sau • Art Lenormand
                  </div>
                </div>
              </div>

              {/* Footer hint */}
              <div style={{
                marginTop: '10px',
                fontSize: '0.72rem',
                color: '#A0B4A8',
                textAlign: 'center',
                lineHeight: '1.2'
              }}>
                ✨ Nhấn để mở Trải Bài Vũ Trụ
              </div>
            </div>
          </div>
        )}

        {/* Cosmic Styled Floating Button */}
        <button
          onClick={handleClick}
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '12px 22px',
            background: 'linear-gradient(135deg, #090A1A 0%, #150E38 40%, #2A0944 80%, #3B1443 100%)',
            color: '#F4E7B2',
            border: '1.5px solid #D4AF37',
            borderRadius: '50px',
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: '1.05rem',
            fontWeight: 700,
            letterSpacing: '0.04em',
            cursor: 'pointer',
            boxShadow: isHovered 
              ? '0 0 25px rgba(168, 85, 247, 0.8), 0 0 45px rgba(59, 130, 246, 0.6), 0 0 15px rgba(212, 175, 55, 0.5)'
              : '0 8px 25px rgba(0, 0, 0, 0.4), 0 0 15px rgba(168, 85, 247, 0.4), inset 0 0 10px rgba(212, 175, 55, 0.2)',
            transform: isHovered ? 'translateY(-3px) scale(1.04)' : 'translateY(0) scale(1)',
            transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            overflow: 'hidden'
          }}
        >
          {/* Cosmic Star Particles Background Effect */}
          <div style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'radial-gradient(circle at 20% 30%, rgba(255, 255, 255, 0.15) 1px, transparent 1px), radial-gradient(circle at 80% 70%, rgba(212, 175, 55, 0.2) 1px, transparent 1px)',
            backgroundSize: '20px 20px',
            pointerEvents: 'none'
          }} />

          {/* Glowing Cosmic Icon */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(212, 175, 55, 0.4) 0%, rgba(168, 85, 247, 0.2) 100%)',
            border: '1px solid rgba(244, 231, 178, 0.6)',
            boxShadow: '0 0 10px rgba(244, 231, 178, 0.5)'
          }}>
            <Sparkles size={16} color="#FFE678" style={{ animation: 'pulseGlow 2s ease-in-out infinite' }} />
          </div>

          <span style={{ textShadow: '0 0 10px rgba(244, 231, 178, 0.5)' }}>
            Trải bài nghệ thuật
          </span>

          <Wand2 size={16} color="#D4AF37" />
        </button>
      </div>

      {/* Interactive Artistic Spread Modal */}
      {isModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 10000,
          backgroundColor: 'rgba(5, 4, 15, 0.88)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          animation: 'fadeIn 0.3s ease-out'
        }}>
          <div style={{
            width: '100%',
            maxWidth: '1000px',
            maxHeight: '92vh',
            overflowY: 'auto',
            background: 'linear-gradient(145deg, #090A1A 0%, #150E38 50%, #1A0B2E 100%)',
            border: '2px solid #D4AF37',
            borderRadius: '24px',
            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8), 0 0 40px rgba(168, 85, 247, 0.3)',
            color: '#FAF8F5',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '20px 28px',
              borderBottom: '1px solid rgba(212, 175, 55, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'rgba(15, 12, 35, 0.6)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  padding: '8px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #D4AF37 0%, #9A7410 100%)',
                  color: '#090A1A',
                  display: 'flex'
                }}>
                  <Sparkles size={22} />
                </div>
                <div>
                  <h2 style={{
                    fontFamily: 'Cormorant Garamond, serif',
                    fontSize: '1.8rem',
                    color: '#F4E7B2',
                    margin: 0,
                    lineHeight: 1.2
                  }}>
                    Không Gian Trải Bài Nghệ Thuật 3D
                  </h2>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#A0B4A8' }}>
                    Trải nghiệm nghệ thuật thẻ bài Lenormand vũ trụ với hiệu ứng xoay 3D liên tục
                  </p>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setIsModalOpen(false)}
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(212, 175, 55, 0.4)',
                  color: '#F4E7B2',
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(212, 175, 55, 0.3)';
                  e.currentTarget.style.transform = 'rotate(90deg)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                  e.currentTarget.style.transform = 'rotate(0deg)';
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Controls Bar */}
            <div style={{
              padding: '12px 28px',
              background: 'rgba(10, 8, 24, 0.8)',
              borderBottom: '1px solid rgba(212, 175, 55, 0.15)',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px'
            }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => setActiveTab('spread')}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '20px',
                    border: '1px solid #D4AF37',
                    background: activeTab === 'spread' ? '#D4AF37' : 'transparent',
                    color: activeTab === 'spread' ? '#090A1A' : '#F4E7B2',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Wand2 size={14} />
                  Quẻ Bài Nghệ Thuật (3 Lá)
                </button>

                <button
                  onClick={() => setActiveTab('3dview')}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '20px',
                    border: '1px solid #D4AF37',
                    background: activeTab === '3dview' ? '#D4AF37' : 'transparent',
                    color: activeTab === '3dview' ? '#090A1A' : '#F4E7B2',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Eye size={14} />
                  Xoay Bài 3D 360°
                </button>
              </div>

              {/* Speed Controls */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#D4AF37' }}>
                <RotateCw size={14} />
                <span>Tốc độ xoay:</span>
                {['slow', 'medium', 'fast', 'paused'].map((spd) => (
                  <button
                    key={spd}
                    onClick={() => setSpinSpeed(spd)}
                    style={{
                      padding: '3px 10px',
                      borderRadius: '12px',
                      border: '1px solid rgba(212, 175, 55, 0.4)',
                      background: spinSpeed === spd ? 'rgba(212, 175, 55, 0.3)' : 'transparent',
                      color: spinSpeed === spd ? '#FFE678' : '#A0B4A8',
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                      textTransform: 'capitalize'
                    }}
                  >
                    {spd === 'slow' ? 'Chậm' : spd === 'medium' ? 'Vừa' : spd === 'fast' ? 'Nhanh' : 'Tạm dừng'}
                  </button>
                ))}
              </div>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '32px 28px', flex: 1, minHeight: '380px' }}>
              {activeTab === 'spread' && (
                <div>
                  <div style={{ textAlign: 'center', marginBottom: '28px' }}>
                    <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.4rem', color: '#F4E7B2' }}>
                      Trải Bài 3 Lá Nghệ Thuật: Quá Khứ - Hiện Tại - Tương Lai
                    </h3>
                    <p style={{ fontSize: '0.9rem', color: '#A0B4A8', maxWidth: '650px', margin: '6px auto 0 auto' }}>
                      Mỗi lá bài xoay 3D liên tục thể hiện chuyển động liên tục của thời gian và năng lượng vũ trụ.
                    </p>
                  </div>

                  {/* 3 Cards Row */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: '24px',
                    justifyItems: 'center',
                    marginBottom: '32px'
                  }}>
                    {drawnCards.map((card, idx) => (
                      <div key={card.id} style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        width: '100%',
                        maxWidth: '240px'
                      }}>
                        {/* 3D Card Container */}
                        <div style={{
                          width: '160px',
                          height: '240px',
                          perspective: '1000px',
                          marginBottom: '16px'
                        }}>
                          <div style={{
                            width: '100%',
                            height: '100%',
                            position: 'relative',
                            transformStyle: 'preserve-3d',
                            animation: spinSpeed !== 'paused' 
                              ? `continuousRotate ${spinSpeedMap[spinSpeed]} linear infinite` 
                              : 'none',
                            animationDelay: `${idx * 0.8}s`
                          }}>
                            {/* Front */}
                            <div style={{
                              position: 'absolute',
                              inset: 0,
                              backfaceVisibility: 'hidden',
                              borderRadius: '14px',
                              border: '2px solid #D4AF37',
                              overflow: 'hidden',
                              boxShadow: '0 10px 30px rgba(0,0,0,0.6), 0 0 20px rgba(212, 175, 55, 0.4)'
                            }}>
                              <img 
                                src={frontImg} 
                                alt="Mặt trước bài nghệ thuật" 
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = '/Img_FairyDreamTale_Lenoamd-20260730T165425Z-1-001/bnt_pro/rmbg_bnt/1131529475143744933.png';
                                }}
                              />
                            </div>
                            {/* Back */}
                            <div style={{
                              position: 'absolute',
                              inset: 0,
                              backfaceVisibility: 'hidden',
                              transform: 'rotateY(180deg)',
                              borderRadius: '14px',
                              border: '2px solid #D4AF37',
                              overflow: 'hidden',
                              boxShadow: '0 10px 30px rgba(0,0,0,0.6), 0 0 20px rgba(168, 85, 247, 0.4)'
                            }}>
                              <img 
                                src={backImg} 
                                alt="Mặt sau bài nghệ thuật" 
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = '/Img_FairyDreamTale_Lenoamd-20260730T165425Z-1-001/bnt_pro/rmbg_bnt/581316264452036820.png';
                                }}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Card Info Box */}
                        <div style={{
                          background: 'rgba(255, 255, 255, 0.04)',
                          border: '1px solid rgba(212, 175, 55, 0.3)',
                          borderRadius: '14px',
                          padding: '14px',
                          textAlign: 'center',
                          width: '100%'
                        }}>
                          <div style={{
                            fontFamily: 'Cormorant Garamond, serif',
                            fontSize: '1.1rem',
                            fontWeight: 700,
                            color: '#F4E7B2',
                            marginBottom: '6px'
                          }}>
                            {card.title}
                          </div>
                          <p style={{ fontSize: '0.82rem', color: '#CBD5E1', margin: 0, lineHeight: 1.4 }}>
                            {card.interpretation}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === '3dview' && (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: '340px'
                }}>
                  <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.5rem', color: '#F4E7B2', marginBottom: '20px' }}>
                    Chi Tiết Bài Nghệ Thuật Cổ Tích Vũ Trụ
                  </h3>

                  <div style={{
                    width: '200px',
                    height: '300px',
                    perspective: '1200px',
                    margin: '20px 0'
                  }}>
                    <div style={{
                      width: '100%',
                      height: '100%',
                      position: 'relative',
                      transformStyle: 'preserve-3d',
                      animation: spinSpeed !== 'paused' 
                        ? `continuousRotate ${spinSpeedMap[spinSpeed]} linear infinite` 
                        : 'none'
                    }}>
                      <div style={{
                        position: 'absolute',
                        inset: 0,
                        backfaceVisibility: 'hidden',
                        borderRadius: '16px',
                        border: '3px solid #D4AF37',
                        overflow: 'hidden',
                        boxShadow: '0 15px 35px rgba(0,0,0,0.7), 0 0 25px rgba(212, 175, 55, 0.5)'
                      }}>
                        <img 
                          src={frontImg} 
                          alt="Mặt trước nghệ thuật" 
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/Img_FairyDreamTale_Lenoamd-20260730T165425Z-1-001/bnt_pro/rmbg_bnt/1131529475143744933.png';
                          }}
                        />
                      </div>
                      <div style={{
                        position: 'absolute',
                        inset: 0,
                        backfaceVisibility: 'hidden',
                        transform: 'rotateY(180deg)',
                        borderRadius: '16px',
                        border: '3px solid #D4AF37',
                        overflow: 'hidden',
                        boxShadow: '0 15px 35px rgba(0,0,0,0.7), 0 0 25px rgba(168, 85, 247, 0.5)'
                      }}>
                        <img 
                          src={backImg} 
                          alt="Mặt sau nghệ thuật" 
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/Img_FairyDreamTale_Lenoamd-20260730T165425Z-1-001/bnt_pro/rmbg_bnt/581316264452036820.png';
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <p style={{ color: '#A0B4A8', fontSize: '0.88rem', marginTop: '16px', textAlign: 'center' }}>
                    Mặt trước và Mặt sau tác phẩm thiết kế Fairy Dream Tale Art Lenormand
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

import React from 'react';
import { BookOpen, Sparkles, LayoutGrid, Compass, Bot } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab }) {
  const navItems = [
    { id: 'cards', label: 'Ý Nghĩa 42 Lá Bài', icon: LayoutGrid },
    { id: 'guide', label: 'Hướng Dẫn & Cổ Tích', icon: BookOpen },
    { id: 'spreads', label: 'Các Kiểu Trải Bài', icon: Compass },
    { id: 'reading', label: 'Rút Bài Interactive', icon: Sparkles },
    { id: 'custom_reading', label: 'AI Đọc Bài Có Sẵn', icon: Bot },
  ];

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      backgroundColor: 'rgba(250, 248, 245, 0.95)',
      backdropFilter: 'blur(10px)',
      borderBottom: '1px solid rgba(212, 175, 55, 0.3)',
      boxShadow: '0 4px 15px rgba(20, 56, 32, 0.05)'
    }}>
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '0.8rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        {/* Brand Logo & Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', cursor: 'pointer' }} onClick={() => setActiveTab('cards')}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #1E4D2B, #2D6A4F)',
            border: '2px solid #D4AF37',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(212, 175, 55, 0.4)'
          }}>
            <Sparkles size={22} color="#F4E7B2" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.4rem', color: '#143820', lineHeight: 1.1, margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              Fairy Tale Lenormand
            </h1>
            <span style={{ fontSize: '0.75rem', color: '#9A7410', fontWeight: 600, letterSpacing: '0.05em' }}>
              BY ARWEN LYNCH & LISA HUNT
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.55rem 1rem',
                  borderRadius: '10px',
                  fontSize: '0.9rem',
                  fontWeight: isActive ? 700 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  border: item.highlight ? '1px solid #D4AF37' : '1px solid transparent',
                  backgroundColor: isActive 
                    ? item.highlight ? '#D4AF37' : '#1E4D2B' 
                    : item.highlight ? '#FFFDF0' : 'transparent',
                  color: isActive 
                    ? item.highlight ? '#143820' : '#FFFFFF' 
                    : item.highlight ? '#9A7410' : '#4A5850',
                  boxShadow: isActive ? '0 4px 12px rgba(30, 77, 43, 0.2)' : 'none'
                }}
              >
                <Icon size={17} color={isActive ? (item.highlight ? '#143820' : '#F4E7B2') : (item.highlight ? '#9A7410' : 'currentColor')} />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}

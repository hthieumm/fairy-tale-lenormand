import React from 'react';
import { BookOpen, Sparkles, Compass, CheckCircle2, Feather } from 'lucide-react';
import { GUIDE_CONTENT } from '../data/cardsData';

export default function GuideView() {
  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2.5rem 1.5rem' }}>
      
      {/* Header Banner */}
      <div style={{
        textAlign: 'center',
        marginBottom: '3rem',
        paddingBottom: '2rem',
        borderBottom: '2px dashed rgba(212, 175, 55, 0.4)'
      }}>
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
          <Feather size={14} /> SÁCH HƯỚNG DẪN CHÍNH THỨC
        </div>
        <h2 style={{ fontSize: '2.8rem', color: '#143820', margin: '0.2rem 0' }}>
          Tổng Quan & Phương Pháp Đọc Bài
        </h2>
        <p style={{ fontSize: '1.1rem', color: '#4A5850', maxWidth: '700px', margin: '0.5rem auto 0 auto' }}>
          Tìm hiểu nguồn cảm hứng nghệ thuật của Lisa Hunt, lời giới thiệu từ Arwen Lynch, và những nguyên lý cơ bản tạo nên sự kỳ diệu của hệ thống Lenormand cổ tích.
        </p>
      </div>

      {/* Foreword Section */}
      <section style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '20px',
        padding: '2.5rem',
        marginBottom: '2.5rem',
        border: '1px solid rgba(212, 175, 55, 0.3)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#1E4D2B', marginBottom: '1rem' }}>
          <Sparkles size={24} color="#D4AF37" />
          <h3 style={{ fontSize: '1.8rem', margin: 0 }}>Lời Nói Đầu (Foreword)</h3>
        </div>
        
        <div style={{ fontSize: '0.9rem', color: '#9A7410', fontWeight: 700, marginBottom: '1.2rem' }}>
          Bởi: {GUIDE_CONTENT.foreword.author} ({GUIDE_CONTENT.foreword.role})
        </div>

        <p style={{
          fontSize: '1rem',
          color: '#2C3E50',
          lineHeight: 1.8,
          whiteSpace: 'pre-line',
          backgroundColor: '#FAF8F5',
          padding: '1.5rem',
          borderRadius: '12px',
          borderLeft: '4px solid #1E4D2B'
        }}>
          {GUIDE_CONTENT.foreword.content}
        </p>
      </section>

      {/* Introduction Section */}
      <section style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '20px',
        padding: '2.5rem',
        marginBottom: '2.5rem',
        border: '1px solid rgba(212, 175, 55, 0.3)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#1E4D2B', marginBottom: '1rem' }}>
          <BookOpen size={24} color="#D4AF37" />
          <h3 style={{ fontSize: '1.8rem', margin: 0 }}>Lời Giới Thiệu (Introduction)</h3>
        </div>
        
        <div style={{ fontSize: '0.9rem', color: '#9A7410', fontWeight: 700, marginBottom: '1.2rem' }}>
          Bởi: {GUIDE_CONTENT.introduction.author} ({GUIDE_CONTENT.introduction.role})
        </div>

        <p style={{
          fontSize: '1rem',
          color: '#2C3E50',
          lineHeight: 1.8,
          whiteSpace: 'pre-line',
          backgroundColor: '#FAF8F5',
          padding: '1.5rem',
          borderRadius: '12px',
          borderLeft: '4px solid #D4AF37'
        }}>
          {GUIDE_CONTENT.introduction.content}
        </p>
      </section>

      {/* Lenormand vs Tarot Section */}
      <section style={{
        backgroundColor: '#1E4D2B',
        color: '#FFFFFF',
        borderRadius: '20px',
        padding: '2.5rem',
        border: '2px solid #D4AF37',
        boxShadow: '0 10px 30px rgba(20, 56, 32, 0.15)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#F4E7B2', marginBottom: '1.5rem' }}>
          <Compass size={28} color="#D4AF37" />
          <h3 style={{ fontSize: '1.9rem', margin: 0 }}>So Sánh Lenormand & Tarot Traditional</h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {GUIDE_CONTENT.lenormandVsTarot.map((item, idx) => (
            <div key={idx} style={{
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              borderRadius: '14px',
              padding: '1.2rem',
              border: '1px solid rgba(212, 175, 55, 0.3)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#F4E7B2', fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.6rem' }}>
                <CheckCircle2 size={18} color="#D4AF37" />
                {item.title}
              </div>
              <p style={{ fontSize: '0.92rem', color: '#E8F2EC', lineHeight: 1.6, margin: 0 }}>
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}

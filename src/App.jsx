import React, { useState } from 'react';
import Navbar from './components/Navbar';
import CardList from './components/CardList';
import GuideView from './components/GuideView';
import SpreadsView from './components/SpreadsView';
import InteractiveReader from './components/InteractiveReader';
import CustomCardReader from './components/CustomCardReader';
import ArtisticReadingButton from './components/ArtisticReadingButton';
import ArtisticReadingPage from './components/ArtisticReadingPage';
import { CARDS_DATA } from './data/cardsData';

export default function App() {
  const [activeTab, setActiveTab] = useState('cards');
  const [selectedSpreadForReader, setSelectedSpreadForReader] = useState('fan');

  const handleSelectSpreadForReading = (spreadId) => {
    setSelectedSpreadForReader(spreadId);
    setActiveTab('reading');
  };

  if (activeTab === 'artistic_reading') {
    return (
      <ArtisticReadingPage 
        cardsData={CARDS_DATA} 
        onBackToHome={() => setActiveTab('cards')} 
      />
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#FAF8F5' }}>
      {/* Top Navbar */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main View Area */}
      <main style={{ flex: 1 }}>
        {activeTab === 'cards' && <CardList cardsData={CARDS_DATA} />}
        {activeTab === 'guide' && <GuideView />}
        {activeTab === 'spreads' && <SpreadsView onSelectSpreadForReading={handleSelectSpreadForReading} />}
        {activeTab === 'reading' && <InteractiveReader cardsData={CARDS_DATA} initialSpreadId={selectedSpreadForReader} />}
        {activeTab === 'custom_reading' && <CustomCardReader cardsData={CARDS_DATA} />}
      </main>

      {/* Floating Bottom-Right Cosmic Button */}
      <ArtisticReadingButton onOpenArtisticPage={() => setActiveTab('artistic_reading')} />

      {/* Footer */}
      <footer style={{
        backgroundColor: '#143820',
        color: '#E8F2EC',
        borderTop: '2px solid #D4AF37',
        padding: '2.5rem 1.5rem',
        marginTop: '4rem',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.6rem', color: '#F4E7B2', margin: '0 0 0.5rem 0' }}>
            Fairy Tale Lenormand Oracle Web Application
          </h3>
          <p style={{ fontSize: '0.9rem', color: '#A0B4A8', margin: '0 0 1.2rem 0', lineHeight: 1.6 }}>
            Bộ bài sáng tạo bởi Arwen Lynch & Lisa Hunt. Phát hành bởi U.S. Games Systems, Inc.
            <br />
            Ứng dụng hỗ trợ tra cứu ý nghĩa tiếng Việt chi tiết 36 lá bài và thực hành trải bài trực tuyến.
          </p>
          <div style={{ fontSize: '0.8rem', color: '#D4AF37', fontWeight: 600 }}>
            #FTLenormand • Designed with Elegance & High Clarity
          </div>
        </div>
      </footer>
    </div>
  );
}


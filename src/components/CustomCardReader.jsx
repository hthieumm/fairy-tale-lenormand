import React, { useState, useMemo, useCallback } from 'react';
import { Sparkles, Bot, Plus, X, Search, Filter, HelpCircle, CheckCircle2, RefreshCw, BookOpen, Layers } from 'lucide-react';
import CardVisual from './CardVisual';

export default function CustomCardReader({ cardsData }) {
  // Mode selection: 'single' (1 lá), 'three' (3 lá), 'grid3x3' (9 lá ma trận)
  const [mode, setMode] = useState('three');
  const [userQuestion, setUserQuestion] = useState('');
  
  // Selected cards map: { positionIndex: cardObject }
  const [selectedCards, setSelectedCards] = useState({});

  // Card Picker Modal state
  const [activeSlotIndex, setActiveSlotIndex] = useState(null);
  const [pickerSearch, setPickerSearch] = useState('');
  const [pickerSuitFilter, setPickerSuitFilter] = useState('all');

  // AI Response state
  const [aiReading, setAiReading] = useState(null); // { quickAnswer, conclusion, detailedReading, advice }
  const [rawAiText, setRawAiText] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');

  // Mode Definitions & Matrix Layouts
  const modeConfigs = useMemo(() => ({
    single: {
      name: '1. Trải 1 Lá Bài',
      count: 1,
      layout: 'single',
      slots: [
        { title: 'Thông Điệp Trọng Tâm', desc: 'Lá bài duy nhất bạn đã bốc ngoài đời' }
      ]
    },
    three: {
      name: '2. Trải 3 Lá Bài (Ma Trận Hàng Ngang 1x3)',
      count: 3,
      layout: 'three',
      slots: [
        { title: 'Lá 1: Quá Khứ / Tâm Trí', desc: 'Nguồn gốc vấn đề & góc nhìn lý trí' },
        { title: 'Lá 2: Hiện Tại / Cảm Xúc', desc: 'Trạng thái thực tế & rung động trái tim' },
        { title: 'Lá 3: Tương Lai / Hành Động', desc: 'Xu hướng phát triển & kim chỉ nam' }
      ]
    },
    grid3x3: {
      name: '3. Trải 9 Lá Bài (Ma Trận Bàn Cờ 3x3)',
      count: 9,
      layout: 'grid3x3',
      slots: [
        { title: 'Lá 1 (Góc Trái Trên)', desc: 'Yếu tố Quá khứ / Nền tảng' },
        { title: 'Lá 2 (Hàng 1 Giữa)', desc: 'Yếu tố Hiện tại tác động' },
        { title: 'Lá 3 (Góc Phải Trên)', desc: 'Xu hướng Tương lai gần' },
        { title: 'Lá 4 (Hàng 2 Trái)', desc: 'Thử thách / Nội tâm' },
        { title: 'Lá 5 (TRUNG TÂM)', desc: 'TRỌNG TÂM CỐT LÕI VẤN ĐỀ' },
        { title: 'Lá 6 (Hàng 2 Phải)', desc: 'Cơ hội / Yếu tố bên ngoài' },
        { title: 'Lá 7 (Góc Trái Dưới)', desc: 'Nguyên nhân tiềm ẩn' },
        { title: 'Lá 8 (Hàng 3 Giữa)', desc: 'Lời khuyên hành động' },
        { title: 'Lá 9 (Góc Phải Dưới)', desc: 'Kết quả chung cuộc dài hạn' }
      ]
    }
  }), []);

  const currentConfig = modeConfigs[mode] || modeConfigs.three;

  // Handle Mode Change
  const handleModeChange = useCallback((newMode) => {
    setMode(newMode);
    setSelectedCards({});
    setAiReading(null);
    setRawAiText('');
    setAiError('');
  }, []);

  // Assign Card from Picker
  const handleSelectCardForSlot = useCallback((card) => {
    if (activeSlotIndex !== null) {
      setSelectedCards(prev => ({
        ...prev,
        [activeSlotIndex]: card
      }));
      setActiveSlotIndex(null);
      setPickerSearch('');
    }
  }, [activeSlotIndex]);

  // Remove Card from Slot
  const handleRemoveCardSlot = useCallback((slotIdx, e) => {
    e.stopPropagation();
    setSelectedCards(prev => {
      const next = { ...prev };
      delete next[slotIdx];
      return next;
    });
  }, []);

  // Clear All Selected Cards
  const handleClearAll = useCallback(() => {
    setSelectedCards({});
    setAiReading(null);
    setRawAiText('');
    setAiError('');
  }, []);

  // Memoized Cards Filtering for Picker Modal
  const filteredPickerCards = useMemo(() => {
    const searchLower = pickerSearch.trim().toLowerCase();
    return cardsData.filter(c => {
      const matchesSearch = searchLower === '' || 
        c.name.toLowerCase().includes(searchLower) ||
        c.vnName.toLowerCase().includes(searchLower) ||
        c.id.toString() === searchLower ||
        (c.fairyTale && c.fairyTale.toLowerCase().includes(searchLower));
      
      const matchesSuit = pickerSuitFilter === 'all' || c.suit === pickerSuitFilter;
      return matchesSearch && matchesSuit;
    });
  }, [cardsData, pickerSearch, pickerSuitFilter]);

  // Set of selected card IDs for instant lookup in modal
  const selectedCardIdsSet = useMemo(() => {
    const set = new Set();
    Object.values(selectedCards).forEach(c => {
      if (c && c.id) set.add(c.id);
    });
    return set;
  }, [selectedCards]);

  // AI Fortune Teller Call function (DeepSeek V4 via OmniRoute)
  const handleAskAI = async () => {
    const selectedCount = Object.keys(selectedCards).length;
    if (selectedCount === 0) {
      setAiError('Vui lòng chọn ít nhất 1 lá bài từ kho bài có sẵn!');
      return;
    }

    setIsAiLoading(true);
    setAiError('');
    setAiReading(null);
    setRawAiText('');

    // Prepare Base URL & API Key
    let baseUrl = (import.meta.env.VITE_OMNIROUTE_BASE_URL || 'http://localhost:20130/v1/chat/completions').trim();
    if (!baseUrl.endsWith('/chat/completions')) {
      baseUrl = baseUrl.replace(/\/+$/, '') + '/chat/completions';
    }

    let fetchUrl = baseUrl;
    let extraHeaders = {};
    if (baseUrl.startsWith('http://localhost:') || baseUrl.startsWith('http://127.0.0.1:')) {
      try {
        const parsed = new URL(baseUrl);
        fetchUrl = `/api-proxy${parsed.pathname}${parsed.search}`;
        extraHeaders['x-target-origin'] = parsed.origin;
      } catch (e) {}
    }

    const apiKey = import.meta.env.VITE_OMNIROUTE_API_KEY || '';
    const model = import.meta.env.VITE_OMNIROUTE_MODEL || 'oc/deepseek-v4-flash-free';

    // Construct Detailed Matrix Context
    const matrixLines = currentConfig.slots.map((slot, i) => {
      const card = selectedCards[i];
      if (!card) return `- Vị trí [${slot.title}]: (Chưa chọn lá bài)`;
      return `- Vị trí [${slot.title}]: Lá #${card.id} ${card.vnName} (${card.name}) | Từ khóa: ${card.keywords} | Bối cảnh cổ tích: ${card.fairyTale}`;
    }).join('\n');

    const promptText = `
Bạn là Thầy Bói Chiêm Tinh Cổ Tích (Fairy Tale Lenormand Oracle Reader) thông thái.
Người hỏi đã bốc bài thực tế ngoài đời và đưa ma trận bài lên ứng dụng để nhờ bạn đọc giúp.

BỐI CẢNH VÀ CÂU HỎI TRỌNG TÂM CỦA NGƯỜI DÙNG:
"${userQuestion || 'Xin lời phán truyền tổng quan cho hoàn cảnh hiện tại'}"

Dạng ma trận bốc bài: "${currentConfig.name}"

Ma trận các lá bài bốc được:
${matrixLines}

YÊU CẦU NGUYÊN TẮC BẮT BUỘC:
1. BÁM SÁT HOÀN TOÀN VÀO BỐI CẢNH CÂU HỎI TRÊN: Mọi lời phán, phân tích lá bài, kết luận và lời khuyên PHẢI BÁM SÁT TRỰC TIẾP VÀO CÂU HỎI/HOÀN CẢNH CỦA NGƯỜI DÙNG. Không giải thích lý thuyết lá bài chung chung, mà phải kết nối ý nghĩa lá bài xoáy sâu vào đúng thắc mắc của người hỏi.
2. CHÍNH XÁC TUYỆT ĐỐI - KHÔNG TÔ HỒNG / KHÔNG NÓI QUÁ: Hãy nhận định trung thực 100% dựa đúng theo năng lượng của quẻ bài. Nếu quẻ xấu/thách thức thì nói rõ xấu/thách thức và nguy cơ; nếu tốt thì nói rõ thuận lợi. Tuyệt đối KHÔNG tô hồng, KHÔNG nịnh nọt xoa dịu giả tạo, KHÔNG nói quá hay phóng đại kết quả.
3. ĐỊNH DẠNG CÂU TRẢ LỜI CỤ THỂ CHIA THÀNH 4 PHẦN (viết súc tích, ngắn gọn, dễ hiểu, dứt khoát, không dài dòng lê thê):

[TRẢ LỜI NHANH]
(Trả lời trực diện vào bối cảnh câu hỏi trong 1-2 câu ngắn gọn, dễ hiểu nhất)

[KẾT LUẬN]
(Kết luận khẳng định trung thực ngắn gọn về hướng đi hoặc kết quả dựa đúng theo câu hỏi)

[LUẬN GIẢI CHI TIẾT]
(Phân tích ngắn gọn từng lá bài theo đúng ma trận vị trí và xoáy sâu giải đáp cho bối cảnh câu hỏi)

[LỜI KHUYÊN]
(Đưa ra 2-3 lời khuyên hành động thực tế, dứt khoát để giải quyết thắc mắc)
`;

    try {
      const response = await fetch(fetchUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': window.location.href,
          'X-Title': 'FairyTaleLenormand',
          ...extraHeaders
        },
        body: JSON.stringify({
          model: model,
          messages: [
            {
              role: 'system',
              content: 'Bạn là Thầy Bói Chiêm Tinh Cổ Tích. BẮT BUỘC phải bám sát bối cảnh câu hỏi người dùng và trả lời CHÍNH XÁC TUYỆT ĐỐI, THỰC TẾ, KHÔNG TÔ HỒNG, KHÔNG NÓI QUÁ dù quẻ bài tốt hay xấu. Trả lời súc tích, ngắn gọn, dễ hiểu, dứt khoát chia đúng 4 phần [TRẢ LỜI NHANH], [KẾT LUẬN], [LUẬN GIẢI CHI TIẾT], [LỜI KHUYÊN].'
            },
            {
              role: 'user',
              content: promptText
            }
          ],
          stream: false
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`HTTP Error ${response.status}: ${errText}`);
      }

      const raw = await response.text();
      let textContent = '';

      try {
        const jsonRes = JSON.parse(raw);
        if (jsonRes.choices && jsonRes.choices[0]) {
          textContent = jsonRes.choices[0].message?.content || jsonRes.choices[0].delta?.content || '';
        }
      } catch (e) {
        const lines = raw.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const str = line.slice(6).trim();
            if (str === '[DONE]') continue;
            try {
              const chunk = JSON.parse(str);
              textContent += chunk.choices?.[0]?.delta?.content || '';
            } catch (err) {}
          }
        }
      }

      if (!textContent) textContent = raw.replace(/data: /g, '').trim();

      setRawAiText(textContent);
      setAiReading(parseAiSections(textContent));

    } catch (err) {
      console.error('Custom Card AI Error:', err);
      setAiError(`Không thể kết nối AI (${err.message}). Đảm bảo OmniRoute đang chạy tại ${baseUrl}.`);
    } finally {
      setIsAiLoading(false);
    }
  };

  // Parse AI 4 Sections
  const parseAiSections = (text) => {
    const quickAnswerMatch = text.match(/\[TRẢ LỜI NHANH\]([\s\S]*?)(?=\[KẾT LUẬN\]|\[LUẬN GIẢI CHI TIẾT\]|\[LỜI KHUYÊN\]|$)/i);
    const conclusionMatch = text.match(/\[KẾT LUẬN\]([\s\S]*?)(?=\[LUẬN GIẢI CHI TIẾT\]|\[LỜI KHUYÊN\]|$)/i);
    const detailedMatch = text.match(/\[LUẬN GIẢI CHI TIẾT\]([\s\S]*?)(?=\[LỜI KHUYÊN\]|$)/i);
    const adviceMatch = text.match(/\[LỜI KHUYÊN\]([\s\S]*?)$/i);

    return {
      quickAnswer: quickAnswerMatch ? quickAnswerMatch[1].trim() : '',
      conclusion: conclusionMatch ? conclusionMatch[1].trim() : '',
      detailedReading: detailedMatch ? detailedMatch[1].trim() : '',
      advice: adviceMatch ? adviceMatch[1].trim() : ''
    };
  };

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '2rem 1.5rem' }}>

      {/* Top Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #1E4D2B 0%, #143820 100%)',
        borderRadius: '20px',
        padding: '2.2rem 2rem',
        color: '#FFFFFF',
        marginBottom: '2rem',
        border: '2px solid #D4AF37',
        boxShadow: '0 12px 35px rgba(20, 56, 32, 0.2)',
        textAlign: 'center'
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          backgroundColor: 'rgba(212, 175, 55, 0.2)',
          color: '#F4E7B2',
          padding: '0.35rem 1rem',
          borderRadius: '20px',
          fontSize: '0.85rem',
          fontWeight: 700,
          letterSpacing: '0.05em',
          marginBottom: '0.8rem',
          border: '1px solid rgba(212, 175, 55, 0.4)'
        }}>
          <Sparkles size={16} /> TÍNH NĂNG AI ĐỌC BÀI BỐC THỰC TẾ
        </div>
        <h1 style={{ fontSize: '2.5rem', margin: '0 0 0.6rem 0', color: '#F4E7B2', fontFamily: 'Cormorant Garamond, serif' }}>
          Tự Chọn Bài Đã Bốc Outside & Nhận Lời Giải AI
        </h1>
        <p style={{ fontSize: '1.05rem', color: '#E8F2EC', maxWidth: '780px', margin: '0 auto', lineHeight: 1.6 }}>
          Bạn đã bốc bài thực tế ở ngoài? Hãy chọn đúng lá bài vào ma trận <strong>1 lá, 3 lá hoặc 9 lá (3x3)</strong> bên dưới. AI DeepSeek sẽ đưa ra lời phán ngắn gọn, súc tích gồm: <strong>Trả lời nhanh, Kết luận, Luận giải & Lời khuyên</strong>.
        </p>
      </div>

      {/* Mode Selector & Question Box */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '16px',
        padding: '1.8rem',
        marginBottom: '2.5rem',
        border: '1px solid rgba(212, 175, 55, 0.35)',
        boxShadow: '0 6px 25px rgba(0,0,0,0.04)',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))',
        gap: '1.5rem',
        alignItems: 'end'
      }}>
        {/* Choose Mode */}
        <div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem', fontWeight: 700, color: '#1E4D2B', marginBottom: '0.5rem' }}>
            <Layers size={18} color="#D4AF37" /> Chọn Dạng Ma Trận Bốc Bài:
          </label>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {[
              { id: 'single', label: '🔮 1 Lá Bài' },
              { id: 'three', label: '⏳ 3 Lá (Ma Trận 1x3)' },
              { id: 'grid3x3', label: '🎯 9 Lá (Ma Trận 3x3)' }
            ].map(item => (
              <button
                key={item.id}
                onClick={() => handleModeChange(item.id)}
                style={{
                  flex: 1,
                  padding: '0.65rem 0.8rem',
                  borderRadius: '10px',
                  fontSize: '0.88rem',
                  fontWeight: mode === item.id ? 700 : 500,
                  cursor: 'pointer',
                  border: mode === item.id ? '2px solid #D4AF37' : '1px solid #E8F2EC',
                  backgroundColor: mode === item.id ? '#1E4D2B' : '#FAF8F5',
                  color: mode === item.id ? '#F4E7B2' : '#4A5850',
                  transition: 'all 0.15s ease'
                }}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Enter Question */}
        <div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem', fontWeight: 700, color: '#1E4D2B', marginBottom: '0.5rem' }}>
            <HelpCircle size={18} color="#D4AF37" /> Câu Hỏi Của Bạn:
          </label>
          <input
            type="text"
            placeholder="VD: Tôi có nên chuyển việc lúc này? Tình cảm sắp tới..."
            value={userQuestion}
            onChange={(e) => setUserQuestion(e.target.value)}
            style={{
              width: '100%',
              padding: '0.7rem 1rem',
              borderRadius: '10px',
              border: '1.5px solid #E8F2EC',
              backgroundColor: '#FAF8F5',
              fontSize: '0.95rem',
              color: '#1A231E',
              outline: 'none'
            }}
          />
        </div>

        {/* Action Button */}
        <div style={{ display: 'flex', gap: '0.8rem' }}>
          <button
            onClick={handleAskAI}
            disabled={isAiLoading}
            style={{
              flex: 1,
              padding: '0.8rem 1.2rem',
              backgroundColor: '#9A7410',
              color: '#FFFFFF',
              border: '1px solid #D4AF37',
              borderRadius: '10px',
              fontWeight: 700,
              fontSize: '1rem',
              cursor: isAiLoading ? 'wait' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              boxShadow: '0 4px 15px rgba(154, 116, 16, 0.3)'
            }}
          >
            <Bot size={20} className={isAiLoading ? 'animate-spin' : ''} />
            {isAiLoading ? 'AI Đang Giải Bài...' : '🔮 AI Giải Bài Ngay'}
          </button>

          {Object.keys(selectedCards).length > 0 && (
            <button
              onClick={handleClearAll}
              title="Xóa hết bài đã chọn"
              style={{
                padding: '0.8rem 1rem',
                backgroundColor: '#FFFDF0',
                color: '#C0392B',
                border: '1px solid #C0392B',
                borderRadius: '10px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Đặt Lại
            </button>
          )}
        </div>
      </div>

      {/* MATRIX DISPLAY AREA */}
      <div style={{ marginBottom: '3rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
          <h2 style={{ fontSize: '1.8rem', color: '#143820', margin: 0, fontFamily: 'Cormorant Garamond, serif' }}>
            Ma Trận Bài Đã Chọn: <span style={{ color: '#9A7410' }}>{currentConfig.name}</span>
          </h2>
          <span style={{ fontSize: '0.9rem', color: '#6A7870', fontWeight: 600 }}>
            Đã chọn: {Object.keys(selectedCards).length} / {currentConfig.count} lá
          </span>
        </div>

        {/* 1 CARD LAYOUT */}
        {currentConfig.layout === 'single' && (
          <div style={{ maxWidth: '280px', margin: '0 auto' }}>
            <SlotCardBox
              slotIndex={0}
              slotInfo={currentConfig.slots[0]}
              card={selectedCards[0]}
              onOpenPicker={() => setActiveSlotIndex(0)}
              onRemove={(e) => handleRemoveCardSlot(0, e)}
            />
          </div>
        )}

        {/* 3 CARDS LAYOUT (1x3 HORIZONTAL MATRIX) */}
        {currentConfig.layout === 'three' && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '1.5rem'
          }}>
            {currentConfig.slots.map((slot, idx) => (
              <SlotCardBox
                key={idx}
                slotIndex={idx}
                slotInfo={slot}
                card={selectedCards[idx]}
                onOpenPicker={() => setActiveSlotIndex(idx)}
                onRemove={(e) => handleRemoveCardSlot(idx, e)}
              />
            ))}
          </div>
        )}

        {/* 9 CARDS LAYOUT (3x3 GRID MATRIX) */}
        {currentConfig.layout === 'grid3x3' && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '1.5rem'
          }}>
            {currentConfig.slots.map((slot, idx) => {
              const isCenter = idx === 4; // Slot 5 is Center Core
              return (
                <SlotCardBox
                  key={idx}
                  slotIndex={idx}
                  slotInfo={slot}
                  card={selectedCards[idx]}
                  isCenter={isCenter}
                  onOpenPicker={() => setActiveSlotIndex(idx)}
                  onRemove={(e) => handleRemoveCardSlot(idx, e)}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* ERROR MESSAGE DISPLAY */}
      {aiError && (
        <div style={{
          backgroundColor: '#FDEDEC',
          border: '2px solid #C0392B',
          color: '#C0392B',
          borderRadius: '12px',
          padding: '1.2rem 1.5rem',
          marginBottom: '2rem',
          fontSize: '0.95rem',
          fontWeight: 600
        }}>
          ⚠️ {aiError}
        </div>
      )}

      {/* STRUCTURED AI RESPONSE DISPLAY (4 SECTIONS) */}
      {(aiReading || isAiLoading) && (
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '20px',
          padding: '2.2rem',
          marginBottom: '3rem',
          border: '2px solid #D4AF37',
          boxShadow: '0 12px 40px rgba(20, 56, 32, 0.1)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            borderBottom: '2px dashed #D4AF37',
            paddingBottom: '1rem',
            marginBottom: '1.8rem'
          }}>
            <Bot size={28} color="#9A7410" />
            <h3 style={{ fontSize: '2rem', color: '#143820', margin: 0, fontFamily: 'Cormorant Garamond, serif' }}>
              Lời Phán & Giải Bài Từ AI DeepSeek
            </h3>
          </div>

          {isAiLoading && (
            <div style={{ textAlign: 'center', padding: '3rem 0', color: '#1E4D2B' }}>
              <RefreshCw size={36} className="animate-spin" style={{ margin: '0 auto 1rem auto' }} />
              <p style={{ fontSize: '1.1rem', fontWeight: 600, margin: 0 }}>
                AI đang đọc ma trận các lá bài bạn chọn và tổng hợp 4 phần phán truyền... Vui lòng đợi trong giây lát.
              </p>
            </div>
          )}

          {aiReading && !isAiLoading && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              {/* SECTION 1: TRẢ LỜI NHANH */}
              {aiReading.quickAnswer && (
                <div style={{
                  backgroundColor: '#FFFDF0',
                  border: '1.5px solid #D4AF37',
                  borderRadius: '12px',
                  padding: '1.2rem 1.5rem'
                }}>
                  <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#9A7410', textTransform: 'uppercase', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    ⚡ TRẢ LỜI NHANH:
                  </div>
                  <div style={{ fontSize: '1.05rem', color: '#143820', fontWeight: 700, lineHeight: 1.6 }}>
                    {aiReading.quickAnswer}
                  </div>
                </div>
              )}

              {/* SECTION 2: KẾT LUẬN */}
              {aiReading.conclusion && (
                <div style={{
                  backgroundColor: '#E8F2EC',
                  borderLeft: '5px solid #1E4D2B',
                  borderRadius: '10px',
                  padding: '1.1rem 1.4rem'
                }}>
                  <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#1E4D2B', textTransform: 'uppercase', marginBottom: '0.3rem' }}>
                    🎯 KẾT LUẬN:
                  </div>
                  <div style={{ fontSize: '0.98rem', color: '#1A231E', lineHeight: 1.6, fontWeight: 600 }}>
                    {aiReading.conclusion}
                  </div>
                </div>
              )}

              {/* SECTION 3: LUẬN GIẢI CHI TIẾT */}
              {aiReading.detailedReading && (
                <div style={{
                  backgroundColor: '#FAF8F5',
                  borderRadius: '12px',
                  padding: '1.4rem 1.6rem',
                  border: '1px solid #E8F2EC'
                }}>
                  <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#143820', textTransform: 'uppercase', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    📖 LUẬN GIẢI CHI TIẾT THEO MA TRẬN BÀI:
                  </div>
                  <div style={{ fontSize: '0.95rem', color: '#2C3E50', lineHeight: 1.75, whiteSpace: 'pre-line' }}>
                    {aiReading.detailedReading}
                  </div>
                </div>
              )}

              {/* SECTION 4: LỜI KHUYÊN */}
              {aiReading.advice && (
                <div style={{
                  backgroundColor: '#FFFDF9',
                  border: '1.5px solid #9A7410',
                  borderRadius: '12px',
                  padding: '1.3rem 1.5rem'
                }}>
                  <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#9A7410', textTransform: 'uppercase', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    💡 LỜI KHUYÊN HÀNH ĐỘNG:
                  </div>
                  <div style={{ fontSize: '0.95rem', color: '#1A231E', lineHeight: 1.7, fontWeight: 600, whiteSpace: 'pre-line' }}>
                    {aiReading.advice}
                  </div>
                </div>
              )}

              {/* FALLBACK IF UNSTRUCTURED */}
              {!aiReading.quickAnswer && !aiReading.conclusion && rawAiText && (
                <div style={{ fontSize: '0.95rem', color: '#1A231E', lineHeight: 1.75, whiteSpace: 'pre-line' }}>
                  {rawAiText}
                </div>
              )}

            </div>
          )}
        </div>
      )}

      {/* FAST OPTIMIZED CARD PICKER MODAL POPUP */}
      {activeSlotIndex !== null && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 1000,
          backgroundColor: 'rgba(0,0,0,0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1.5rem'
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '20px',
            maxWidth: '1000px',
            width: '100%',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            border: '2px solid #D4AF37',
            boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
            overflow: 'hidden'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '1.2rem 1.8rem',
              backgroundColor: '#1E4D2B',
              color: '#F4E7B2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '2px solid #D4AF37'
            }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.4rem', fontFamily: 'Cormorant Garamond, serif' }}>
                  Chọn Lá Bài Cho Vị Trí #{activeSlotIndex + 1}: {currentConfig.slots[activeSlotIndex]?.title}
                </h3>
                <span style={{ fontSize: '0.8rem', color: '#E8F2EC' }}>
                  {currentConfig.slots[activeSlotIndex]?.desc}
                </span>
              </div>
              <button
                onClick={() => setActiveSlotIndex(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#F4E7B2',
                  cursor: 'pointer',
                  padding: '0.4rem'
                }}
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Search & Filters */}
            <div style={{
              padding: '1rem 1.8rem',
              backgroundColor: '#FAF8F5',
              borderBottom: '1px solid #E8F2EC',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '1rem',
              alignItems: 'center'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                backgroundColor: '#FFFFFF',
                border: '1px solid #D4AF37',
                borderRadius: '8px',
                padding: '0.5rem 0.8rem',
                flex: '1 1 250px'
              }}>
                <Search size={18} color="#9A7410" />
                <input
                  type="text"
                  placeholder="Tìm lá bài (VD: Rider, Con rắn, #7, 9♥)..."
                  value={pickerSearch}
                  onChange={(e) => setPickerSearch(e.target.value)}
                  style={{ border: 'none', outline: 'none', width: '100%', fontSize: '0.9rem' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                {[
                  { id: 'all', label: 'Tất cả 42 lá' },
                  { id: 'hearts', label: '♥ Cơ' },
                  { id: 'diamonds', label: '♦ Rô' },
                  { id: 'clubs', label: '♣ Chuồn' },
                  { id: 'spades', label: '♠ Bích' }
                ].map(suit => (
                  <button
                    key={suit.id}
                    onClick={() => setPickerSuitFilter(suit.id)}
                    style={{
                      padding: '0.4rem 0.7rem',
                      borderRadius: '6px',
                      fontSize: '0.8rem',
                      fontWeight: pickerSuitFilter === suit.id ? 700 : 500,
                      cursor: 'pointer',
                      border: pickerSuitFilter === suit.id ? '1px solid #D4AF37' : '1px solid #CCC',
                      backgroundColor: pickerSuitFilter === suit.id ? '#1E4D2B' : '#FFFFFF',
                      color: pickerSuitFilter === suit.id ? '#F4E7B2' : '#4A5850'
                    }}
                  >
                    {suit.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Modal Cards Grid (Optimized with Memoized Card Items) */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '1.5rem 1.8rem',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
              gap: '1rem',
              willChange: 'scroll-position'
            }}>
              {filteredPickerCards.map(card => (
                <PickerCardItem
                  key={card.id}
                  card={card}
                  isSelectedInOtherSlot={selectedCardIdsSet.has(card.id)}
                  onSelect={handleSelectCardForSlot}
                />
              ))}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

// Memoized Subcomponent: Slot Card Box in Matrix
const SlotCardBox = React.memo(function SlotCardBox({ slotIndex, slotInfo, card, isCenter, onOpenPicker, onRemove }) {
  return (
    <div style={{
      backgroundColor: isCenter ? '#FFFDF0' : '#FFFFFF',
      borderRadius: '14px',
      padding: '1.2rem',
      border: isCenter ? '2px solid #D4AF37' : '1px solid #E8F2EC',
      boxShadow: isCenter ? '0 8px 25px rgba(212, 175, 55, 0.2)' : '0 2px 8px rgba(0,0,0,0.03)',
      textAlign: 'center',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      position: 'relative',
      transform: 'translateZ(0)'
    }}>
      {/* Slot Title Header */}
      <div>
        <div style={{
          fontSize: '0.8rem',
          fontWeight: 800,
          color: isCenter ? '#9A7410' : '#1E4D2B',
          marginBottom: '0.2rem'
        }}>
          {slotInfo.title}
        </div>
        <div style={{ fontSize: '0.72rem', color: '#6A7870', marginBottom: '0.8rem' }}>
          {slotInfo.desc}
        </div>
      </div>

      {/* Card Visual / Empty Picker Trigger */}
      <div 
        onClick={onOpenPicker}
        style={{ cursor: 'pointer', margin: '0 auto', width: '100%', maxWidth: '180px', position: 'relative' }}
      >
        {card ? (
          <div style={{ position: 'relative' }}>
            <CardVisual card={card} />
            <button
              onClick={onRemove}
              title="Xóa lá bài này"
              style={{
                position: 'absolute',
                top: '-8px',
                right: '-8px',
                backgroundColor: '#C0392B',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '50%',
                width: '24px',
                height: '24px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
              }}
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <div style={{
            aspectRatio: '2/3',
            borderRadius: '12px',
            border: '2px dashed #D4AF37',
            backgroundColor: '#FAF8F5',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            color: '#9A7410',
            transition: 'all 0.15s ease'
          }}>
            <Plus size={28} style={{ marginBottom: '0.4rem' }} />
            <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>Bấm Chọn Lá Bài</span>
          </div>
        )}
      </div>

      {/* Slot Card Name Footer */}
      <div style={{ marginTop: '0.8rem' }}>
        {card ? (
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1E4D2B' }}>
              #{card.id}. {card.vnName}
            </div>
            <button
              onClick={onOpenPicker}
              style={{
                marginTop: '0.3rem',
                fontSize: '0.75rem',
                padding: '0.2rem 0.6rem',
                backgroundColor: '#E8F2EC',
                color: '#1E4D2B',
                border: '1px solid #1E4D2B',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              Đổi Lá Bài
            </button>
          </div>
        ) : (
          <span style={{ fontSize: '0.78rem', color: '#9E9E9E', fontStyle: 'italic' }}>
            (Chưa chọn bài)
          </span>
        )}
      </div>

    </div>
  );
});

// Memoized Subcomponent: Card Item in Picker Modal
const PickerCardItem = React.memo(function PickerCardItem({ card, isSelectedInOtherSlot, onSelect }) {
  return (
    <div
      onClick={() => onSelect(card)}
      style={{
        cursor: 'pointer',
        borderRadius: '10px',
        overflow: 'hidden',
        border: isSelectedInOtherSlot ? '2px solid #9A7410' : '1px solid #E8F2EC',
        opacity: isSelectedInOtherSlot ? 0.7 : 1,
        transition: 'transform 0.12s ease',
        textAlign: 'center',
        transform: 'translateZ(0)'
      }}
      onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.04)'}
      onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
    >
      <CardVisual card={card} />
      <div style={{
        padding: '0.4rem',
        fontSize: '0.75rem',
        fontWeight: 700,
        color: '#1E4D2B',
        backgroundColor: '#FFFFFF',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
      }}>
        #{card.id}. {card.vnName}
      </div>
    </div>
  );
});

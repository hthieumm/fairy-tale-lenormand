import React, { useState } from 'react';
import { Sparkles, RefreshCw, Eye, BookOpen, Layers, Heart, Award, HelpCircle, CheckCircle2, XCircle, Bot, Settings, Send, MessageSquare } from 'lucide-react';
import CardVisual from './CardVisual';
import CardDetailModal from './CardDetailModal';
import confetti from 'canvas-confetti';

export default function InteractiveReader({ cardsData, initialSpreadId = 'fan' }) {
  const [spreadType, setSpreadType] = useState(initialSpreadId);
  const [userQuestion, setUserQuestion] = useState('');
  const [drawnCards, setDrawnCards] = useState([]);
  const [flippedMap, setFlippedMap] = useState({});
  const [isShuffling, setIsShuffling] = useState(false);
  const [selectedCardModal, setSelectedCardModal] = useState(null);

  // AI Configuration State (Loaded from hidden .env.local file)
  const [customApiKey, setCustomApiKey] = useState('');
  const [aiModel, setAiModel] = useState(import.meta.env.VITE_OMNIROUTE_MODEL || 'oc/deepseek-v4-flash-free');
  const [aiBaseUrl, setAiBaseUrl] = useState(import.meta.env.VITE_OMNIROUTE_BASE_URL || 'http://localhost:20130/v1/chat/completions');
  const [showAiSettings, setShowAiSettings] = useState(false);

  // AI Response State
  const [aiReading, setAiReading] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');

  // Positive card IDs for Yes/No logic
  const positiveCardIds = [1, 2, 3, 4, 5, 9, 13, 15, 16, 17, 18, 20, 24, 25, 28, 29, 31, 32, 33, 34, 35, 37, 38, 39, 40, 41, 42];

  // Comprehensive Spread Configurations
  const spreadConfigs = {
    single: {
      name: '1. Rút 1 Lá Bài (Thông Điệp Nhanh)',
      count: 1,
      positions: [
        { title: 'Thông Điệp Trọng Tâm', desc: 'Lời phán truyền & kim chỉ nam quan trọng nhất cho bạn ngay lúc này.' }
      ]
    },
    three_past_present_future: {
      name: '2a. Trải 3 Lá (Quá Khứ - Hiện Tại - Tương Lai)',
      count: 3,
      positions: [
        { title: 'Lá 1: Quá Khứ', desc: 'Nguyên nhân, sự kiện hoặc năng lượng đã tích lũy dẫn đến tình huống hiện tại.' },
        { title: 'Lá 2: Hiện Tại', desc: 'Bản chất thực sự của hoàn cảnh hiện tại và rào cản bạn đang đối mặt.' },
        { title: 'Lá 3: Tương Lai', desc: 'Xu hướng phát triển tiếp theo và kết quả dự kiến nếu giữ nguyên hướng đi.' }
      ]
    },
    three_mind_heart_action: {
      name: '2b. Trải 3 Lá (Tâm Trí - Tình Cảm - Hành Động)',
      count: 3,
      positions: [
        { title: 'Lá 1: Tâm Trí (Mind)', desc: 'Suy nghĩ, nhận thức lý trí và góc nhìn trí tuệ về vấn đề.' },
        { title: 'Lá 2: Tình Cảm (Heart)', desc: 'Cảm xúc, mong muốn ẩn giấu từ trái tim và rung động tâm hồn.' },
        { title: 'Lá 3: Hành Động (Action)', desc: 'Cách xử lý thực tế, kim chỉ nam hành động dứt khoát.' }
      ]
    },
    grid3x3: {
      name: '3. Trải 9 Lá Bài (Bàn Cờ Ma Trận 3x3)',
      count: 9,
      layout: 'grid3x3',
      positions: [
        { title: 'Lá 1: Góc Trái Trên', desc: 'Hàng Ý thức / Cột Quá khứ: Kế hoạch hoặc niềm tin cũ hình thành vấn đề.' },
        { title: 'Lá 2: Hàng Trên Giữa', desc: 'Hàng Ý thức / Cột Hiện tại: Áp lực hoặc suy nghĩ trực tiếp đang chi phối.' },
        { title: 'Lá 3: Góc Phải Trên', desc: 'Hàng Ý thức / Cột Tương lai: Mục tiêu, kỳ vọng hoặc kết quả nhận thức sắp tới.' },
        { title: 'Lá 4: Hàng Giữa Trái', desc: 'Hàng Thực tế / Cột Quá khứ: Sự kiện thực tế đã diễn ra đưa đến hoàn cảnh này.' },
        { title: 'Lá 5: TRỌNG TÂM CỐT LÕI', desc: 'Trái tim quẻ bài: Thực trạng thực tế khách quan, hạt nhân xoay quanh người hỏi.' },
        { title: 'Lá 6: Hàng Giữa Phải', desc: 'Hàng Thực tế / Cột Tương lai: Diễn biến hành động và sự việc tiếp nối trước mắt.' },
        { title: 'Lá 7: Góc Trái Dưới', desc: 'Hàng Tiềm thức / Cột Quá khứ: Gốc rễ chôn sâu, thói quen hoặc nỗi sợ vô thức.' },
        { title: 'Lá 8: Hàng Dưới Giữa', desc: 'Hàng Tiềm thức / Cột Hiện tại: Nền tảng tâm lý ngầm đang nâng đỡ hoặc kìm hãm.' },
        { title: 'Lá 9: Góc Phải Dưới', desc: 'Hàng Tiềm thức / Cột Tương lai: Kết quả sâu sắc, bài học và đích đến chung cuộc.' }
      ]
    },
    grand_tableau: {
      name: '4. Trải Grand Tableau (Bàn Cờ Lớn 36 Lá)',
      count: 36,
      layout: 'grand_tableau',
      positions: Array.from({ length: 36 }, (_, i) => ({
        title: `Ô Bài #${i + 1}`,
        desc: `Vị trí thứ #${i + 1} trên bàn cờ lớn Grand Tableau.`
      }))
    },
    yes_no: {
      name: '5. Trải Yes / No (Có Hoặc Không)',
      count: 1,
      isYesNo: true,
      positions: [
        { title: 'Lá Phán Truyền Có / Không', desc: 'Xác định kết quả Có (Yes) hay Không (No) dựa trên năng lượng lá bài.' }
      ]
    },
    fan: {
      name: '6. Trải Bài Chiếc Quạt (Fan Spread - 4 lá)',
      count: 4,
      positions: [
        { title: 'Lá 1: Đáy Quạt (Trọng Tâm)', desc: 'Vấn đề cốt lõi, trung tâm của quẻ bài.' },
        { title: 'Lá 2: Nếp Quạt 1 (Hoàn Cảnh)', desc: 'Yếu tố môi trường, con người xung quanh đang ảnh hưởng.' },
        { title: 'Lá 3: Nếp Quạt 2 (Thử Thách)', desc: 'Thử thách cần vượt qua hoặc động lực ẩn giấu.' },
        { title: 'Lá 4: Nếp Quạt 3 (Lời Khuyên)', desc: 'Kim chỉ nam hành động và xu hướng kết quả.' }
      ]
    },
    crossroads: {
      name: '7. Trải Bài Ngã Tư Đường (12 lá)',
      count: 12,
      positions: Array.from({ length: 12 }, (_, i) => {
        if (i < 4) return { title: `Cụm 1 - Lựa Chọn A (Lá #${i + 1})`, desc: 'Phân tích con đường A.' };
        if (i < 8) return { title: `Cụm 2 - Lựa Chọn B (Lá #${i - 3})`, desc: 'Phân tích con đường B.' };
        return { title: `Cụm 3 - Hiện Tại Của Bạn (Lá #${i - 7})`, desc: 'Trạng thái hiện tại tại ngã tư.' };
      })
    },
    tower: {
      name: '8. Trải Bài Tòa Tháp (16 lá)',
      count: 16,
      positions: Array.from({ length: 16 }, (_, i) => {
        const floor = Math.floor(i / 4) + 1;
        const sub = (i % 4) + 1;
        const floorTitles = [
          'Tầng 1 (Đáy): Lý do mắc kẹt',
          'Tầng 2: Yếu tố níu chân',
          'Tầng 3: Bài học quan trọng',
          'Tầng 4 (Đỉnh): Chìa khóa giải thoát'
        ];
        return { title: `${floorTitles[floor - 1]} - #${sub}`, desc: 'Luận giải theo tầng tòa tháp.' };
      })
    },
    'happily-ever-after': {
      name: '9. Trải Bài Kết Thúc Có Hậu (12 lá)',
      count: 12,
      positions: Array.from({ length: 12 }, (_, i) => {
        if (i < 4) return { title: `Cụm 1: Bản Thân Bạn (Lá #${i + 1})`, desc: 'Giá trị bạn mang vào mối quan hệ.' };
        if (i < 8) return { title: `Cụm 2: Đối Phương / Tri Kỷ (Lá #${i - 3})`, desc: 'Điều đối phương mang lại cho bạn.' };
        return { title: `Cụm 3: Hạnh Phúc Viên Mãn (Lá #${i - 7})`, desc: 'Nơi chốn thăng hoa hạnh phúc.' };
      })
    }
  };

  const currentConfig = spreadConfigs[spreadType] || spreadConfigs.single;

  // Handle draw cards
  const handleDraw = () => {
    setIsShuffling(true);
    setDrawnCards([]);
    setFlippedMap({});
    setAiReading('');
    setAiError('');

    setTimeout(() => {
      const shuffled = [...cardsData].sort(() => Math.random() - 0.5);
      const selected = shuffled.slice(0, currentConfig.count);

      setDrawnCards(selected);
      setIsShuffling(false);

      setFlippedMap({ 0: true });

      try {
        confetti({
          particleCount: 70,
          spread: 80,
          origin: { y: 0.6 }
        });
      } catch (e) {}
    }, 1000);
  };

  const toggleFlip = (index) => {
    setFlippedMap((prev) => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const flipAll = () => {
    const nextMap = {};
    drawnCards.forEach((_, idx) => {
      nextMap[idx] = true;
    });
    setFlippedMap(nextMap);
  };

  // Helper for Card Pair Combinations
  const getCombinationInsight = (cardA, cardB) => {
    if (!cardA || !cardB) return '';
    return `Sự kết hợp giữa [${cardA.name}] (${cardA.keywords.split(',')[0]}) và [${cardB.name}] (${cardB.keywords.split(',')[0]}) cho thấy: ${cardA.keywords.split(',')[0]} tác động biến đổi trực tiếp lên ${cardB.keywords.split(',')[0].toLowerCase()}.`;
  };

  // Yes/No result calculation
  const firstCard = drawnCards[0];
  const isPositive = firstCard ? positiveCardIds.includes(firstCard.id) : false;

  // AI Fortune Teller Call function (OmniRoute DeepSeek)
  const handleAskAI = async () => {
    if (!drawnCards.length) return;
    setIsAiLoading(true);
    setAiError('');
    setAiReading('');

    // Ensure all cards flipped for full AI context
    flipAll();

    // Auto-normalize Base URL & proxy local endpoints to avoid CORS preflight errors
    let targetUrl = aiBaseUrl.trim();
    if (!targetUrl.endsWith('/chat/completions')) {
      targetUrl = targetUrl.replace(/\/+$/, '') + '/chat/completions';
    }

    let fetchUrl = targetUrl;
    let extraHeaders = {};
    if (targetUrl.startsWith('http://localhost:') || targetUrl.startsWith('http://127.0.0.1:')) {
      try {
        const parsed = new URL(targetUrl);
        fetchUrl = `/api-proxy${parsed.pathname}${parsed.search}`;
        extraHeaders['x-target-origin'] = parsed.origin;
      } catch (e) {}
    }

    let promptText = '';
    let systemContent = '';

    if (spreadType === 'grid3x3' && drawnCards.length === 9) {
      const c = drawnCards;
      const matrixMap = `
MA TRẬN BÀN CỜ 3X3:
| [Lá 1: #${c[0].id} ${c[0].name}] | [Lá 2: #${c[1].id} ${c[1].name}] | [Lá 3: #${c[2].id} ${c[2].name}] |
| [Lá 4: #${c[3].id} ${c[3].name}] | [Lá 5 (TÂM): #${c[4].id} ${c[4].name}] | [Lá 6: #${c[5].id} ${c[5].name}] |
| [Lá 7: #${c[6].id} ${c[6].name}] | [Lá 8: #${c[7].id} ${c[7].name}] | [Lá 9: #${c[8].id} ${c[8].name}] |

DANH SÁCH TỪNG LÁ BÀI TRÊN TỌA ĐỘ:
- Lá 1 [Góc Trái Trên]: #${c[0].id} ${c[0].name} (Từ khóa: ${c[0].keywords})
- Lá 2 [Hàng Trên Giữa]: #${c[1].id} ${c[1].name} (Từ khóa: ${c[1].keywords})
- Lá 3 [Góc Phải Trên]: #${c[2].id} ${c[2].name} (Từ khóa: ${c[2].keywords})
- Lá 4 [Hàng Giữa Trái]: #${c[3].id} ${c[3].name} (Từ khóa: ${c[3].keywords})
- Lá 5 [TRỌNG TÂM CỐT LÕI]: #${c[4].id} ${c[4].name} (Từ khóa: ${c[4].keywords})
- Lá 6 [Hàng Giữa Phải]: #${c[5].id} ${c[5].name} (Từ khóa: ${c[5].keywords})
- Lá 7 [Góc Trái Dưới]: #${c[6].id} ${c[6].name} (Từ khóa: ${c[6].keywords})
- Lá 8 [Hàng Dưới Giữa]: #${c[7].id} ${c[7].name} (Từ khóa: ${c[7].keywords})
- Lá 9 [Góc Phải Dưới]: #${c[8].id} ${c[8].name} (Từ khóa: ${c[8].keywords})

CÁC TRỤC LIÊN KẾT HÌNH HỌC MA TRẬN LENORMAND:
- TRỌNG TÂM CỐT LÕI (Trái tim quẻ bài): Lá 5 [${c[4].name}]
- BỘ KHUNG 4 GÓC (The Four Corners): Lá 1 [${c[0].name}], Lá 3 [${c[2].name}], Lá 7 [${c[6].name}], Lá 9 [${c[8].name}]
- TRỤC THỜI GIAN (3 Cột dọc):
  + Cột Quá khứ (1, 4, 7): [${c[0].name}], [${c[3].name}], [${c[6].name}]
  + Cột Hiện tại (2, 5, 8): [${c[1].name}], [${c[4].name}], [${c[7].name}]
  + Cột Tương lai (3, 6, 9): [${c[2].name}], [${c[5].name}], [${c[8].name}]
- PHÂN TẦNG NHẬN THỨC & HOÀN CẢNH (3 Hàng ngang):
  + Hàng Thượng (Ý thức / Kế hoạch / Điều lộ rõ): [${c[0].name}], [${c[1].name}], [${c[2].name}]
  + Hàng Trung (Thực tế đời sống / Diễn biến hữu hình): [${c[3].name}], [${c[4].name}], [${c[5].name}]
  + Hàng Hạ (Tiềm thức / Nền tảng ngầm / Gốc rễ): [${c[6].name}], [${c[7].name}], [${c[8].name}]
- 2 TUYẾN ĐƯỜNG CHÉO (Diagonals):
  + Tuyến Nhân Quả Dài Hạn (1 -> 5 -> 9): Từ [${c[0].name}] qua [${c[4].name}] tới [${c[8].name}]
  + Tuyến Động Lực Tiềm Lực (7 -> 5 -> 3): Từ [${c[6].name}] qua [${c[4].name}] vươn đến [${c[2].name}]
- CÁC CẶP SOI GƯƠNG ĐỐI XỨNG (Mirroring):
  + Chéo góc: [${c[0].name}] soi [${c[8].name}]; [${c[2].name}] soi [${c[6].name}]
  + Đối xứng chữ thập: [${c[3].name}] soi [${c[5].name}]; [${c[1].name}] soi [${c[7].name}]
`;

      systemContent = 'Bạn là Bậc Thầy Luận Giải Bài Lenormand Chuyên Nghiệp (Master Lenormand Reader). Bạn am hiểu tường tận cú pháp hình ảnh, ngữ pháp ghép bài và hình học ma trận 3x3 (Portrait / Mini-Grand Tableau). Phong cách phân tích của bạn: Thực tế, sắc bén, khách quan, giàu chiều sâu tâm lý và giải pháp hành động cụ thể, không bị gượng ép vào truyện cổ tích.';

      promptText = `
Người hỏi đặt câu hỏi: "${userQuestion || 'Xin luận giải tổng quan chi tiết và định hướng thực tế cho cuộc sống hiện tại'}"
Sơ đồ trải bài: Trải 9 Lá Ma Trận 3x3 (Lenormand Portrait / Mini-Grand Tableau)

${matrixMap}

Hãy đưa ra bài luận giải sâu sắc, sắc bén và mang tính định hướng thực tế cao, tuân thủ nghiêm ngặt kỹ thuật phân tích ma trận Lenormand đa tầng theo đúng cấu trúc sau:

### ⚡ TRẢ LỜI NHANH & ĐÁNH GIÁ CHUNG
- Đưa ra câu trả lời trực diện, dứt khoát 1-2 câu cho câu hỏi của người hỏi (Khả năng thành công cao hay thấp? Bản chất thật sự của tình huống lúc này là gì?).

### 1. 🎯 TRỌNG TÂM CỐT LÕI (Trái tim quẻ bài - Lá 5: ${c[4].name})
- Phân tích hạt nhân vấn đề qua Lá 5. Người hỏi đang thực sự đối diện với điều gì ở tâm điểm hiện tại?
- Trục chữ thập trực tiếp tác động vào tâm (Lá 4 -> 5 -> 6 và Lá 2 -> 5 -> 8): Sự kiện vừa qua (4) và tương lai trước mắt (6) đang kẹp lấy hiện tại ra sao? Áp lực ý nghĩ bên trên (2) và bệ đỡ tâm lý bên dưới (8) đang tác động gì vào tâm điểm này?

### 2. 🖼️ BỘ KHUNG 4 GÓC (The Four Corners: Lá 1 - 3 - 7 - 9)
- Đọc kết hợp 4 lá góc (${c[0].name}, ${c[2].name}, ${c[6].name}, ${c[8].name}) để khái quát "bức tranh bao quát" (The Frame). Toàn bộ bối cảnh cuộc sống/vấn đề đang diễn ra trong khuôn khổ hay môi trường như thế nào?

### 3. ⏳ DÒNG CHẢY THỜI GIAN (3 Cột dọc)
- **Cột Quá Khứ (1 - 4 - 7)**: Những nguyên nhân, thói quen hoặc sự kiện đã tích lũy dẫn đến tình thế này.
- **Cột Hiện Tại (2 - 5 - 8)**: Tình trạng thực tế đang diễn ra, điều người hỏi đang trực tiếp nắm giữ hoặc đối mặt.
- **Cột Tương Lai (3 - 6 - 9)**: Xu hướng diễn biến tiếp theo và kết quả dự kiến nếu tiến trình này tiếp diễn.

### 4. 🧠 PHÂN TẦNG NHẬN THỨC & HOÀN CẢNH (3 Hàng ngang)
- **Hàng Thượng - Ý thức & Kế hoạch (1 - 2 - 3)**: Những suy nghĩ, kỳ vọng, nỗi bận tâm hoặc điều lộ rõ trong tâm trí người hỏi.
- **Hàng Trung - Thực tế đời sống (4 - 5 - 6)**: Hoàn cảnh vật chất, sự kiện hữu hình và diễn biến hành động ngoài đời thực.
- **Hàng Hạ - Tiềm thức & Gốc rễ (7 - 8 - 9)**: Nỗi sợ thầm kín, động cơ vô thức hoặc nền tảng gốc rễ đang âm thầm chi phối bên dưới.

### 5. ⚡ 2 TUYẾN ĐƯỜNG CHÉO & KỸ THUẬT SOI GƯƠNG (Diagonals & Mirroring)
- **Tuyến Nhân Quả (1 -> 5 -> 9)**: Xuất phát điểm quá khứ (${c[0].name}) dẫn xuyên qua thực tại (${c[4].name}) đến đích đến kết quả (${c[8].name}).
- **Tuyến Tiềm Lực Bộc Phát (7 -> 5 -> 3)**: Động lực nội tại từ gốc rễ (${c[6].name}) bộc phát qua hiện tại (${c[4].name}) thành cơ hội/kỳ vọng tương lai (${c[2].name}).
- **Cặp Soi Gương Trọng Điểm**: Chỉ ra 1-2 mối liên kết tương phản hoặc bổ trợ đắt giá nhất giữa các cặp đối xứng (ví dụ 1 soi 9, 3 soi 7, hoặc 4 soi 6).
- **Lưu ý Lá Nhân Vật (nếu có)**: Nếu trong 9 lá xuất hiện Lá #28 (Người đàn ông) hoặc Lá #29 (Người phụ nữ), hãy phân tích khoảng cách và những lá bài nằm giữa chia cắt hoặc kết nối họ.

### 6. 🧭 KẾT LUẬN & KIM CHỈ NAM HÀNH ĐỘNG
- Đúc kết ngắn gọn thông điệp then chốt (Bottom-line insight).
- Đưa ra 2-3 lời khuyên hành động dứt khoát, thực tế giúp người hỏi nắm quyền làm chủ tình huống và đạt kết quả tối ưu.

Format bằng Markdown rõ ràng, chuyên nghiệp, ngôn từ sắc bén, thấu suốt và có sức nặng thực tế.
`;
    } else {
      const cardDetails = drawnCards.map((c, i) => {
        const pos = currentConfig.positions[i] ? currentConfig.positions[i].title : `Vị trí #${i + 1}`;
        return `- Vị trí [${pos}]: Lá #${c.id} ${c.name} (Từ khóa: ${c.keywords}) | Bối cảnh cổ tích: ${c.fairyTale} | Luận giải: ${c.summary}`;
      }).join('\n');

      systemContent = 'Bạn là Thầy Bói Chiêm Tinh Cổ Tích giàu lòng trắc ẩn và thấu thị ngôn ngữ bài Lenormand. Trả lời bằng tiếng Việt văn phong thơ mộng, huyền bí.';

      promptText = `
Bạn là Thầy Bói Chiêm Tinh Cổ Tích (Fairy Tale Oracle Reader) huyền bí, thông thái và ấm áp.
Người hỏi đặt câu hỏi: "${userQuestion || 'Xin lời phán truyền tổng quan cho cuộc sống hiện tại'}"
Sơ đồ trải bài: "${currentConfig.name}"

Các lá bài đã rút được:
${cardDetails}

Hãy đưa ra lời phán truyền sâu sắc, thơ mộng nhưng vô cùng thực tế, chi tiết cho người hỏi theo các phần:
1. 🔮 **Tổng quan năng lượng quẻ bài**: Đưa ra nhận định ngắn gọn bức tranh chung.
2. 📖 **Luận giải từng lá bài & câu chuyện cổ tích**: Kết nối thông điệp cổ tích với hoàn cảnh thực tế của người hỏi.
3. 🔗 **Sự kết hợp các lá bài (Lenormand Pairing)**: Phân tích sự đan xen giữa các lá bài đứng cạnh nhau.
4. 💡 **Lời khuyên kim chỉ nam**: Đưa ra hướng đi dứt khoát, giải pháp cụ thể giúp người hỏi thành công.
Format câu trả lời bằng Markdown đẹp mắt, văn phong huyền bí ấm áp.
`;
    }

    const effectiveApiKey = customApiKey.trim() || import.meta.env.VITE_OMNIROUTE_API_KEY || '';

    try {
      const response = await fetch(fetchUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${effectiveApiKey}`,
          'HTTP-Referer': window.location.href,
          'X-Title': 'FairyTaleLenormand',
          ...extraHeaders
        },
        body: JSON.stringify({
          model: aiModel,
          messages: [
            {
              role: 'system',
              content: systemContent
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

      const rawText = await response.text();
      let finalText = '';

      // Try parsing standard JSON or SSE stream chunks
      try {
        const data = JSON.parse(rawText);
        if (data.choices && data.choices[0]) {
          finalText = data.choices[0].message?.content || data.choices[0].delta?.content || data.choices[0].text || '';
        }
      } catch (jsonErr) {
        // SSE chunk fallback
        const lines = rawText.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const jsonStr = line.slice(6).trim();
            if (jsonStr === '[DONE]') continue;
            try {
              const chunk = JSON.parse(jsonStr);
              const delta = chunk.choices?.[0]?.delta?.content || chunk.choices?.[0]?.text || '';
              finalText += delta;
            } catch (e) {}
          }
        }
      }

      if (!finalText) {
        // Fallback: rawText
        finalText = rawText.replace(/data: /g, '').trim();
      }

      setAiReading(finalText);
    } catch (err) {
      console.error('AI Request Error:', err);
      setAiError(`Không thể kết nối API (${err.message}). Đảm bảo URL là ${targetUrl}.`);
    } finally {
      setIsAiLoading(false);
    }
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
          <Sparkles size={16} /> TRẢI BÀI INTERACTIVE FAIRYTALE LENORMAND & THẦY BÓI AI
        </div>
        <h1 style={{ fontSize: '2.5rem', margin: '0 0 0.6rem 0', color: '#F4E7B2', fontFamily: 'Cormorant Garamond, serif' }}>
          Rút Bài & Giải Mã Ô Thông Điệp Cổ Tích
        </h1>
        <p style={{ fontSize: '1.05rem', color: '#E8F2EC', maxWidth: '750px', margin: '0 auto', lineHeight: 1.6 }}>
          Hỗ trợ trọn bộ 9 phương pháp trải bài chuyên nghiệp kết hợp cùng <strong>Thầy Bói AI DeepSeek (OmniRoute)</strong> phán truyền cá nhân hóa riêng cho câu hỏi của bạn.
        </p>
      </div>

      {/* Control Panel */}
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
        {/* Select Spread */}
        <div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem', fontWeight: 700, color: '#1E4D2B', marginBottom: '0.5rem' }}>
            <Layers size={18} color="#D4AF37" /> Chọn Phương Pháp Trải Bài:
          </label>
          <select
            value={spreadType}
            onChange={(e) => setSpreadType(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem 1rem',
              borderRadius: '10px',
              border: '1.5px solid #D4AF37',
              backgroundColor: '#FAF8F5',
              fontSize: '0.95rem',
              color: '#1A231E',
              fontWeight: 600,
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="single">🔮 1. Rút 1 Lá Bài (Câu Trả Lời Nhanh)</option>
            <option value="three_past_present_future">⏳ 2a. Trải 3 Lá (Quá Khứ - Hiện Tại - Tương Lai)</option>
            <option value="three_mind_heart_action">🧠 2b. Trải 3 Lá (Tâm Trí - Tình Cảm - Hành Động)</option>
            <option value="grid3x3">🎯 3. Trải 9 Lá Bài (Bàn Cờ 3x3 Chi Tiết)</option>
            <option value="grand_tableau">👑 4. Trải Grand Tableau (Bàn Cờ Lớn 36 Lá)</option>
            <option value="yes_no">❓ 5. Trải Yes / No (Phán Truyền Có Hoặc Không)</option>
            <option value="fan">🪭 6. Trải Bài Chiếc Quạt (Fan Spread - 4 lá)</option>
            <option value="crossroads">🔀 7. Trải Bài Ngã Tư Đường (12 lá)</option>
            <option value="tower">🏰 8. Trải Bài Tòa Tháp (16 lá)</option>
            <option value="happily-ever-after">💖 9. Trải Bài Kết Thúc Có Hậu (12 lá)</option>
          </select>
        </div>

        {/* Enter Question */}
        <div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem', fontWeight: 700, color: '#1E4D2B', marginBottom: '0.5rem' }}>
            <HelpCircle size={18} color="#D4AF37" /> Câu Hỏi Của Bạn:
          </label>
          <input
            type="text"
            placeholder="VD: Tôi có nên đổi công việc lúc này không? Tình cảm sắp tới..."
            value={userQuestion}
            onChange={(e) => setUserQuestion(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem 1rem',
              borderRadius: '10px',
              border: '1.5px solid #E8F2EC',
              backgroundColor: '#FAF8F5',
              fontSize: '0.95rem',
              color: '#1A231E',
              outline: 'none'
            }}
          />
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '0.8rem' }}>
          <button
            onClick={handleDraw}
            disabled={isShuffling}
            style={{
              flex: 1,
              padding: '0.8rem 1.2rem',
              backgroundColor: '#1E4D2B',
              color: '#F4E7B2',
              border: '1px solid #D4AF37',
              borderRadius: '10px',
              fontWeight: 700,
              fontSize: '1rem',
              cursor: isShuffling ? 'wait' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              boxShadow: '0 4px 15px rgba(30, 77, 43, 0.25)',
              transition: 'all 0.2s ease'
            }}
          >
            <RefreshCw size={18} className={isShuffling ? 'animate-spin' : ''} />
            {isShuffling ? 'Đang Xóc Bài...' : 'Rút Quẻ Bài Ngay'}
          </button>

          {drawnCards.length > 0 && (
            <button
              onClick={flipAll}
              title="Lật mở tất cả lá bài"
              style={{
                padding: '0.8rem 1rem',
                backgroundColor: '#FFFDF0',
                color: '#9A7410',
                border: '1px solid #D4AF37',
                borderRadius: '10px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
            >
              <Eye size={18} /> Lật Hết
            </button>
          )}

          <button
            onClick={() => setShowAiSettings(!showAiSettings)}
            title="Cấu hình OmniRoute AI Key / Model"
            style={{
              padding: '0.8rem',
              backgroundColor: '#FAF8F5',
              color: '#1E4D2B',
              border: '1px solid #D4AF37',
              borderRadius: '10px',
              cursor: 'pointer'
            }}
          >
            <Settings size={20} />
          </button>
        </div>
      </div>

      {/* AI Config Drawer */}
      {showAiSettings && (
        <div style={{
          backgroundColor: '#FFFDF9',
          borderRadius: '14px',
          padding: '1.5rem',
          marginBottom: '2rem',
          border: '1.5px solid #D4AF37',
          boxShadow: '0 4px 15px rgba(0,0,0,0.05)'
        }}>
          <h4 style={{ margin: '0 0 1rem 0', color: '#1E4D2B', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Bot size={20} color="#D4AF37" /> Cấu Hình Thầy Bói AI (OmniRoute / OpenCode)
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#4A5850', marginBottom: '0.3rem' }}>
                Model AI:
              </label>
              <input
                type="text"
                value={aiModel}
                onChange={(e) => setAiModel(e.target.value)}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #CCC', fontSize: '0.85rem' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#4A5850', marginBottom: '0.3rem' }}>
                OmniRoute / Endpoint Base URL:
              </label>
              <input
                type="text"
                value={aiBaseUrl}
                onChange={(e) => setAiBaseUrl(e.target.value)}
                placeholder="http://localhost:20130/v1/chat/completions"
                style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #CCC', fontSize: '0.85rem' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#4A5850', marginBottom: '0.3rem' }}>
                API Key (Tùy chọn ghi đè):
              </label>
              <input
                type="password"
                value={customApiKey}
                onChange={(e) => setCustomApiKey(e.target.value)}
                placeholder="•••••••••••• (Đã bảo mật ẩn trong .env.local)"
                style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #CCC', fontSize: '0.85rem' }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Preset Questions Suggestions */}
      {!drawnCards.length && (
        <div style={{
          backgroundColor: '#FFFDF9',
          borderRadius: '14px',
          padding: '1.2rem 1.5rem',
          marginBottom: '2rem',
          border: '1px dashed #D4AF37',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: '0.8rem'
        }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1E4D2B' }}>💡 Gợi ý câu hỏi nhanh:</span>
          {[
            'Tôi có nên đầu tư vào dự án mới này không? (Trải Yes/No)',
            'Diễn biến tình cảm trong 3 tháng tới? (Trải 3 lá)',
            'Tổng quan bức tranh sự nghiệp sắp tới? (Trải 9 lá 3x3)',
            'Bài học quan trọng nhất tôi cần rút ra lúc này?'
          ].map((q, idx) => (
            <button
              key={idx}
              onClick={() => setUserQuestion(q)}
              style={{
                backgroundColor: '#E8F2EC',
                color: '#143820',
                border: '1px solid #1E4D2B',
                padding: '0.35rem 0.8rem',
                borderRadius: '20px',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Drawn Cards Display */}
      {drawnCards.length > 0 && (
        <div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.5rem',
            borderBottom: '2px solid #E8F2EC',
            paddingBottom: '0.8rem'
          }}>
            <h2 style={{ fontSize: '1.8rem', color: '#143820', margin: 0, fontFamily: 'Cormorant Garamond, serif' }}>
              Kết Quả Trải Bài: <span style={{ color: '#9A7410' }}>{currentConfig.name}</span>
            </h2>
            
            {/* ASK AI FORTUNE TELLER BUTTON */}
            <button
              onClick={handleAskAI}
              disabled={isAiLoading}
              style={{
                backgroundColor: '#9A7410',
                color: '#FFFFFF',
                border: '1px solid #D4AF37',
                padding: '0.6rem 1.2rem',
                borderRadius: '10px',
                fontWeight: 700,
                fontSize: '0.9rem',
                cursor: isAiLoading ? 'wait' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: '0 4px 15px rgba(154, 116, 16, 0.3)'
              }}
            >
              <Bot size={18} className={isAiLoading ? 'animate-spin' : ''} />
              {isAiLoading ? 'Thầy Bói AI Đang Phán...' : '🔮 Xin Lời Phán Thầy Bói AI DeepSeek'}
            </button>
          </div>

          {/* YES / NO SPECIAL RESULT BADGE */}
          {currentConfig.isYesNo && flippedMap[0] && firstCard && (
            <div style={{
              backgroundColor: isPositive ? '#E8F8F5' : '#FDEDEC',
              border: isPositive ? '2px solid #27AE60' : '2px solid #C0392B',
              borderRadius: '16px',
              padding: '1.5rem 2rem',
              marginBottom: '2rem',
              textAlign: 'center',
              boxShadow: '0 8px 25px rgba(0,0,0,0.06)'
            }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem', fontSize: '2rem', fontWeight: 900, color: isPositive ? '#27AE60' : '#C0392B', marginBottom: '0.4rem' }}>
                {isPositive ? <CheckCircle2 size={36} /> : <XCircle size={36} />}
                CÂU TRẢ LỜI: {isPositive ? 'CÓ (YES)' : 'KHÔNG (NO)'}
              </div>
              <p style={{ fontSize: '1.05rem', color: '#1A231E', margin: 0, lineHeight: 1.6 }}>
                Lá bài <strong>#{firstCard.id} {firstCard.name}</strong> mang năng lượng {isPositive ? 'tích cực / thuận lợi' : 'thử thách / tiêu cực / trung lập'}, phán truyền câu trả lời là <strong>{isPositive ? 'CÓ' : 'KHÔNG'}</strong> cho câu hỏi của bạn.
              </p>
            </div>
          )}

          {/* AI READING BOX RESULT */}
          {(aiReading || isAiLoading || aiError) && (
            <div style={{
              backgroundColor: '#143820',
              color: '#F4E7B2',
              borderRadius: '20px',
              padding: '2rem',
              marginBottom: '2.5rem',
              border: '2px solid #D4AF37',
              boxShadow: '0 12px 35px rgba(20, 56, 32, 0.25)',
              position: 'relative'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem', borderBottom: '1px dashed rgba(212, 175, 55, 0.4)', paddingBottom: '0.8rem' }}>
                <Bot size={28} color="#D4AF37" />
                <h3 style={{ fontSize: '1.8rem', margin: 0, color: '#F4E7B2', fontFamily: 'Cormorant Garamond, serif' }}>
                  Lời Phán Từ Thầy Bói AI DeepSeek ({aiModel})
                </h3>
              </div>

              {isAiLoading && (
                <div style={{ textAlign: 'center', padding: '2rem 0', color: '#E8F2EC' }}>
                  <RefreshCw size={32} className="animate-spin" style={{ margin: '0 auto 1rem auto' }} />
                  <p style={{ fontSize: '1.1rem', margin: 0 }}>
                    Thầy Bói AI đang nhìn vào các lá bài cổ tích và phán truyền cho bạn... Vui lòng chờ trong giây lát.
                  </p>
                </div>
              )}

              {aiError && (
                <div style={{ backgroundColor: 'rgba(192, 57, 43, 0.2)', border: '1px solid #C0392B', color: '#FADBD8', padding: '1rem', borderRadius: '10px', fontSize: '0.92rem', lineHeight: 1.6 }}>
                  ⚠️ {aiError}
                </div>
              )}

              {aiReading && (
                <div style={{
                  fontSize: '1rem',
                  lineHeight: 1.8,
                  color: '#FFFFFF',
                  whiteSpace: 'pre-line',
                  backgroundColor: 'rgba(0, 0, 0, 0.25)',
                  padding: '1.5rem',
                  borderRadius: '12px',
                  border: '1px solid rgba(212, 175, 55, 0.3)'
                }}>
                  {aiReading}
                </div>
              )}
            </div>
          )}

          {/* Grid vs Stack Layout Render */}
          {currentConfig.layout === 'grid3x3' ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '1.5rem',
              marginBottom: '3rem'
            }}>
              {drawnCards.map((card, idx) => {
                const isFlipped = !!flippedMap[idx];
                const posConfig = currentConfig.positions[idx];
                const isCenter = idx === 4;

                return (
                  <div
                    key={card.id + '-' + idx}
                    style={{
                      backgroundColor: isCenter ? '#FFFDF0' : '#FFFFFF',
                      borderRadius: '14px',
                      padding: '1.2rem',
                      border: isCenter ? '2px solid #D4AF37' : '1px solid #E8F2EC',
                      boxShadow: isCenter ? '0 8px 25px rgba(212, 175, 55, 0.2)' : '0 2px 8px rgba(0,0,0,0.03)',
                      textAlign: 'center'
                    }}
                  >
                    <div style={{ fontSize: '0.78rem', fontWeight: 700, color: isCenter ? '#9A7410' : '#1E4D2B', marginBottom: '0.5rem' }}>
                      {posConfig.title}
                    </div>
                    <div onClick={() => toggleFlip(idx)} style={{ cursor: 'pointer', margin: '0 auto', maxWidth: '180px' }}>
                      <CardVisual card={card} isFlipped={isFlipped} />
                    </div>
                    {isFlipped && (
                      <div style={{ marginTop: '0.6rem', textAlign: 'left', fontSize: '0.82rem', color: '#1A231E' }}>
                        <div style={{ fontWeight: 700, color: '#1E4D2B' }}>#{card.id}. {card.name}</div>
                        <div style={{ fontSize: '0.75rem', color: '#6A7870' }}>{card.keywords}</div>
                        <button
                          onClick={() => setSelectedCardModal(card)}
                          style={{
                            marginTop: '0.4rem',
                            padding: '0.25rem 0.6rem',
                            fontSize: '0.75rem',
                            backgroundColor: '#E8F2EC',
                            color: '#1E4D2B',
                            border: '1px solid #1E4D2B',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            width: '100%',
                            fontWeight: 600
                          }}
                        >
                          Xem Ô Giải Thích
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : currentConfig.layout === 'grand_tableau' ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
              gap: '1rem',
              marginBottom: '3rem'
            }}>
              {drawnCards.map((card, idx) => {
                const isFlipped = !!flippedMap[idx];
                return (
                  <div key={card.id + '-' + idx} style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#9A7410', marginBottom: '0.2rem' }}>
                      #{idx + 1}
                    </div>
                    <div onClick={() => toggleFlip(idx)} style={{ cursor: 'pointer' }}>
                      <CardVisual card={card} isFlipped={isFlipped} />
                    </div>
                    {isFlipped && (
                      <button
                        onClick={() => setSelectedCardModal(card)}
                        style={{
                          marginTop: '0.3rem',
                          padding: '0.2rem 0.4rem',
                          fontSize: '0.7rem',
                          backgroundColor: '#E8F2EC',
                          color: '#1E4D2B',
                          border: '1px solid #1E4D2B',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          width: '100%'
                        }}
                      >
                        #{card.id} {card.name}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            /* Standard Stack / List Layout */
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '2.5rem',
              marginBottom: '3rem'
            }}>
              {drawnCards.map((card, idx) => {
                const isFlipped = !!flippedMap[idx];
                const posConfig = currentConfig.positions[idx] || {
                  title: `Vị Trí #${idx + 1}`,
                  desc: 'Vị trí giải thích trong quẻ bài.'
                };

                return (
                  <div 
                    key={card.id + '-' + idx}
                    style={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '16px',
                      padding: '1.5rem',
                      border: isFlipped ? '2px solid #D4AF37' : '1px solid #E8F2EC',
                      boxShadow: isFlipped ? '0 8px 30px rgba(212, 175, 55, 0.12)' : '0 2px 10px rgba(0,0,0,0.03)',
                      display: 'grid',
                      gridTemplateColumns: 'minmax(180px, 220px) 1fr',
                      gap: '1.8rem',
                      alignItems: 'start',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    {/* Left Column: Card Image */}
                    <div style={{ textAlign: 'center' }}>
                      <div style={{
                        backgroundColor: '#1E4D2B',
                        color: '#F4E7B2',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        padding: '0.35rem 0.6rem',
                        borderRadius: '8px',
                        marginBottom: '0.8rem',
                        border: '1px solid #D4AF37'
                      }}>
                        {posConfig.title}
                      </div>

                      <div 
                        onClick={() => toggleFlip(idx)} 
                        style={{ cursor: 'pointer', margin: '0 auto', maxWidth: '200px' }}
                        title="Nhấn để lật bài"
                      >
                        <CardVisual card={card} isFlipped={isFlipped} />
                      </div>

                      <div style={{ marginTop: '0.6rem' }}>
                        {!isFlipped ? (
                          <button
                            onClick={() => toggleFlip(idx)}
                            style={{
                              padding: '0.4rem 0.9rem',
                              fontSize: '0.85rem',
                              backgroundColor: '#D4AF37',
                              color: '#143820',
                              border: 'none',
                              borderRadius: '6px',
                              fontWeight: 700,
                              cursor: 'pointer'
                            }}
                          >
                            👆 Nhấn Lật Bài
                          </button>
                        ) : (
                          <button
                            onClick={() => setSelectedCardModal(card)}
                            style={{
                              padding: '0.35rem 0.8rem',
                              fontSize: '0.8rem',
                              backgroundColor: '#E8F2EC',
                              color: '#1E4D2B',
                              border: '1px solid #1E4D2B',
                              borderRadius: '6px',
                              fontWeight: 600,
                              cursor: 'pointer'
                            }}
                          >
                            📖 Chi Tiết Truyện Cổ Tích
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Right Column: Dynamic Position Explanation Box */}
                    <div>
                      {!isFlipped ? (
                        <div style={{
                          height: '100%',
                          minHeight: '180px',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: '#FAF8F5',
                          borderRadius: '12px',
                          border: '2px dashed #D4AF37',
                          color: '#9A7410',
                          padding: '1.5rem',
                          textAlign: 'center'
                        }}>
                          <Eye size={32} style={{ marginBottom: '0.5rem', opacity: 0.7 }} />
                          <h4 style={{ margin: '0 0 0.4rem 0', fontSize: '1.1rem' }}>
                            Ô Giải Thích Vị Trí #{idx + 1} Chưa Mở
                          </h4>
                          <p style={{ fontSize: '0.88rem', color: '#6A7870', margin: 0 }}>
                            Vui lòng nhấn vào lá bài bên trái để lật mở ô giải thích chi tiết cho vị trí này.
                          </p>
                        </div>
                      ) : (
                        <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            borderBottom: '1.5px dashed #D4AF37',
                            paddingBottom: '0.8rem',
                            marginBottom: '1rem'
                          }}>
                            <div>
                              <span style={{ fontSize: '0.8rem', color: '#9A7410', fontWeight: 700, textTransform: 'uppercase' }}>
                                Ô Giải Thích Lá Bài #{card.id}
                              </span>
                              <h3 style={{ fontSize: '1.8rem', color: '#143820', margin: '0.1rem 0' }}>
                                #{card.id}. {card.name} <span style={{ fontSize: '1rem', color: '#555', fontWeight: 400 }}>({card.playingCard})</span>
                              </h3>
                            </div>

                            <div style={{
                              backgroundColor: '#FFFDF0',
                              border: '1px solid #D4AF37',
                              padding: '0.4rem 0.8rem',
                              borderRadius: '8px',
                              fontSize: '0.8rem',
                              fontWeight: 700,
                              color: '#9A7410'
                            }}>
                              {card.suit === 'hearts' ? '♥️ Chất Bích (Hearts)' : card.suit === 'diamonds' ? '♦️ Chất Rô (Diamonds)' : card.suit === 'clubs' ? '♣️ Chất Nhép (Clubs)' : '♠️ Chất Bích (Spades)'}
                            </div>
                          </div>

                          <div style={{
                            backgroundColor: '#E8F2EC',
                            color: '#1E4D2B',
                            padding: '0.5rem 0.9rem',
                            borderRadius: '8px',
                            fontSize: '0.88rem',
                            fontWeight: 700,
                            marginBottom: '1rem'
                          }}>
                            🔑 Từ khóa chính: {card.keywords}
                          </div>

                          <div style={{
                            backgroundColor: '#FFFDF0',
                            padding: '0.9rem 1.1rem',
                            borderRadius: '10px',
                            borderLeft: '4px solid #D4AF37',
                            marginBottom: '1rem'
                          }}>
                            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#9A7410', marginBottom: '0.3rem' }}>
                              📍 Ý Nghĩa Tại {posConfig.title}:
                            </div>
                            <div style={{ fontSize: '0.92rem', color: '#1A231E', lineHeight: 1.6 }}>
                              {posConfig.desc}
                            </div>
                          </div>

                          <div style={{ marginBottom: '1rem' }}>
                            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1E4D2B', marginBottom: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                              <BookOpen size={16} color="#D4AF37" /> Truyện cổ tích liên quan: <em>{card.fairyTale}</em>
                            </div>
                            <p style={{ fontSize: '0.9rem', color: '#4A5850', margin: 0, lineHeight: 1.65 }}>
                              {card.summary}
                            </p>
                          </div>

                          <div style={{
                            backgroundColor: '#FAF8F5',
                            padding: '1rem 1.2rem',
                            borderRadius: '10px',
                            border: '1px solid #E8F2EC',
                            fontSize: '0.92rem',
                            color: '#1A231E',
                            lineHeight: 1.7,
                            whiteSpace: 'pre-line'
                          }}>
                            <strong>Luận giải quẻ bài:</strong> {card.interpretation}
                          </div>

                        </div>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>
          )}

          {/* Synthesis & Combination Engine Section */}
          {Object.keys(flippedMap).length > 0 && (
            <div style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '20px',
              padding: '2rem',
              border: '2px solid #D4AF37',
              boxShadow: '0 10px 40px rgba(20, 56, 32, 0.08)',
              marginTop: '2rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.2rem' }}>
                <Sparkles size={26} color="#D4AF37" />
                <h3 style={{ fontSize: '1.8rem', color: '#143820', margin: 0, fontFamily: 'Cormorant Garamond, serif' }}>
                  Tổng Hợp Luận Giải & Kết Hợp Cụm Bài
                </h3>
              </div>

              {userQuestion && (
                <div style={{
                  backgroundColor: '#FFFDF0',
                  border: '1px solid #D4AF37',
                  padding: '0.8rem 1.2rem',
                  borderRadius: '10px',
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  color: '#9A7410',
                  marginBottom: '1.2rem'
                }}>
                  ❓ Câu hỏi của bạn: "{userQuestion}"
                </div>
              )}

              {/* Flipped Cards Sequence */}
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1E4D2B', marginBottom: '0.5rem' }}>
                  🎴 Các lá bài đã lật mở:
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
                  {drawnCards.filter((_, i) => flippedMap[i]).map((c) => (
                    <span 
                      key={c.id} 
                      style={{
                        backgroundColor: '#1E4D2B',
                        color: '#F4E7B2',
                        padding: '0.4rem 0.8rem',
                        borderRadius: '20px',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        border: '1px solid #D4AF37'
                      }}
                    >
                      #{c.id} {c.name}
                    </span>
                  ))}
                </div>
              </div>

              {/* Pairwise Combination Analysis */}
              {drawnCards.length >= 2 && Object.keys(flippedMap).length >= 2 && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1E4D2B', marginBottom: '0.6rem' }}>
                    🔗 Liên kết ghép cặp các lá bài (Lenormand Pairing):
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    {drawnCards.slice(0, Math.min(6, drawnCards.length - 1)).map((cardA, i) => {
                      const cardB = drawnCards[i + 1];
                      if (!flippedMap[i] || !flippedMap[i + 1]) return null;
                      return (
                        <div key={i} style={{
                          backgroundColor: '#FAF8F5',
                          padding: '0.8rem 1rem',
                          borderRadius: '8px',
                          border: '1px solid #E8F2EC',
                          fontSize: '0.88rem',
                          color: '#2C3E50',
                          lineHeight: 1.6
                        }}>
                          <strong style={{ color: '#9A7410' }}>#{cardA.id} {cardA.name} + #{cardB.id} {cardB.name}:</strong>{' '}
                          {getCombinationInsight(cardA, cardB)}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Overall Reading Summary & Advice */}
              <div style={{
                backgroundColor: '#E8F2EC',
                padding: '1.2rem 1.5rem',
                borderRadius: '12px',
                borderLeft: '5px solid #1E4D2B'
              }}>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: '#1E4D2B', marginBottom: '0.4rem' }}>
                  💡 Lời Khuyên & Tổng Kết Quẻ Bài:
                </div>
                <p style={{ fontSize: '0.95rem', color: '#1A231E', margin: 0, lineHeight: 1.7 }}>
                  {currentConfig.isYesNo ? (
                    `Quẻ bài Yes/No cho kết quả ${isPositive ? 'CÓ (YES)' : 'KHÔNG (NO)'}. Hãy lắng nghe trực giác và tự tin đưa ra quyết định phù hợp.`
                  ) : drawnCards.length === 1 ? (
                    `Lá bài #${drawnCards[0].id} ${drawnCards[0].name} khuyên bạn: ${drawnCards[0].summary} Hãy chú ý đến năng lượng "${drawnCards[0].keywords}" trong mọi quyết định hôm nay.`
                  ) : (
                    `Toàn bộ quẻ bài mang năng lượng chuyển hóa tích cực từ sự kết hợp của các lá bài. Hãy luôn giữ tinh thần chủ động như các nhân vật trong câu chuyện cổ tích để biến thử thách thành cơ hội thành công.`
                  )}
                </p>
              </div>

            </div>
          )}

        </div>
      )}

      {/* Card Detail Modal Popup */}
      {selectedCardModal && (
        <CardDetailModal
          card={selectedCardModal}
          onClose={() => setSelectedCardModal(null)}
        />
      )}

    </div>
  );
}

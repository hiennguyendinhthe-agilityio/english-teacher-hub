/**
 * Ms Van's English Class - Smart NLP & Intent Engine (Frontend & Unit Testable)
 * 0$ Cost, 100% Uptime, Zero Rate Limit, Instant Response Time
 */

export function normalizeText(text) {
  if (!text) return '';
  return text.trim().toLowerCase().replace(/\s+/g, ' ');
}

export function isEnglishQuery(text) {
  const enMarkers = [
    'what', 'how', 'why', 'when', 'where', 'who', 'which', 'can you',
    'tell me', 'explain', 'help', 'hello', 'hi', 'good morning', 'is', 'are'
  ];
  const words = text.toLowerCase().split(/\s+/);
  return enMarkers.some(marker => words.includes(marker) || text.toLowerCase().startsWith(marker));
}

export function generateSmartResponse(userMessage) {
  const msg = normalizeText(userMessage);
  const isEn = isEnglishQuery(msg);

  if (!msg || /^[\s?!.,;]+$/.test(msg)) {
    return isEn 
      ? "I didn't quite catch that. Could you please rephrase your question? 😊"
      : "Mình chưa nghe rõ câu hỏi của bạn. Bạn vui lòng nhập lại câu hỏi rõ ràng hơn nhé! 😊";
  }

  // 1. GREETINGS & INTRODUCTIONS
  const greetingWords = ['xin chào', 'chào bạn', 'chào cô', 'chào', 'hello', 'hi', 'hey', 'good morning', 'good afternoon'];
  const hasGreeting = greetingWords.some(w => {
    const regex = new RegExp(`(^|[^a-zA-Z0-9À-ỹ])${w}([^a-zA-Z0-9À-ỹ]|$)`, 'i');
    return regex.test(msg);
  });

  if (hasGreeting) {
    if (isEn) {
      return (
        "Hello! Welcome to **Ms Van's English Class**! 👋\n\n" +
        "I am your AI Learning Assistant. Here is what I can help you with:\n" +
        "- 📚 **Interactive Lessons**: Explore Grade 6 Units (Units 1 to 5).\n" +
        "- 🎴 **Flashcard Builder**: Master vocabulary with 3D cards & audio.\n" +
        "- ✍️ **Essay Grader**: Submit essays for instant AI feedback & grading.\n" +
        "- 📄 **Worksheet Generator**: Export custom PDF tests with 2-column layout.\n" +
        "- 📑 **AI Importer**: Auto-generate full 4-skill lesson plans from documents.\n\n" +
        "What would you like to explore today?"
      );
    }
    return (
      "Xin chào! Mình là Trợ lý AI của **Ms Van's English Class**! 👋\n\n" +
      "Mình luôn sẵn sàng đồng hành cùng bạn:\n" +
      "- 📚 **Bài học tương tác:** Khám phá 5 Unit tiếng Anh lớp 6 sinh động.\n" +
      "- 🎴 **Flashcard Builder:** Luyện từ vựng qua thẻ ghi nhớ 3D và phát âm chuẩn.\n" +
      "- ✍️ **Essay Grader:** Chấm điểm và sửa lỗi bài viết luận chi tiết.\n" +
      "- 📄 **Worksheet Generator:** Xuất phiếu bài tập PDF 2 cột chuẩn đẹp.\n" +
      "- 📑 **AI Importer:** Soạn giáo án 4 kỹ năng tự động từ tài liệu Word/PDF.\n\n" +
      "Hôm nay bạn cần mình hỗ trợ bài học hay tính năng nào nè? 😊"
    );
  }

  if (/\b(bạn là ai|who are you|bạn tên gì|giới thiệu|what is your name)\b/i.test(msg)) {
    if (isEn) {
      return (
        "I am **Ms Van's Virtual Assistant** — a smart AI companion designed to support " +
        "teachers with automated lesson planning tools and help students excel in Grade 6 English! 🎓"
      );
    }
    return (
      "Mình là **Trợ lý Ảo của Ms Van's English Class** 🎓 — người bạn đồng hành hỗ trợ " +
      "Thầy/Cô soạn giáo án thông minh và giúp các bạn học sinh làm chủ chương trình Tiếng Anh lớp 6!"
    );
  }

  // 2. FEATURE GUIDES
  // Flashcard Builder
  if (/\b(flashcard|từ vựng|lật thẻ|học từ|nhớ từ|phát âm|audio|vocabulary)\b/i.test(msg)) {
    if (isEn) {
      return (
        "🎴 **Flashcard Builder Guide:**\n\n" +
        "1. Select your target Unit (e.g. Unit 1: My New School).\n" +
        "2. Click on a card to flip and view phonetic IPA, word type, and Vietnamese meaning.\n" +
        "3. Click the 🔊 **Speaker icon** to hear standard British/American pronunciation.\n" +
        "4. Swipe or click **Next/Previous** to review your vocabulary deck!"
      );
    }
    return (
      "🎴 **Hướng Dẫn Tính Năng Flashcard Builder:**\n\n" +
      "1. Chọn Unit bạn muốn học (Ví dụ: Unit 1: My New School).\n" +
      "2. Bấm vào thẻ để **lật mặt sau** xem phiên âm IPA, loại từ và nghĩa tiếng Việt.\n" +
      "3. Bấm biểu tượng 🔊 **Loa phát âm** để nghe giọng đọc chuẩn bản xứ.\n" +
      "4. Vuốt thẻ hoặc bấm nút **Tiếp theo** để rèn luyện trí nhớ từ vựng!"
    );
  }

  // AI Importer & Lesson Planner
  if (/\b(tạo bài học|soạn giáo án|ai importer|importer|upload|tải file|file word|docx|txt|soạn bài|lesson planner)\b/i.test(msg)) {
    if (isEn) {
      return (
        "📑 **AI Importer & Lesson Planner Guide:**\n\n" +
        "1. Go to the **Admin Dashboard** and open the **AI Importer** tab.\n" +
        "2. Upload your curriculum document (`.txt`, `.docx`, or `.pdf`).\n" +
        "3. The AI will automatically extract vocabulary, grammar points, and 4-skill exercises into a comprehensive interactive lesson plan!\n" +
        "4. Review and click **Save Lesson** to add it to your Course Manager."
      );
    }
    return (
      "📑 **Hướng Dẫn Soạn Giáo Án Với AI Importer:**\n\n" +
      "1. Truy cập **Admin Dashboard** và chọn tab **AI Importer**.\n" +
      "2. Tải lên tệp tài liệu giáo án của Thầy/Cô (hỗ trợ file `.txt`, `.docx`, hoặc `.pdf`).\n" +
      "3. AI sẽ tự động phân tích và trích xuất: Từ vựng, Ngữ pháp, Bài đọc hiểu, Bài tập trắc nghiệm & tự luận 4 kỹ năng.\n" +
      "4. Thầy/Cô kiểm tra lại và bấm **Lưu bài học** vào Course Manager để học sinh cùng học!"
    );
  }

  // Worksheet Generator
  if (/\b(in bài tập|worksheet|phiếu bài tập|in pdf|xuất đề|đề thi|in ra giấy|print)\b/i.test(msg)) {
    if (isEn) {
      return (
        "📄 **Worksheet Generator Guide:**\n\n" +
        "1. Open the **Worksheet Generator** tool from the menu.\n" +
        "2. Choose your Unit and customize the exercise types (Multiple choice, Fill in the blanks, Sentence reordering).\n" +
        "3. Preview the clean, teacher-standard 2-column layout with student header & scoring box.\n" +
        "4. Click **Print / Export PDF** to download and print ready-to-use worksheets for your class!"
      );
    }
    return (
      "📄 **Hướng Dẫn Tạo Phiếu Bài Tập PDF (Worksheet Generator):**\n\n" +
      "1. Mở tính năng **Worksheet Generator** trên thanh công cụ.\n" +
      "2. Chọn Unit và cấu hình các dạng bài tập mong muốn (Trắc nghiệm, Điền từ, Sắp xếp câu...).\n" +
      "3. Xem trước giao diện 2 cột chuẩn sư phạm (có sẵn khung Họ tên, Điểm số & Lời phê).\n" +
      "4. Bấm nút **In / Xuất file PDF** để in trực tiếp ra giấy phát cho học sinh làm bài!"
    );
  }

  // Essay Grader
  if (/\b(chấm bài|chấm điểm|bài luận|essay|writing|sửa lỗi|viết đoạn văn|grader)\b/i.test(msg)) {
    if (isEn) {
      return (
        "✍️ **Essay Grader Guide:**\n\n" +
        "1. Navigate to the **Essay Grader** tool.\n" +
        "2. Select your writing prompt (e.g. *Describe your new school* or *My favourite room*).\n" +
        "3. Type or paste your English paragraph into the text box.\n" +
        "4. Click **Grade Essay** — AI will evaluate your work on a 10-point scale, highlight grammar/spelling errors, and provide suggestions for improvement!"
      );
    }
    return (
      "✍️ **Hướng Dẫn Chấm Bài Luận Bằng AI (Essay Grader):**\n\n" +
      "1. Chọn tính năng **Essay Grader** trên thanh điều hướng.\n" +
      "2. Chọn chủ đề bài viết (Ví dụ: *Miêu tả ngôi trường mới* hoặc *Ngôi nhà mơ ước*).\n" +
      "3. Nhập hoặc dán bài viết tiếng Anh của bạn vào khung soạn thảo.\n" +
      "4. Bấm **Chấm bài** — AI sẽ cho điểm thang 10, chỉ ra lỗi ngữ pháp/chính tả và gợi ý câu từ nâng cao để bạn tiến bộ!"
    );
  }

  // Classroom Presenter
  if (/\b(trình chiếu|presenter|tivi|ti vi|máy chiếu|lớp học|slide|toàn màn hình)\b/i.test(msg)) {
    if (isEn) {
      return (
        "📺 **Classroom Presenter Guide:**\n\n" +
        "Click the **Presenter Mode** icon to launch a high-contrast, large-font classroom projection view — optimized for smart TVs and interactive whiteboards during teaching!"
      );
    }
    return (
      "📺 **Chế Độ Trình Chiếu Lớp Học (Classroom Presenter):**\n\n" +
      "Bấm vào biểu tượng **Presenter** để chuyển sang giao diện trình chiếu độ tương phản cao, font chữ lớn — cực kỳ tối ưu khi giảng dạy trên TV thông minh hoặc Máy chiếu tại lớp học!"
    );
  }

  // Course Manager & Interactive Lesson
  if (/\b(course manager|quản lý khóa học|bài học tương tác|interactive lesson|danh sách bài|mục lục)\b/i.test(msg)) {
    if (isEn) {
      return (
        "📚 **Interactive Lesson & Course Manager:**\n\n" +
        "- **Course Manager**: Allows teachers to create, edit, or organize Units.\n" +
        "- **Interactive Lesson**: Students can learn through interactive theory slides, audio flashcards, and instant-graded quizzes with a smart floating Table of Contents!"
      );
    }
    return (
      "📚 **Quản Lý Khóa Học & Bài Học Tương Tác:**\n\n" +
      "- **Course Manager:** Dành cho Giáo viên tạo mới, chỉnh sửa và quản lý các bài giảng.\n" +
      "- **Interactive Lesson:** Dành cho Học sinh trải nghiệm bài học với lý thuyết sinh động, luyện tập trắc nghiệm chấm điểm tức thì và thanh Mục lục bài học thông minh!"
    );
  }

  // 3. GRADE 6 UNITS (1 - 5)
  if (/\b(unit 1|my new school|trường mới)\b/i.test(msg)) {
    return (
      "🏫 **Unit 1: MY NEW SCHOOL (Ngôi Trường Mới Của Tôi)**\n\n" +
      "- **Từ vựng chính:** School things (*calculator, compass, rubber, textbook*), School subjects (*maths, physics, history*), Verbs (*have, do, play, study*).\n" +
      "- **Ngữ pháp:**\n" +
      "  1. **Thì Hiện tại đơn (The Present Simple):** Diễn tả thói quen hoặc sự thật hiển nhiên (`S + V(s/es)`).\n" +
      "  2. **Trạng từ chỉ tần suất:** *always, usually, often, sometimes, rarely, never*.\n" +
      "- **Phát âm:** Phân biệt hai âm **/ɑː/** (*smart, fast*) và **/ʌ/** (*subject, study*)."
    );
  }

  if (/\b(unit 2|my house|ngôi nhà)\b/i.test(msg)) {
    return (
      "🏡 **Unit 2: MY HOUSE (Ngôi Nhà Của Tôi)**\n\n" +
      "- **Từ vựng chính:** Các loại nhà (*town house, country house, villa, stilt house*), Các phòng (*living room, bedroom, kitchen, attic*), Đồ đạc (*chest of drawers, wardrobe, dishwasher*).\n" +
      "- **Ngữ pháp:**\n" +
      "  1. **Giới từ chỉ nơi chốn (Prepositions of place):** *in, on, behind, in front of, next to, between, under*.\n" +
      "  2. **Cấu trúc miêu tả:** `There is + Danh từ số ít` / `There are + Danh từ số nhiều`.\n" +
      "- **Phát âm:** Phân biệt phát âm đuôi số nhiều: **/s/**, **/z/**, **/ɪz/**."
    );
  }

  if (/\b(unit 3|my friends|bạn bè|tính cách)\b/i.test(msg)) {
    return (
      "👫 **Unit 3: MY FRIENDS (Bạn Bè Của Tôi)**\n\n" +
      "- **Từ vựng chính:** Ngoại hình (*chubby cheeks, straight nose, blond hair*), Tính cách (*active, clever, confident, kind, funny, patient, reliable*).\n" +
      "- **Ngữ pháp:**\n" +
      "  1. **Thì Hiện tại tiếp diễn (The Present Continuous):** Diễn tả hành động đang xảy ra (`S + is/am/are + V-ing`).\n" +
      "  2. **Hiện tại tiếp diễn cho tương lai:** Diễn tả kế hoạch đã sắp đặt trước.\n" +
      "- **Phát âm:** Phân biệt hai phụ âm **/b/** (*book, boy*) và **/p/** (*picture, pen*)."
    );
  }

  if (/\b(unit 4|my neighbourhood|khu phố|hàng xóm)\b/i.test(msg)) {
    return (
      "🏘️ **Unit 4: MY NEIGHBOURHOOD (Khu Phố Của Tôi)**\n\n" +
      "- **Từ vựng chính:** Địa điểm xung quanh (*square, art gallery, cathedral, railway station, pagoda, grocery store*), Tính từ miêu tả (*peaceful, noisy, historic, modern, crowded*).\n" +
      "- **Ngữ pháp:**\n" +
      "  - **So sánh hơn của tính từ ngắn (Comparative Adjectives):**\n" +
      "    👉 `S + be + adj-er + than + O` (Ví dụ: *Hanoi is larger than Da Nang*).\n" +
      "- **Phát âm:** Phân biệt hai âm **/iː/** (*peaceful, clean*) và **/ɪ/** (*historic, busy*)."
    );
  }

  if (/\b(unit 5|natural wonders|kỳ quan|vịnh hạ long)\b/i.test(msg)) {
    return (
      "⛰️ **Unit 5: NATURAL WONDERS OF VIETNAM (Kỳ Quan Thiên Nhiên Việt Nam)**\n\n" +
      "- **Từ vựng chính:** Cảnh quan thiên nhiên (*waterfall, desert, cave, island, mountain, valley*), Đồ dùng du lịch (*suncream, plaster, sleeping bag, waterproof coat*).\n" +
      "- **Ngữ pháp:**\n" +
      "  1. **Danh từ đếm được và không đếm được (Countable & Uncountable Nouns).**\n" +
      "  2. **Động từ khuyết thiếu Must & Mustn't:**\n" +
      "     - `Must`: Bắt buộc phải làm (*You must follow the rules*).\n" +
      "     - `Mustn't`: Cấm không được làm (*You mustn't litter*).\n" +
      "- **Phát âm:** Phân biệt hai phụ âm **/t/** (*tent, boot*) và **/d/** (*desert, island*)."
    );
  }

  // 4. GRAMMAR FAQ
  if (/\b(hiện tại đơn|present simple|cách dùng thì hiện tại đơn)\b/i.test(msg)) {
    return (
      "💡 **Cẩm Nang Thì Hiện Tại Đơn (Present Simple):**\n\n" +
      "- **Công thức khẳng định:** `S + V(s/es) + O`\n" +
      "  - *I/You/We/They + V nguyên thể* (Ví dụ: *I play football*).\n" +
      "  - *He/She/It + V-s/es* (Ví dụ: *She studies English*).\n" +
      "- **Phủ định:** `S + do not / does not + V nguyên thể`.\n" +
      "- **Nghi vấn:** `Do / Does + S + V nguyên thể?`\n" +
      "- **Dấu hiệu nhận biết:** *always, usually, often, sometimes, every day, on Mondays*."
    );
  }

  if (/\b(phân biệt a và an|khi nào dùng an|mạo từ a an|a an the)\b/i.test(msg)) {
    return (
      "💡 **Quy Tắc Dùng Mạo Từ 'A' và 'AN':**\n\n" +
      "- Dùng **AN** trước các từ bắt đầu bằng một **nguyên âm phát âm** (mẹo nhớ: **u - e - o - a - i**):\n" +
      "  - *an apple, an eraser, an island, an hour (chữ h câm)*.\n" +
      "- Dùng **A** trước các từ bắt đầu bằng một **phụ âm**:\n" +
      "  - *a book, a ruler, a school, a uniform (chữ u phát âm là /juː/)*."
    );
  }

  if (/\b(so sánh hơn|tính từ ngắn|công thức so sánh)\b/i.test(msg)) {
    return (
      "💡 **Công Thức So Sánh Hơn Tính Từ Ngắn (Comparative):**\n\n" +
      "👉 `S1 + be + Adj-er + than + S2`\n\n" +
      "- **Ví dụ:** *My house is bigger than your house.* (*Nhà tôi to hơn nhà bạn*).\n" +
      "- **Quy tắc thêm đuôi -er:**\n" +
      "  - Tính từ kết thúc bằng *e*: chỉ thêm *r* (*nice -> nicer*).\n" +
      "  - Tính từ kết thúc bằng *y*: đổi thành *ier* (*noisy -> noisier*).\n" +
      "  - Phụ âm - nguyên âm - phụ âm: gấp đôi phụ âm cuối (*big -> bigger*)."
    );
  }

  // 5. OFF-TOPIC FILTER
  const offTopicPatterns = [
    /\b(thời tiết|mưa|nắng|nhiệt độ|weather|forecast)\b/i,
    /\b(toán|1 \+ 1|giải phương trình|cộng trừ|math|calculate)\b/i,
    /\b(lập trình|viết code|code python|javascript|java|html|css|c\+\+)\b/i,
    /\b(bóng đá|chính trị|tổng thống|tin tức|chứng khoán|bitcoin|crypto)\b/i,
  ];
  if (offTopicPatterns.some(p => p.test(msg))) {
    if (isEn) {
      return (
        "😊 I am the AI Learning Assistant specialized for **Ms Van's English Class**! " +
        "I focus on English vocabulary, grammar, and teaching toolkit features. " +
        "Would you like to practice some English exercises or explore our Interactive Lessons instead? 🚀"
      );
    }
    return (
      "😊 Mình là Trợ lý học tập chuyên biệt của **Ms Van's English Class** nè! " +
      "Mình chỉ chuyên về từ vựng, ngữ pháp tiếng Anh và hướng dẫn các công cụ học tập trên website thôi. " +
      "Bạn có muốn cùng mình luyện từ vựng qua Flashcard hay làm bài tập trắc nghiệm lớp 6 không nè? 🚀"
    );
  }

  // 6. DEFAULT FALLBACK
  if (isEn) {
    return (
      "I'm here to help with your English studies! You can ask me about:\n" +
      "- 📖 **Grade 6 Lessons**: Ask about *Unit 1, Unit 2, Unit 3, Unit 4, or Unit 5*.\n" +
      "- 🛠️ **Tools**: Ask about *Flashcards, AI Importer, Essay Grader, or Worksheet Generator*.\n" +
      "- 💡 **Grammar**: Ask about *Present Simple, a/an, or Comparative adjectives*.\n\n" +
      "What would you like to explore?"
    );
  }
  return (
    "Mình luôn sẵn sàng giải đáp thắc mắc cho bạn! Bạn có thể hỏi mình về:\n" +
    "- 📖 **Chương trình tiếng Anh lớp 6:** Hỏi về *Unit 1, Unit 2, Unit 3, Unit 4, hoặc Unit 5*.\n" +
    "- 🛠️ **Công cụ website:** Hỏi cách dùng *Flashcard, Soạn bài AI, Chấm bài luận, In đề PDF*.\n" +
    "- 💡 **Ngữ pháp:** Hỏi về *Thì hiện tại đơn, Mạo từ a/an, So sánh hơn tính từ*.\n\n" +
    "Bạn muốn tìm hiểu nội dung nào trước nè? 😊"
  );
}

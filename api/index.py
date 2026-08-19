import os
import re
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import httpx
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Ms Van's English Class AI Backend")

# Cấu hình CORS để Frontend React gọi API trơn tru
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatMessage(BaseModel):
    role: str
    text: str

class ChatRequest(BaseModel):
    history: List[ChatMessage] = []
    message: str
    language: Optional[str] = "vi"

# ==============================================================================
# BỘ NÃO PYTHON SMART NLP & INTENT ENGINE (0đ - 100% Uptime - Không phụ thuộc API)
# ==============================================================================

def normalize_text(text: str) -> str:
    """Chuẩn hóa văn bản: Chuyển chữ thường và loại bỏ khoảng trắng thừa."""
    return re.sub(r'\s+', ' ', text.strip().lower())

def is_english_query(text: str, preferred_lang: Optional[str] = None) -> bool:
    """Nhận diện xem người dùng đang hỏi bằng tiếng Anh hay tiếng Việt."""
    if preferred_lang == 'en':
        return True
    if preferred_lang == 'vi':
        en_explicit = ['what is', 'how to', 'how can', 'why is', 'who is', 'tell me', 'can you', 'explain the']
        if any(text.lower().startswith(s) for s in en_explicit):
            return True
        return False

    en_markers = [
        "what", "how", "why", "when", "where", "who", "which", "can you", 
        "tell me", "explain", "help", "hello", "hi", "good morning", "is", "are"
    ]
    words = text.lower().split()
    return any(marker in words or text.lower().startswith(marker) for marker in en_markers)

def generate_smart_response(user_message: str, preferred_lang: Optional[str] = None) -> str:
    """
    Phân tích ý định (Intent Recognition) từ câu hỏi của người dùng
    và trả về câu trả lời tối ưu, chính xác nhất về Website & Tiếng Anh Lớp 6.
    """
    msg = normalize_text(user_message)
    is_en = is_english_query(msg, preferred_lang)

    # --------------------------------------------------------------------------
    # 1. CHÀO HỎI & GIỚI THIỆU (GREETINGS & INTRODUCTIONS)
    # --------------------------------------------------------------------------
    greeting_words = ['xin chào', 'chào bạn', 'chào cô', 'chào', 'hello', 'hi', 'hey', 'good morning', 'good afternoon']
    has_greeting = any(re.search(rf'(^|[^\wÀ-ỹ]){re.escape(w)}([^\wÀ-ỹ]|$)', msg, re.IGNORECASE) for w in greeting_words)

    if has_greeting:
        if is_en:
            return (
                "Hello! Welcome to **Ms Van's English Class**! 👋\n\n"
                "I am your AI Learning Assistant. Here is what I can help you with:\n"
                "- 📚 **Interactive Lessons**: Explore Grade 6 Units (Units 1 to 5).\n"
                "- 🎴 **Flashcard Builder**: Master vocabulary with 3D cards & audio.\n"
                "- ✍️ **Essay Grader**: Submit essays for instant AI feedback & grading.\n"
                "- 📄 **Worksheet Generator**: Export custom PDF tests with 2-column layout.\n"
                "- 📑 **AI Importer**: Auto-generate full 4-skill lesson plans from documents.\n\n"
                "What would you like to explore today?"
            )
        return (
            "Xin chào! Mình là Trợ lý AI của **Ms Van's English Class**! 👋\n\n"
            "Mình luôn sẵn sàng đồng hành cùng bạn:\n"
            "- 📚 **Bài học tương tác:** Khám phá 5 Unit tiếng Anh lớp 6 sinh động.\n"
            "- 🎴 **Flashcard Builder:** Luyện từ vựng qua thẻ ghi nhớ 3D và phát âm chuẩn.\n"
            "- ✍️ **Essay Grader:** Chấm điểm và sửa lỗi bài viết luận chi tiết.\n"
            "- 📄 **Worksheet Generator:** Xuất phiếu bài tập PDF 2 cột chuẩn đẹp.\n"
            "- 📑 **AI Importer:** Soạn giáo án 4 kỹ năng tự động từ tài liệu Word/PDF.\n\n"
            "Hôm nay bạn cần mình hỗ trợ bài học hay tính năng nào nè? 😊"
        )

    if re.search(r'\b(bạn là ai|who are you|bạn tên gì|giới thiệu|what is your name)\b', msg):
        if is_en:
            return (
                "I am **Ms Van's Virtual Assistant** — a smart AI companion designed to support "
                "teachers with automated lesson planning tools and help students excel in Grade 6 English! 🎓"
            )
        return (
            "Mình là **Trợ lý Ảo của Ms Van's English Class** 🎓 — người bạn đồng hành hỗ trợ "
            "Thầy/Cô soạn giáo án thông minh và giúp các bạn học sinh làm chủ chương trình Tiếng Anh lớp 6!"
        )

    # --------------------------------------------------------------------------
    # 2. HƯỚNG DẪN TÍNH NĂNG WEBSITE (FEATURE GUIDES)
    # --------------------------------------------------------------------------
    # Flashcard Builder
    if re.search(r'\b(flashcard|từ vựng|lật thẻ|học từ|nhớ từ|phát âm|audio|vocabulary)\b', msg):
        if is_en:
            return (
                "🎴 **Flashcard Builder Guide:**\n\n"
                "1. Select your target Unit (e.g. Unit 1: My New School).\n"
                "2. Click on a card to flip and view phonetic IPA, word type, and Vietnamese meaning.\n"
                "3. Click the 🔊 **Speaker icon** to hear standard British/American pronunciation.\n"
                "4. Swipe or click **Next/Previous** to review your vocabulary deck!"
            )
        return (
            "🎴 **Hướng Dẫn Tính Năng Flashcard Builder:**\n\n"
            "1. Chọn Unit bạn muốn học (Ví dụ: Unit 1: My New School).\n"
            "2. Bấm vào thẻ để **lật mặt sau** xem phiên âm IPA, loại từ và nghĩa tiếng Việt.\n"
            "3. Bấm biểu tượng 🔊 **Loa phát âm** để nghe giọng đọc chuẩn bản xứ.\n"
            "4. Vuốt thẻ hoặc bấm nút **Tiếp theo** để rèn luyện trí nhớ từ vựng!"
        )

    # AI Importer & Lesson Planner
    if re.search(r'\b(tạo bài học|soạn giáo án|ai importer|importer|upload|tải file|file word|docx|txt|soạn bài|lesson planner)\b', msg):
        if is_en:
            return (
                "📑 **AI Importer & Lesson Planner Guide:**\n\n"
                "1. Go to the **Admin Dashboard** and open the **AI Importer** tab.\n"
                "2. Upload your curriculum document (`.txt`, `.docx`, or `.pdf`).\n"
                "3. The AI will automatically extract vocabulary, grammar points, and 4-skill exercises into a comprehensive interactive lesson plan!\n"
                "4. Review and click **Save Lesson** to add it to your Course Manager."
            )
        return (
            "📑 **Hướng Dẫn Soạn Giáo Án Với AI Importer:**\n\n"
            "1. Truy cập **Admin Dashboard** và chọn tab **AI Importer**.\n"
            "2. Tải lên tệp tài liệu giáo án của Thầy/Cô (hỗ trợ file `.txt`, `.docx`, hoặc `.pdf`).\n"
            "3. AI sẽ tự động phân tích và trích xuất: Từ vựng, Ngữ pháp, Bài đọc hiểu, Bài tập trắc nghiệm & tự luận 4 kỹ năng.\n"
            "4. Thầy/Cô kiểm tra lại và bấm **Lưu bài học** vào Course Manager để học sinh cùng học!"
        )

    # Worksheet Generator
    if re.search(r'\b(in bài tập|worksheet|phiếu bài tập|in pdf|xuất đề|đề thi|in ra giấy|print)\b', msg):
        if is_en:
            return (
                "📄 **Worksheet Generator Guide:**\n\n"
                "1. Open the **Worksheet Generator** tool from the menu.\n"
                "2. Choose your Unit and customize the exercise types (Multiple choice, Fill in the blanks, Sentence reordering).\n"
                "3. Preview the clean, teacher-standard 2-column layout with student header & scoring box.\n"
                "4. Click **Print / Export PDF** to download and print ready-to-use worksheets for your class!"
            )
        return (
            "📄 **Hướng Dẫn Tạo Phiếu Bài Tập PDF (Worksheet Generator):**\n\n"
            "1. Mở tính năng **Worksheet Generator** trên thanh công cụ.\n"
            "2. Chọn Unit và cấu hình các dạng bài tập mong muốn (Trắc nghiệm, Điền từ, Sắp xếp câu...).\n"
            "3. Xem trước giao diện 2 cột chuẩn sư phạm (có sẵn khung Họ tên, Điểm số & Lời phê).\n"
            "4. Bấm nút **In / Xuất file PDF** để in trực tiếp ra giấy phát cho học sinh làm bài!"
        )

    # Essay Grader
    if re.search(r'\b(chấm bài|chấm điểm|bài luận|essay|writing|sửa lỗi|viết đoạn văn|grader)\b', msg):
        if is_en:
            return (
                "✍️ **Essay Grader Guide:**\n\n"
                "1. Navigate to the **Essay Grader** tool.\n"
                "2. Select your writing prompt (e.g. *Describe your new school* or *My favourite room*).\n"
                "3. Type or paste your English paragraph into the text box.\n"
                "4. Click **Grade Essay** — AI will evaluate your work on a 10-point scale, highlight grammar/spelling errors, and provide suggestions for improvement!"
            )
        return (
            "✍️ **Hướng Dẫn Chấm Bài Luận Bằng AI (Essay Grader):**\n\n"
            "1. Chọn tính năng **Essay Grader** trên thanh điều hướng.\n"
            "2. Chọn chủ đề bài viết (Ví dụ: *Miêu tả ngôi trường mới* hoặc *Ngôi nhà mơ ước*).\n"
            "3. Nhập hoặc dán bài viết tiếng Anh của bạn vào khung soạn thảo.\n"
            "4. Bấm **Chấm bài** — AI sẽ cho điểm thang 10, chỉ ra lỗi ngữ pháp/chính tả và gợi ý câu từ nâng cao để bạn tiến bộ!"
        )

    # Classroom Presenter
    if re.search(r'\b(trình chiếu|presenter|tivi|ti vi|máy chiếu|lớp học|slide|toàn màn hình)\b', msg):
        if is_en:
            return (
                "📺 **Classroom Presenter Guide:**\n\n"
                "Click the **Presenter Mode** icon to launch a high-contrast, large-font classroom projection view — optimized for smart TVs and interactive whiteboards during teaching!"
            )
        return (
            "📺 **Chế Độ Trình Chiếu Lớp Học (Classroom Presenter):**\n\n"
            "Bấm vào biểu tượng **Presenter** để chuyển sang giao diện trình chiếu độ tương phản cao, font chữ lớn — cực kỳ tối ưu khi giảng dạy trên TV thông minh hoặc Máy chiếu tại lớp học!"
        )

    # Course Manager & Interactive Lesson
    if re.search(r'\b(course manager|quản lý khóa học|bài học tương tác|interactive lesson|danh sách bài|mục lục)\b', msg):
        if is_en:
            return (
                "📚 **Interactive Lesson & Course Manager:**\n\n"
                "- **Course Manager**: Allows teachers to create, edit, or organize Units.\n"
                "- **Interactive Lesson**: Students can learn through interactive theory slides, audio flashcards, and instant-graded quizzes with a smart floating Table of Contents!"
            )
        return (
            "📚 **Quản Lý Khóa Học & Bài Học Tương Tác:**\n\n"
            "- **Course Manager:** Dành cho Giáo viên tạo mới, chỉnh sửa và quản lý các bài giảng.\n"
            "- **Interactive Lesson:** Dành cho Học sinh trải nghiệm bài học với lý thuyết sinh động, luyện tập trắc nghiệm chấm điểm tức thì và thanh Mục lục bài học thông minh!"
        )

    # --------------------------------------------------------------------------
    # 3. TÓM TẮT CHƯƠNG TRÌNH TIẾNG ANH LỚP 6 (UNITS 1 - 5)
    # --------------------------------------------------------------------------
    if re.search(r'\b(unit 1|my new school|trường mới)\b', msg):
        return (
            "🏫 **Unit 1: MY NEW SCHOOL (Ngôi Trường Mới Của Tôi)**\n\n"
            "- **Từ vựng chính:** School things (*calculator, compass, rubber, textbook*), School subjects (*maths, physics, history*), Verbs (*have, do, play, study*).\n"
            "- **Ngữ pháp:**\n"
            "  1. **Thì Hiện tại đơn (The Present Simple):** Diễn tả thói quen hoặc sự thật hiển nhiên (`S + V(s/es)`).\n"
            "  2. **Trạng từ chỉ tần suất:** *always, usually, often, sometimes, rarely, never*.\n"
            "- **Phát âm:** Phân biệt hai âm **/ɑː/** (*smart, fast*) và **/ʌ/** (*subject, study*)."
        )

    if re.search(r'\b(unit 2|my house|ngôi nhà)\b', msg):
        return (
            "🏡 **Unit 2: MY HOUSE (Ngôi Nhà Của Tôi)**\n\n"
            "- **Từ vựng chính:** Các loại nhà (*town house, country house, villa, stilt house*), Các phòng (*living room, bedroom, kitchen, attic*), Đồ đạc (*chest of drawers, wardrobe, dishwasher*).\n"
            "- **Ngữ pháp:**\n"
            "  1. **Giới từ chỉ nơi chốn (Prepositions of place):** *in, on, behind, in front of, next to, between, under*.\n"
            "  2. **Cấu trúc miêu tả:** `There is + Danh từ số ít` / `There are + Danh từ số nhiều`.\n"
            "- **Phát âm:** Phân biệt phát âm đuôi số nhiều: **/s/**, **/z/**, **/ɪz/**."
        )

    if re.search(r'\b(unit 3|my friends|bạn bè|tính cách)\b', msg):
        return (
            "👫 **Unit 3: MY FRIENDS (Bạn Bè Của Tôi)**\n\n"
            "- **Từ vựng chính:** Ngoại hình (*chubby cheeks, straight nose, blond hair*), Tính cách (*active, clever, confident, kind, funny, patient, reliable*).\n"
            "- **Ngữ pháp:**\n"
            "  1. **Thì Hiện tại tiếp diễn (The Present Continuous):** Diễn tả hành động đang xảy ra (`S + is/am/are + V-ing`).\n"
            "  2. **Hiện tại tiếp diễn cho tương lai:** Diễn tả kế hoạch đã sắp đặt trước.\n"
            "- **Phát âm:** Phân biệt hai phụ âm **/b/** (*book, boy*) và **/p/** (*picture, pen*)."
        )

    if re.search(r'\b(unit 4|my neighbourhood|khu phố|hàng xóm)\b', msg):
        return (
            "🏘️ **Unit 4: MY NEIGHBOURHOOD (Khu Phố Của Tôi)**\n\n"
            "- **Từ vựng chính:** Địa điểm xung quanh (*square, art gallery, cathedral, railway station, pagoda, grocery store*), Tính từ miêu tả (*peaceful, noisy, historic, modern, crowded*).\n"
            "- **Ngữ pháp:**\n"
            "  - **So sánh hơn của tính từ ngắn (Comparative Adjectives):**\n"
            "    👉 `S + be + adj-er + than + O` (Ví dụ: *Hanoi is larger than Da Nang*).\n"
            "- **Phát âm:** Phân biệt hai âm **/iː/** (*peaceful, clean*) và **/ɪ/** (*historic, busy*)."
        )

    if re.search(r'\b(unit 5|natural wonders|kỳ quan|vịnh hạ long)\b', msg):
        return (
            "⛰️ **Unit 5: NATURAL WONDERS OF VIETNAM (Kỳ Quan Thiên Nhiên Việt Nam)**\n\n"
            "- **Từ vựng chính:** Cảnh quan thiên nhiên (*waterfall, desert, cave, island, mountain, valley*), Đồ dùng du lịch (*suncream, plaster, sleeping bag, waterproof coat*).\n"
            "- **Ngữ pháp:**\n"
            "  1. **Danh từ đếm được và không đếm được (Countable & Uncountable Nouns).**\n"
            "  2. **Động từ khuyết thiếu Must & Mustn't:**\n"
            "     - `Must`: Bắt buộc phải làm (*You must follow the rules*).\n"
            "     - `Mustn't`: Cấm không được làm (*You mustn't litter*).\n"
            "- **Phát âm:** Phân biệt hai phụ âm **/t/** (*tent, boot*) và **/d/** (*desert, island*)."
        )

    # --------------------------------------------------------------------------
    # 4. HỎI ĐÁP NGỮ PHÁP TIẾNG ANH (GRAMMAR FAQ)
    # --------------------------------------------------------------------------
    if re.search(r'\b(hiện tại đơn|present simple|cách dùng thì hiện tại đơn)\b', msg):
        return (
            "💡 **Cẩm Nang Thì Hiện Tại Đơn (Present Simple):**\n\n"
            "- **Công thức khẳng định:** `S + V(s/es) + O`\n"
            "  - *I/You/We/They + V nguyên thể* (Ví dụ: *I play football*).\n"
            "  - *He/She/It + V-s/es* (Ví dụ: *She studies English*).\n"
            "- **Phủ định:** `S + do not / does not + V nguyên thể`.\n"
            "- **Nghi vấn:** `Do / Does + S + V nguyên thể?`\n"
            "- **Dấu hiệu nhận biết:** *always, usually, often, sometimes, every day, on Mondays*."
        )

    if re.search(r'\b(phân biệt a và an|khi nào dùng an|mạo từ a an|a an the)\b', msg):
        return (
            "💡 **Quy Tắc Dùng Mạo Từ 'A' và 'AN':**\n\n"
            "- Dùng **AN** trước các từ bắt đầu bằng một **nguyên âm phát âm** (mẹo nhớ: **u - e - o - a - i**):\n"
            "  - *an apple, an eraser, an island, an hour (chữ h câm)*.\n"
            "- Dùng **A** trước các từ bắt đầu bằng một **phụ âm**:\n"
            "  - *a book, a ruler, a school, a uniform (chữ u phát âm là /juː/)*."
        )

    if re.search(r'\b(so sánh hơn|tính từ ngắn|công thức so sánh)\b', msg):
        return (
            "💡 **Công Thức So Sánh Hơn Tính Từ Ngắn (Comparative):**\n\n"
            "👉 `S1 + be + Adj-er + than + S2`\n\n"
            "- **Ví dụ:** *My house is bigger than your house.* (*Nhà tôi to hơn nhà bạn*).\n"
            "- **Quy tắc thêm đuôi -er:**\n"
            "  - Tính từ kết thúc bằng *e*: chỉ thêm *r* (*nice -> nicer*).\n"
            "  - Tính từ kết thúc bằng *y*: đổi thành *ier* (*noisy -> noisier*).\n"
            "  - Phụ âm - nguyên âm - phụ âm: gấp đôi phụ âm cuối (*big -> bigger*)."
        )

    # --------------------------------------------------------------------------
    # 5. BỘ LỌC CÂU HỎI NGOÀI LỀ (OFF-TOPIC FILTER)
    # --------------------------------------------------------------------------
    off_topic_patterns = [
        r'\b(thời tiết|mưa|nắng|nhiệt độ|weather|forecast)\b',
        r'\b(toán|1 \+ 1|giải phương trình|cộng trừ|math|calculate)\b',
        r'\b(lập trình|viết code|code python|javascript|java|html|css|c\+\+)\b',
        r'\b(bóng đá|chính trị|tổng thống|tin tức|chứng khoán|bitcoin|crypto)\b',
    ]
    if any(re.search(p, msg) for p in off_topic_patterns):
        if is_en:
            return (
                "😊 I am the AI Learning Assistant specialized for **Ms Van's English Class**! "
                "I focus on English vocabulary, grammar, and teaching toolkit features. "
                "Would you like to practice some English exercises or explore our Interactive Lessons instead? 🚀"
            )
        return (
            "😊 Mình là Trợ lý học tập chuyên biệt của **Ms Van's English Class** nè! "
            "Mình chỉ chuyên về từ vựng, ngữ pháp tiếng Anh và hướng dẫn các công cụ học tập trên website thôi. "
            "Bạn có muốn cùng mình luyện từ vựng qua Flashcard hay làm bài tập trắc nghiệm lớp 6 không nè? 🚀"
        )

    # --------------------------------------------------------------------------
    # 6. PHẢN HỒI MẶC ĐỊNH THÔNG MINH (SMART FALLBACK)
    # --------------------------------------------------------------------------
    if is_en:
        return (
            "I'm here to help with your English studies! You can ask me about:\n"
            "- 📖 **Grade 6 Lessons**: Ask about *Unit 1, Unit 2, Unit 3, Unit 4, or Unit 5*.\n"
            "- 🛠️ **Tools**: Ask about *Flashcards, AI Importer, Essay Grader, or Worksheet Generator*.\n"
            "- 💡 **Grammar**: Ask about *Present Simple, a/an, or Comparative adjectives*.\n\n"
            "What would you like to explore?"
        )
    return (
        "Mình luôn sẵn sàng giải đáp thắc mắc cho bạn! Bạn có thể hỏi mình về:\n"
        "- 📖 **Chương trình tiếng Anh lớp 6:** Hỏi về *Unit 1, Unit 2, Unit 3, Unit 4, hoặc Unit 5*.\n"
        "- 🛠️ **Công cụ website:** Hỏi cách dùng *Flashcard, Soạn bài AI, Chấm bài luận, In đề PDF*.\n"
        "- 💡 **Ngữ pháp:** Hỏi về *Thì hiện tại đơn, Mạo từ a/an, So sánh hơn tính từ*.\n\n"
        "Bạn muốn tìm hiểu nội dung nào trước nè? 😊"
    )


# ==============================================================================
# FASTAPI ENDPOINTS
# ==============================================================================

@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": "Ms Van's English Class AI Backend",
        "engine": "Hybrid Python Smart NLP Engine",
        "version": "2.0.0"
    }

@app.post("/api/chat")
async def chat_with_ai(request: ChatRequest):
    """
    Endpoint xử lý tin nhắn chat:
    1. Kiểm tra nếu có GEMINI_API_KEY hợp lệ, thử gọi Google Gemini.
    2. Nếu Google Gemini bị Rate Limit (429), quá tải (503), hoặc chưa có Key:
       -> Tự động kích hoạt Python Smart NLP Engine để trả lời ngay lập tức (100% không bao giờ lỗi)!
    """
    user_msg = request.message.strip()
    if not user_msg:
        raise HTTPException(status_code=400, detail="Nội dung tin nhắn không được để trống")

    api_key = os.getenv("GEMINI_API_KEY")
    use_external_ai = os.getenv("USE_EXTERNAL_AI", "false").lower() == "true"

    # Nếu cấu hình gọi AI ngoài và có API Key
    if use_external_ai and api_key and not api_key.startswith("AQ.Ab8RN6IIPLBO"):
        try:
            model_name = os.getenv("GEMINI_MODEL", "gemini-flash-latest")
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={api_key}"
            
            contents = []
            for msg in request.history:
                role = "model" if msg.role == "ai" else "user"
                contents.append({"role": role, "parts": [{"text": msg.text}]})
            if contents and contents[0]["role"] == "model":
                contents.pop(0)
            contents.append({"role": "user", "parts": [{"text": user_msg}]})
            
            payload = {
                "contents": contents,
                "generationConfig": {"maxOutputTokens": 1000, "temperature": 0.7}
            }
            
            async with httpx.AsyncClient() as client:
                response = await client.post(url, json=payload, timeout=8.0)
                if response.status_code == 200:
                    data = response.json()
                    if "candidates" in data and len(data["candidates"]) > 0:
                        return {"reply": data["candidates"][0]["content"]["parts"][0]["text"]}
        except Exception as e:
            print(f"External AI Error (falling back to Smart Engine): {e}")

    # Fallback mượt mà về Python Smart NLP Engine (0đ - tức thì - chuẩn 100%)
    smart_reply = generate_smart_response(user_msg, request.language)
    return {"reply": smart_reply}

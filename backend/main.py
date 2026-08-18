import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import google.generativeai as genai
from dotenv import load_dotenv

# Nạp biến môi trường từ file .env
load_dotenv()

app = FastAPI(title="Ms Van's English Class AI Backend")

# Cấu hình CORS để cho phép React frontend kết nối
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Chỉ cho phép web của chúng ta
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Cấu hình Gemini API Key
api_key = os.getenv("GEMINI_API_KEY")
if api_key:
    genai.configure(api_key=api_key)

SYSTEM_INSTRUCTION = """Bạn là Trợ lý AI ảo của "Ms Van's English Class" - một nền tảng E-Learning và công cụ hỗ trợ giảng dạy tiếng Anh hiện đại.
Nhiệm vụ của bạn là:
1. Hướng dẫn người dùng (Giáo viên hoặc Học sinh) cách sử dụng các tính năng của website.
2. Trả lời các câu hỏi về tiếng Anh một cách ngắn gọn, dễ hiểu và thân thiện.
3. Luôn giữ thái độ chuyên nghiệp, tận tâm và vui vẻ.

Các chức năng chính của website:
- Course Manager (Quản lý bài học): Nơi tạo, sửa, xoá các khoá học và bài học.
- AI Importer (Tạo bài học bằng AI): Tự động phân tích file văn bản (.txt, tài liệu) để tạo ra giáo án 4 kỹ năng Nghe, Nói, Đọc, Viết với JSON Advanced.
- Interactive Lesson (Bài học tương tác): Giao diện học sinh với Flashcard, Ngữ pháp, Bài tập trắc nghiệm và tự luận (có thanh Mục lục thông minh).
- Flashcard Builder: Tạo thẻ ghi nhớ từ vựng tự động.
- Worksheet Generator: Tạo phiếu bài tập PDF.
- Essay Grader: Chấm điểm bài luận tiếng Anh bằng AI.

Nếu người dùng hỏi cách làm gì đó, hãy hướng dẫn họ đến tính năng tương ứng. Không sử dụng markdown quá phức tạp, có thể dùng in đậm, in nghiêng và danh sách bullet."""

class ChatMessage(BaseModel):
    role: str
    text: str

class ChatRequest(BaseModel):
    history: List[ChatMessage]
    message: str

@app.get("/")
def read_root():
    return {"message": "Welcome to Ms Van's AI Backend"}

@app.post("/api/chat")
async def chat_with_ai(request: ChatRequest):
    if not api_key:
        raise HTTPException(status_code=500, detail="Chưa cấu hình GEMINI_API_KEY trên Server")
        
    try:
        model = genai.GenerativeModel(
            model_name="gemini-1.5-flash",
            system_instruction=SYSTEM_INSTRUCTION
        )
        
        # Chuyển đổi định dạng lịch sử cho phù hợp với Python SDK của Google
        formatted_history = []
        for msg in request.history:
            # Lọc bỏ câu chào đầu tiên của AI nếu bị dính vào
            role = "model" if msg.role == "ai" else "user"
            formatted_history.append({"role": role, "parts": msg.text})
            
        # Lọc bỏ câu chào đầu tiên nếu nó là model (Gemini bắt buộc phải bắt đầu bằng user)
        if formatted_history and formatted_history[0]["role"] == "model":
            formatted_history.pop(0)

        chat_session = model.start_chat(history=formatted_history)
        
        # Gửi câu hỏi mới lên
        response = chat_session.send_message(request.message)
        
        return {"reply": response.text}
    except Exception as e:
        print(f"Lỗi khi gọi AI: {str(e)}")
        raise HTTPException(status_code=500, detail="Xin lỗi, tôi đang gặp trục trặc kỹ thuật. Vui lòng thử lại sau nhé!")

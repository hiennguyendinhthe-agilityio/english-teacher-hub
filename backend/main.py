import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import httpx
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Ms Van's English Class AI Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

api_key = os.getenv("GEMINI_API_KEY")

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
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key={api_key}"
        
        # Chuyển đổi lịch sử
        contents = []
        for msg in request.history:
            role = "model" if msg.role == "ai" else "user"
            contents.append({"role": role, "parts": [{"text": msg.text}]})
            
        # Lọc bỏ câu chào đầu tiên của AI
        if contents and contents[0]["role"] == "model":
            contents.pop(0)
            
        # Thêm câu hỏi mới
        contents.append({"role": "user", "parts": [{"text": request.message}]})
        
        payload = {
            "contents": contents,
            "systemInstruction": {
                "role": "user",
                "parts": [{"text": SYSTEM_INSTRUCTION}]
            },
            "generationConfig": {
                "maxOutputTokens": 1000,
                "temperature": 0.7,
            }
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(url, json=payload, timeout=30.0)
            
            if response.status_code != 200:
                print(f"Gemini API Error: {response.text}")
                data = response.json()
                if data.get("error", {}).get("code") == 503:
                    raise HTTPException(status_code=503, detail="Máy chủ Google Gemini đang quá tải, vui lòng thử lại sau vài giây nhé!")
                raise HTTPException(status_code=500, detail="Lỗi từ Google Gemini API")
                
            data = response.json()
            if "candidates" in data and len(data["candidates"]) > 0:
                reply_text = data["candidates"][0]["content"]["parts"][0]["text"]
                return {"reply": reply_text}
                
            raise HTTPException(status_code=500, detail="AI trả về dữ liệu không hợp lệ")

    except HTTPException:
        raise
    except Exception as e:
        print(f"Lỗi khi gọi AI: {str(e)}")
        raise HTTPException(status_code=500, detail="Xin lỗi, tôi đang gặp trục trặc kỹ thuật. Vui lòng thử lại sau nhé!")

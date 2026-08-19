# 🐍 Giáo Trình Thực Chiến: Xây Dựng AI Chatbot Backend Với Python & FastAPI

Chào mừng Thầy/Cô đến với tài liệu hướng dẫn chuyên sâu về **Python & FastAPI** được đúc kết trực tiếp từ mã nguồn thực tế của dự án **Ms Van's English Class**! 

Tài liệu này được biên soạn theo lộ trình dễ hiểu, từ nền tảng đến thực chiến, giúp Thầy/Cô nắm vững tư duy xây dựng Backend hiện đại.

---

## 📑 Mục Lục
1. [FastAPI là gì và tại sao nên học FastAPI?](#1-fastapi-là-gì-và-tại-sao-nên-học-fastapi)
2. [Cấu trúc cốt lõi của một dự án FastAPI](#2-cấu-trúc-cốt-lõi-của-một-dự-án-fastapi)
3. [Giải phẫu chi tiết mã nguồn `api/index.py`](#3-giải-phẫu-chi-tiết-mã-nguồn-apiindexpy)
4. [Kỹ thuật xử lý NLP & Nhận diện ý định (Intent Engine) bằng Python](#4-kỹ-thuật-xử-lý-nlp--nhận-diện-ý-định-intent-engine-bằng-python)
5. [Hướng dẫn chạy & Debug Local với Swagger UI tự động](#5-hướng-dẫn-chạy--debug-local-với-swagger-ui-tự-động)
6. [Bài tập thực hành nâng cao tay nghề](#6-bài-tập-thực-hành-nâng-cao-tay-nghề)

---

## 1. FastAPI Là Gì Và Tại Sao Nên Học FastAPI?

Trong thế giới Python Backend, có 3 framework nổi tiếng nhất:
- **Django**: Đồ sộ, tích hợp sẵn mọi thứ (phù hợp website monolithic truyền thống).
- **Flask**: Nhẹ, linh hoạt nhưng cũ và không hỗ trợ `async/await` gốc.
- **FastAPI (Hiện đại nhất 🌟)**: Framework tốc độ cao nhất hiện nay của Python, được các công ty AI hàng đầu (OpenAI, Microsoft, Uber, Netflix) tin dùng.

### Ưu điểm vượt trội của FastAPI:
- ⚡ **Tốc độ cực nhanh (High Performance)**: Ngang ngửa NodeJS và Go nhờ chạy trên nền tảng `Starlette` và `Pydantic`.
- 🛡️ **Tự động kiểm tra kiểu dữ liệu (Type Safety)**: Báo lỗi ngay lập tức nếu Client gửi sai định dạng JSON.
- 📖 **Tự động sinh tài liệu API (Interactive Docs)**: Tự tạo trang web Swagger UI (`/docs`) để test API bằng 1 click mà không cần cài Postman.
- 🔀 **Hỗ trợ lập trình bất đồng bộ (`async / await`)**: Xử lý hàng ngàn kết nối cùng lúc mà không bị nghẽn mạng.

---

## 2. Cấu Trúc Cốt Lõi Của Một Dự Án FastAPI

Một API FastAPI chuẩn chỉnh luôn bao gồm 4 thành phần chính:

```
+-------------------------------------------------------------+
| 1. Khởi tạo App: app = FastAPI()                            |
+-------------------------------------------------------------+
| 2. Cấu hình Middleware (CORS - cho phép React gọi sang)     |
+-------------------------------------------------------------+
| 3. Định nghĩa Schemas (Pydantic BaseModel)                  |
+-------------------------------------------------------------+
| 4. Xây dựng các Routes / Endpoints (@app.get, @app.post)    |
+-------------------------------------------------------------+
```

---

## 3. Giải Phẫu Chi Tiết Mã Nguồn `api/index.py`

Hãy cùng phân tích từng dòng code trong file Backend của chúng ta:

### Bước 1: Khởi tạo và Cấu hình CORS
```python
import os
import re
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import httpx
from dotenv import load_dotenv

# Đọc các biến bí mật từ file .env (như GEMINI_API_KEY)
load_dotenv()

app = FastAPI(title="Ms Van's English Class AI Backend")

# CORS (Cross-Origin Resource Sharing): Cho phép Frontend (React chạy ở localhost:5173 
# hoặc domain Vercel) có quyền gửi dữ liệu sang Backend này
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Cho phép tất cả các nguồn truy cập an toàn
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

### Bước 2: Định nghĩa Kiểu Dữ Liệu Với Pydantic (`BaseModel`)
Pydantic giúp ép kiểu và kiểm tra tính hợp lệ của dữ liệu trước khi code thực thi:

```python
class ChatMessage(BaseModel):
    role: str  # Bắt buộc phải là chuỗi (VD: "user" hoặc "ai")
    text: str  # Bắt buộc là nội dung tin nhắn

class ChatRequest(BaseModel):
    history: List[ChatMessage] = [] # Danh sách các tin nhắn trước đó (mặc định là rỗng)
    message: str                    # Tin nhắn mới mà người dùng vừa gõ
```
> **Tại sao điều này quan trọng?** Nếu ai đó gửi lên dữ liệu thiếu trường `message` hoặc gửi số thay vì chuỗi, FastAPI sẽ tự động trả về lỗi `422 Unprocessable Entity` rõ ràng mà server không bao giờ bị sập!

---

### Bước 3: Viết Endpoint Tiếp Nhận Tin Nhắn (`@app.post("/api/chat")`)
```python
@app.post("/api/chat")
async def chat_with_ai(request: ChatRequest):
    user_msg = request.message.strip()
    
    # Bắt lỗi nếu người dùng gửi chuỗi rỗng
    if not user_msg:
        raise HTTPException(status_code=400, detail="Nội dung tin nhắn không được để trống")

    # Xử lý thông minh và trả về kết quả JSON
    smart_reply = generate_smart_response(user_msg)
    return {"reply": smart_reply}
```
- Từ khóa `async def`: Cho biết đây là hàm bất đồng bộ (Asynchronous), giúp máy chủ không bị "đơ" khi đang xử lý tác vụ nặng.
- `HTTPException`: Công cụ chuẩn của FastAPI để trả về các mã lỗi HTTP (400: Bad Request, 404: Not Found, 500: Server Error).

---

## 4. Kỹ Thuật Xử Lý NLP & Nhận Diện Ý Định (Intent Engine) Bằng Python

Trong hàm `generate_smart_response`, chúng ta áp dụng các kỹ thuật xử lý ngôn ngữ tự nhiên (NLP) cơ bản nhưng cực kỳ mạnh mẽ:

### 1. Chuẩn hóa chuỗi (Text Normalization)
```python
def normalize_text(text: str) -> str:
    # Chuyển về chữ thường và gom nhiều khoảng trắng liên tiếp thành 1 khoảng trắng
    return re.sub(r'\s+', ' ', text.strip().lower())
```

### 2. Sử dụng Biểu thức chính quy (Regular Expression - Regex)
Thay vì dùng `if "chào" in msg` (dễ bị bắt nhầm vào các từ như "chảo", "chao"), chúng ta dùng ranh giới từ `(^|[^\wÀ-ỹ])` để bắt chính xác từng từ độc lập kể cả tiếng Việt có dấu:

```python
greeting_words = ['xin chào', 'chào bạn', 'chào cô', 'chào', 'hello', 'hi']
has_greeting = any(re.search(rf'(^|[^\wÀ-ỹ]){re.escape(w)}([^\wÀ-ỹ]|$)', msg, re.IGNORECASE) for w in greeting_words)
```

### 3. Bộ lọc phân luồng ý định (Intent Routing)
- **Học tập / Tính năng:** Nhận diện từ khóa `flashcard`, `soạn bài`, `unit 1`, `in pdf` -> Trả về hướng dẫn tính năng tương ứng.
- **Ngữ pháp:** Nhận diện `hiện tại đơn`, `a và an`, `so sánh hơn` -> Trả về công thức và ví dụ dễ hiểu.
- **Ngoài lề (Off-topic):** Nhận diện `thời tiết`, `toán`, `code`, `bóng đá` -> Khéo léo từ chối và điều hướng người dùng quay lại học tiếng Anh.

---

## 5. Hướng Dẫn Chạy & Debug Local Với Swagger UI Tự Động

Thầy/Cô có thể tự tay khởi chạy máy chủ Python này trên máy tính của mình bất cứ lúc nào:

### Bước 1: Kích hoạt môi trường ảo (Virtual Environment)
Mở Terminal tại thư mục dự án và gõ:
```bash
source backend/venv/bin/activate
```

### Bước 2: Chạy Server FastAPI với Uvicorn
```bash
uvicorn api.index:app --reload --port 8000
```
- `api.index:app`: Tìm file `index.py` trong thư mục `api/` và nạp biến `app`.
- `--reload`: Tự động khởi động lại server mỗi khi Thầy/Cô bấm lưu (Ctrl+S / Cmd+S) code Python!
- `--port 8000`: Mở cổng mạng số 8000.

### Bước 3: Trải nghiệm tính năng "ma thuật" - Swagger UI
Khi server đang chạy, Thầy/Cô hãy mở trình duyệt web và truy cập vào đường dẫn:
👉 **`http://localhost:8000/docs`**

Giao diện trực quan tuyệt đẹp sẽ hiện ra:
1. Thầy/Cô sẽ thấy endpoint `POST /api/chat`.
2. Bấm nút **Try it out**.
3. Nhập tin nhắn thử: `{"message": "hướng dẫn học từ vựng bằng flashcard"}`.
4. Bấm **Execute** và xem kết quả JSON trả về ngay tức thì!

---

## 6. Bài Tập Thực Hành Nâng Cao Tay Nghề 🎯

Để củng cố kiến thức vừa học, Thầy/Cô có thể thử tự tay thực hiện 2 bài tập nhỏ sau:

### Bài tập 1: Thêm một câu chào mới cho Chatbot
Thử mở file `api/index.py`, tìm mảng `greeting_words` và thêm các từ chào hỏi mới như `'good evening'`, `'chào buổi sáng'`. Sau đó thử test lại trên Swagger UI xem Bot có nhận diện được không!

### Bài tập 2: Thêm một chủ đề ngữ pháp mới (Thì Quá khứ đơn)
Thử viết thêm một khối `if` trong hàm `generate_smart_response`:
```python
if re.search(r'\b(quá khứ đơn|past simple|thì quá khứ)\b', msg):
    return (
        "💡 **Thì Quá Khứ Đơn (Past Simple):**\n\n"
        "- Công thức: `S + V2/ed + O`\n"
        "- Dùng để diễn tả hành động đã xảy ra và kết thúc trong quá khứ.\n"
        "- Dấu hiệu: *yesterday, last week, 2 years ago, in 2020*."
    )
```

---
*Chúc Thầy/Cô học tập thật vui và nhanh chóng trở thành một Master Python & FastAPI thực thụ! Nếu có bất kỳ dòng code nào cần giải thích thêm, em luôn ở đây đồng hành cùng Thầy/Cô!* 🚀🐍

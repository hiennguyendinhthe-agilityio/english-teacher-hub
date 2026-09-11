# 🚀 Luyện tập 1: Nền tảng Viết Luận & Quản lý Bài Viết (AI Writing & Essay Platform API)

> **Bối cảnh thực tế & Mục tiêu dự án:**  
> Dự án này đóng vai trò là **Backend hạt nhân** phục vụ trực tiếp cho tính năng **AI Essay & Writing Grader** trên ứng dụng chính **English Teacher Hub**.  
> Hệ thống kết hợp giữa **FastAPI (Python)**, **PostgreSQL (Async SQLAlchemy 2.0)**, **Alembic**, và **Clerk Authentication** để tạo nên một nền tảng lưu trữ, đánh giá và phân loại bài luận học viên chuyên nghiệp, chuẩn Enterprise.

---

## 🛠️ Công nghệ sử dụng (Tech Stack)

- **Backend Framework:** FastAPI (Python 3.12+) ⚡
- **Cơ sở dữ liệu:** PostgreSQL (kết nối bất đồng bộ qua `asyncpg`) 🐘
- **ORM & Migrations:** SQLAlchemy 2.0 (Async) + Alembic 🗄️
- **Xác thực (Authentication):** Clerk JWT (Xác minh chữ ký qua JWKS public keys) 🔐
- **Phân quyền (Authorization):** Role-Based Access Control (RBAC: `ADMIN`, `TEACHER`, `STUDENT`) 🛡️
- **CLI Commands:** `typer` (Quản trị hệ thống qua Terminal) 💻
- **Tài liệu API:** OpenAPI / Swagger UI 📑
- **Kiểm thử (Unit & Integration Testing):** Pytest + `pytest-asyncio` 🧪
- **Frontend Tương thích:** React 18, Vite, TailwindCSS, Zustand (`useAIStore`), `@clerk/clerk-react` 🎨

---

## 🧭 Kiến trúc luồng người dùng: AI Writing 🔄 Clerk Auth 🔄 Backend API

### 1. Trải nghiệm Viết & Chấm điểm (Guest / Unauthenticated Experience)
- Bất kỳ học viên nào khi truy cập tab **AI Writing** đều có thể trải nghiệm ngay:
  - Chọn chủ đề hoặc nhập đề bài (*Writing Prompt*).
  - Chọn tiêu chuẩn đánh giá (*Evaluation Framework: IELTS Band, CEFR, General*).
  - Soạn thảo bài luận và bấm **"Grade Essay & Get Feedback"**.
  - AI (Gemini Engine) phân tích: Overall Band Score, tiêu chí chi tiết (Task Response, Coherence, Lexical, Grammar), lỗi ngữ pháp và đoạn văn mẫu.

### 2. Luồng Lưu Bài Viết & Xác Thực Clerk (Seamless Save & Auto-Sync)
- Sau khi có kết quả chấm điểm từ AI, nút **"💾 Lưu bài luận vào hồ sơ" (Save Essay)** xuất hiện.
- **Nếu học viên ĐÃ đăng nhập:**
  - `apiClient` tự động lấy JWT từ Clerk session.
  - Gửi request `POST /api/posts` chứa tiêu đề, nội dung bài luận, điểm số/feedback AI và danh mục (`category_ids`).
  - Hiển thị Toast thông báo: *"Đã lưu bài viết thành công! 🎉"* và mở tab/danh sách **"Lịch sử bài viết của tôi" (My Essays)**.
- **Nếu học viên CHƯA đăng nhập:**
  - Khi bấm nút Lưu, hệ thống kích hoạt **Clerk SignIn Modal** (hoặc chuyển hướng `/login`).
  - **Bảo toàn dữ liệu:** Bài viết và kết quả AI được lưu giữ an toàn trong Zustand (`useAIStore` qua `localStorage`), không bị mất khi xác thực.
  - **Tự động lưu ngay sau khi đăng nhập (Auto-save on Auth Success):** Ngay khi Clerk xác thực thành công, hệ thống tự động:
    1. Kích hoạt `POST /api/auth/sync` để đồng bộ user vào PostgreSQL.
    2. Tự động kích hoạt lưu bài viết đang chờ (`pendingSave`) sang `POST /api/posts`.
    3. Hiển thị thông báo thành công và chuyển sang giao diện danh sách bài viết đã lưu mà học viên **không cần phải bấm lưu lại lần thứ hai**.
  - **Xử lý lỗi Auto-save (Error Handling):**
    - Nếu `POST /api/posts` thất bại sau khi đăng nhập (lỗi mạng, DB timeout...):
      - Dữ liệu bài viết vẫn còn nguyên trong Zustand store (không mất).
      - Hiển thị Toast lỗi rõ ràng: *"Đăng nhập thành công! Nhưng chưa lưu được bài viết."* kèm nút **"Thử lại"**.
      - Người dùng bấm "Thử lại" sẽ gọi lại `POST /api/posts` mà không cần đăng nhập lại.

---

## 📋 Yêu cầu chi tiết hệ thống (Detailed Requirements)

### 1. Xác thực & Phân quyền (Authentication & RBAC)
- **Cơ chế xác thực Clerk:**
  - Token JWT từ Frontend được giải mã và kiểm tra chữ ký thông qua `CLERK_JWKS_URL`.
  - Backend cung cấp endpoint `POST /api/auth/sync` thực hiện Upsert (thêm mới hoặc cập nhật) thông tin user vào bảng `users`.
- **Vai trò người dùng (Roles):**
  - 👑 **`ADMIN` (Giáo viên quản trị):** Quản lý toàn bộ bài viết của tất cả học sinh, bật/tắt kích hoạt tài khoản học viên, quản lý danh mục.
  - 👤 **`STUDENT` / `USER` (Học viên):** Chỉ có toàn quyền (tạo, xem, sửa, xóa) đối với bài viết của chính mình. Được phép xem bài viết của học viên khác (Read-only).
- **Trạng thái tài khoản (`is_active`):**
  - Nếu học viên bị Admin vô hiệu hóa (`is_active = False`), mọi request API tiếp theo đều bị chặn với mã lỗi `403 Forbidden`.

### 2. Quản lý Người dùng & Hồ sơ (User & Profile Management)
- `GET /api/users/me`: Lấy thông tin tài khoản hiện tại.
- `GET /api/users`: Admin lấy danh sách toàn bộ học viên (hỗ trợ phân trang `skip`, `limit`).
- `PUT /api/users/{id}/disable`: Admin toggle bật/tắt trạng thái hoạt động của học viên.
- `GET /api/users/me/profile`: Xem hồ sơ cá nhân (Bio, Level, Target Band...).
- `POST /api/users/me/profile`: Tạo mới hồ sơ cá nhân lần đầu.
- `PUT /api/users/me/profile`: Cập nhật thông tin hồ sơ cá nhân.
- *(Nguyên tắc bảo vệ: Admin không được quyền sửa hồ sơ cá nhân của học viên).*

### 3. Quản lý Bài luận (Post / Essay Management)
- `POST /api/posts`: Tạo bài viết mới kèm liên kết danh mục (`category_ids`).
- `GET /api/posts/me`: Lấy danh sách bài viết của riêng học viên đang đăng nhập (phân trang).
- `GET /api/posts`: Lấy danh sách toàn bộ bài viết dạng Public Feed — mọi user đã đăng nhập đều được xem (phân trang). Admin dùng để quản trị, Student dùng để đọc bài của người khác.
- `GET /api/posts/{id}`: *(⚠️ Cần bổ sung vào code)* Xem chi tiết một bài viết cụ thể — mọi user đã đăng nhập đều được xem.
- `PUT /api/posts/{id}`: Chỉnh sửa bài viết (Chỉ tác giả hoặc Admin mới có quyền).
- `DELETE /api/posts/{id}`: Xóa bài viết (Chỉ tác giả hoặc Admin mới có quyền).
- **Ownership Guard:** Kiểm tra nghiêm ngặt: nếu không phải Admin và `post.author_id != current_user.id` ➡️ trả về lỗi `403 Forbidden`.
- **Corner Case — Update Categories:** Khi `PUT /api/posts/{id}` không gửi `category_ids` (tức là `null`), hệ thống giữ nguyên danh sách categories hiện tại. Nếu gửi danh sách rỗng `[]`, hệ thống xóa toàn bộ liên kết categories.

### 4. Schema Dữ liệu Bài viết (PostResponse Schema)
`PostResponse` phải trả về đầy đủ dữ liệu để Frontend không phải gọi thêm request:
```python
class PostResponse(BaseModel):
    id: uuid.UUID
    title: str
    content: str
    author_id: uuid.UUID
    categories: List[CategoryResponse] = []   # ✅ Object đầy đủ, không phải UUID list
    created_at: datetime                       # ✅ Cần bổ sung — để sắp xếp và hiển thị thời gian
    updated_at: datetime                       # ✅ Cần bổ sung — thời gian cập nhật gần nhất
```
- Repository dùng `selectinload` hoặc `joinedload` để eager-load `categories` trong 1 query duy nhất, tránh N+1 Query Problem.

### 5. Danh mục Bài viết (Categories - Quan hệ Nhiều - Nhiều)
- Mỗi bài viết có thể thuộc nhiều danh mục khác nhau (VD: Vừa thuộc `IELTS Task 2`, vừa thuộc `Vocabulary Focus`).
- Bảng liên kết trung gian: `post_category_links`.
- Các danh mục mặc định được khởi tạo sẵn qua Alembic Migration:
  1. `ielts-task-2`: IELTS Task 2 Essay
  2. `daily-journal`: Daily English Journal
  3. `grammar-practice`: Grammar & Structure Practice
  4. `vocabulary-focus`: Vocabulary & Idioms Focus
- `GET /api/categories`: Lấy danh sách toàn bộ danh mục để hiển thị lên UI Frontend.
- `POST /api/categories`: Chỉ Admin mới có quyền tạo thêm danh mục mới.

### 6. CLI Management Commands — `typer` *(⚠️ Cần bổ sung vào code)*
Đề bài gốc yêu cầu `typer` trong Tech Stack. Cần tạo file `cli.py` tại root dự án:
```bash
# Tạo tài khoản Admin đầu tiên (bootstrap hệ thống)
python cli.py create-admin --email admin@msvan.edu.vn

# Seed lại dữ liệu danh mục mặc định vào DB
python cli.py seed-categories

# Liệt kê tất cả user trong hệ thống
python cli.py list-users
```
- **Mục đích:** Quản trị hệ thống qua Terminal mà không cần vào Swagger UI — tiêu chuẩn của mọi Backend Production.
- **File:** `cli.py` tại thư mục gốc (`/Volumes/MacData/english_teacher_api/cli.py`).

### 7. Phân trang dữ liệu (Pagination Standard)
- Toàn bộ danh sách Users và Posts đều áp dụng cấu trúc phân trang chuẩn:
  ```json
  {
    "items": [...],
    "total": 42,
    "skip": 0,
    "limit": 10
  }
  ```

---

## ⚙️ Cấu hình Môi trường Kết nối (Environment Config)

### Backend (`english_teacher_api/.env`):
```env
DATABASE_URL=postgresql+asyncpg://eth_admin:supersecretpassword@localhost:5432/teacher_hub
SECRET_KEY=dev_secret_key_change_in_production
ALGORITHM=HS256
CLERK_JWKS_URL=https://casual-mastiff-9574.clerk.accounts.dev/.well-known/jwks.json
CORS_ORIGINS=http://localhost:5173,http://localhost:3000,https://english-teacher-hub.vercel.app
```

### Frontend (`english_teacher_hub/.env.local`):
```env
VITE_API_BASE_URL=http://localhost:8000
VITE_CLERK_PUBLISHABLE_KEY=pk_test_Y2FzdWFsLW1hc3RpZmYtOTU3NC5jbGVyay5hY2NvdW50cy5kZXYk
```

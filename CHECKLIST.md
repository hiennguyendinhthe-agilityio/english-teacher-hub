# 🎯 MASTER IMPLEMENTATION CHECKLIST
## English Teacher Hub & AI Essay Platform (Practice 1)

> **Mục tiêu:** Bảng theo dõi tiến độ chi tiết 100% các đầu việc từ Đề bài gốc (Manager Requirements) và Thiết kế kiến trúc trong [practice_1.md](file:///Volumes/MacData/english_teacher_hub/practice_1.md).  
> **Quy ước:** `[x]` = Đã hoàn thành | `[ ]` = Đang chờ triển khai | ⚠️ = Cần chú ý / Corner case | 👤 = Cần hỗ trợ thủ công từ bạn

---

## 👤 CÁC HẠNG MỤC HỖ TRỢ THỦ CÔNG (TỪ PHÍA BẠN)

- [x] **Clerk Dashboard - Cấp quyền Admin:**  
  *Thao tác:* Vào Clerk Dashboard $\rightarrow$ `Users` $\rightarrow$ chọn user `hienndt1998@gmail.com` $\rightarrow$ mục `Public metadata` điền `{"role": "admin"}`. *(ĐÃ XONG 🎉)*
- [ ] **Clerk Dashboard - JWT Template / Session Token Claims (Tùy chọn nâng cao):**  
  *Thao tác:* Vào `Configure` $\rightarrow$ `Sessions` (hoặc `JWT Templates`) $\rightarrow$ Custom claims để nhúng `{"role": "{{user.public_metadata.role}}"}` vào JWT payload.
- [ ] **Môi trường Database:**  
  *Thao tác:* Đảm bảo Docker Postgres hoặc PostgreSQL local đang chạy với DB `teacher_hub`.

---

## 🐘 GIAI ĐOẠN 1: BACKEND (english_teacher_api)

### 1.1. CSDL, ORM & Migrations (SQLAlchemy 2.0 Async + Alembic)
- [x] Thiết lập kết nối Async PostgreSQL (`asyncpg`, `session.py`)
- [x] Mô hình dữ liệu chuẩn:
  - [x] Bảng `users` (id, email, role ENUM: `ADMIN`, `TEACHER`, `STUDENT`, `is_active`)
  - [x] Bảng `profiles` (quan hệ 1-1 với `users`: bio, level, target_band)
  - [x] Bảng `categories` (id, name, slug)
  - [x] Bảng `posts` (id, title, content, author_id, timestamps)
  - [x] Bảng liên kết trung gian `post_category_links` (quan hệ Nhiều - Nhiều giữa posts & categories)
- [x] Alembic Migration tạo 5 bảng với timezone-aware UTC timestamps
- [x] Seed sẵn 4 danh mục mặc định (`ielts-task-2`, `daily-journal`, `grammar-practice`, `vocabulary-focus`)

### 1.2. Schemas & Contracts (Pydantic V2)
- [x] User schemas (`UserResponse`, `UserSyncResponse`)
- [x] Profile schemas (`ProfileCreate`, `ProfileUpdate`, `ProfileResponse`)
- [x] Category schemas (`CategoryCreate`, `CategoryResponse`)
- [x] Phân trang chuẩn (`PaginatedResponse[T]` với `items`, `total`, `skip`, `limit`)
- [x] **Bổ sung Schema `PostResponse`:**
  - [x] Thêm `created_at: datetime`
  - [x] Thêm `updated_at: datetime`
  - [x] `categories: List[CategoryResponse]` (đã có)

### 1.3. Bảo mật & Xác thực (Clerk JWT + RBAC)
- [x] Giải mã và xác thực Clerk JWT Token qua JWKS (`verify_clerk_token`)
- [x] Dependency `get_current_user` lấy user từ DB qua email trong JWT
- [x] Dependency `require_admin` bảo vệ các route chỉ dành riêng cho Admin
- [x] Ownership Guard: Kiểm tra bài viết chỉ tác giả hoặc Admin mới được sửa/xóa

### 1.4. Repositories & Database Queries
- [x] `UserRepository`: get_by_email, get_by_id, list_users, toggle_active
- [x] `ProfileRepository`: get_by_user_id, create, update
- [x] `CategoryRepository`: get_all, get_by_slug, create
- [x] **Hoàn thiện `PostRepository`:**
  - [x] `create_with_categories`, `get_all_with_categories`, `get_count`, `delete`
  - [x] Eager-loading `selectinload(Post.categories)` chống lỗi N+1 Query
  - [x] Sắp xếp `order_by(Post.created_at.desc())` cho bài mới nhất lên đầu
  - [x] Thêm/kiểm tra method `get_with_categories(post_id)` phục vụ endpoint xem chi tiết

### 1.5. API Routers & Endpoints
- [x] `POST /api/auth/sync`: Đồng bộ user từ Clerk vào PostgreSQL
- [x] `GET /api/users/me`: Lấy thông tin tài khoản đang đăng nhập
- [x] `GET /api/users`: Admin lấy danh sách toàn bộ học viên (phân trang)
- [x] `PUT /api/users/{id}/disable`: Admin toggle khóa/mở tài khoản học viên
- [x] `GET/POST/PUT /api/users/me/profile`: Quản lý hồ sơ cá nhân
- [x] `GET /api/categories`: Lấy danh sách danh mục
- [x] `POST /api/categories`: Admin tạo danh mục mới
- [x] `POST /api/posts`: Tạo bài viết mới kèm categories
- [x] `GET /api/posts`: Public Feed lấy toàn bộ bài viết (phân trang)
- [x] `GET /api/posts/me`: Lấy bài viết của riêng user hiện tại (phân trang)
- [x] **Bổ sung `GET /api/posts/{id}`:** Endpoint xem chi tiết một bài luận cụ thể
- [x] `PUT /api/posts/{id}`: Chỉnh sửa bài viết
  - ⚠️ Corner case: `category_ids is None` giữ nguyên; `category_ids = []` xóa hết liên kết
- [x] `DELETE /api/posts/{id}`: Xóa bài viết

### 1.6. CLI Management Commands (`typer`) — *(Thiếu sót từ đề bài)*
- [x] Cài đặt `typer>=0.9.0` và thêm vào `requirements.txt`
- [x] Tạo file [cli.py](file:///Volumes/MacData/english_teacher_api/cli.py) hỗ trợ các lệnh:
  - [x] `python cli.py create-admin --email <email>`
  - [x] `python cli.py seed-categories`
  - [x] `python cli.py list-users`

### 1.7. Kiểm thử Tự động (Pytest)
- [x] Unit test cho `UserRepository`, `ProfileRepository`, `PostRepository`
- [x] Integration test cho `POST /api/posts`, `GET /api/posts`, `GET /api/posts/me`, `DELETE /api/posts`
- [x] Viết test cho endpoint mới: `GET /api/posts/{id}`
- [x] Viết test cho CLI `typer`
- [x] Viết test kiểm tra quyền sửa/xóa bài của tác giả vs học viên khác vs Admin
- [x] Chạy toàn bộ test suite đảm bảo 100% Pass (21/21 passed)

---

## 🎨 GIAI ĐOẠN 2: FRONTEND (english_teacher_hub)

### 2.1. Phân quyền Router & Bảo vệ Giao diện
- [x] Nâng cấp [ProtectedRoute.jsx](file:///Volumes/MacData/english_teacher_hub/src/components/ProtectedRoute.jsx):
  - [x] Kiểm tra đăng nhập (`isSignedIn`)
  - [x] Kiểm tra quyền Admin (`user?.publicMetadata?.role === 'admin'`)
  - [x] Chuyển hướng hoặc hiển thị trang báo lỗi *"403: Bạn không có quyền truy cập trang Quản trị viên"* nếu là Student
- [x] Điều kiện hiển thị menu Admin trên Header/Sidebar chỉ khi user có role Admin
- [x] Hiển thị Clerk `UserButton` và huy hiệu `ADMIN` trên Header

### 2.2. Tích hợp AI Writing & Luồng Lưu Bài Luận (Auto-save)
- [x] Tại màn hình kết quả chấm điểm AI Writing:
  - [x] Thêm nút bấm trực quan: **"💾 Lưu bài luận vào hồ sơ"**
- [x] **Kịch bản Guest (Chưa đăng nhập):**
  - [x] Bấm Lưu $\rightarrow$ Chuyển hướng sang `/login`
  - [x] Lưu trạng thái bài luận vào Zustand store (`useAIStore`) để không bị mất chữ
- [x] **Kịch bản Auto-save khi đăng nhập thành công:**
  - [x] Gọi `POST /api/auth/sync` đồng bộ user vào PostgreSQL
  - [x] Tự động gửi `POST /api/posts` lưu bài viết đang chờ (`pendingEssaySave`)
  - [x] Hiển thị Toast thông báo *"Đã lưu bài viết thành công! 🎉"* mà không cần học viên bấm lại lần 2
- [x] ⚠️ **Xử lý ngoại lệ (Error Handling):**
  - [x] Nếu lưu API thất bại (mất mạng/timeout): giữ nguyên bài trong store, báo Toast lỗi kèm nút **"Thử lại"**

### 2.3. Màn hình Quản lý Bài luận trên UI
- [x] Tab **"Soạn thảo & Chấm điểm" (Write & Grade)**
- [x] Tab **"Lịch sử bài viết của tôi" (My Essays):** Gọi `GET /api/posts/me` hiển thị danh sách bài đã lưu, điểm band score, ngày viết
- [x] Tab **"Thư viện bài viết / Cộng đồng" (Public Feed):** Gọi `GET /api/posts` cho phép đọc bài viết mẫu của học viên khác
- [x] Màn hình modal chi tiết bài viết: Gọi `GET /api/posts/{id}` hiển thị toàn văn bài luận + danh mục
- [x] Tuân thủ 100% Zero Hardcoded Strings (Bilingual i18n Anh - Việt)

---

## 🚀 GIAI ĐOẠN 3: KIỂM THỬ E2E & BÀN GIAO

- [x] Chạy đồng thời Backend (`uvicorn`) và Frontend (`vite`)
- [ ] Test thực tế toàn bộ luồng từ lúc học sinh viết bài $\rightarrow$ AI chấm $\rightarrow$ Đăng nhập Clerk $\rightarrow$ Auto-save $\rightarrow$ Hiện trong danh sách
- [ ] Test tài khoản Admin: Vào trang `/admin`, quản lý học sinh và danh mục
- [ ] Cập nhật tài liệu hướng dẫn chạy dự án

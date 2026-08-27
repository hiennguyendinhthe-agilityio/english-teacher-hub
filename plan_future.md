# 🗺️ LỘ TRÌNH HOÀN THIỆN DỰ ÁN: "ENGLISH TEACHER HUB"
*(Master Roadmap to Production)*

Tài liệu này đóng vai trò như một chiếc **"La Bàn"**, giúp Thầy/Cô không bao giờ bị lạc hướng trong quá trình học tập và nâng cấp dự án Sổ Tay Giáo Viên từ một bài tập thực hành trở thành một sản phẩm thương mại thực thụ.

---

## 📌 GIAI ĐOẠN 1: NỀN MÓNG CƠ BẢN (ĐÃ HOÀN THÀNH)
*Mục tiêu: Đảm bảo luồng đi cơ bản nhất của phần mềm hoạt động trơn tru.*

- [x] Xây dựng giao diện UI/UX bằng React + Tailwind (Giao diện Glassmorphism).
- [x] Tạo API cơ bản bằng FastAPI (CRUD: Thêm, Sửa, Xóa).
- [x] Tích hợp Bảo mật cơ bản: Đăng nhập/Đăng ký cấp Token JWT.
- [x] Dùng Cơ sở dữ liệu tạm thời (SQLite) để học tập.

---

## 🚀 GIAI ĐOẠN 2: TÍNH NĂNG NÂNG CAO (ĐANG THỰC HIỆN - Chapter 7-10)
*Mục tiêu: Mang lại trải nghiệm cao cấp (Premium) cho người dùng.*

- [x] **Background Tasks:** Gửi email hoặc xử lý báo cáo chạy ngầm không làm đơ giao diện.
- [x] **WebSockets (Thời gian thực):** Đồng bộ hóa dữ liệu 2 máy tính ngay lập tức không cần F5.
- [ ] **Advanced Documentation (Chapter 10):** Biến trang Swagger thành bản tài liệu chuyên nghiệp (có logo, phân chia thư mục API).
- [ ] **Unit Testing (Chapter 9):** Viết kịch bản test tự động để đảm bảo code không bao giờ lỗi khi có tính năng mới.

---

## 🏗️ GIAI ĐOẠN 3: NÂNG CẤP KIẾN TRÚC (TRƯỚC KHI LÊN MẠNG)
*Mục tiêu: Đạt chuẩn 100% so với bài Test năng lực Kỹ sư Backend.*

- [ ] **Chuyển đổi Database:** Đập bỏ SQLite ➡️ Chuyển sang dùng **PostgreSQL** (Thuê kho dữ liệu trên Supabase hoặc Neon.tech).
- [ ] **Clean Architecture:** Tách code Python hiện tại thành 3 lớp chuyên nghiệp (Router ➡️ Service ➡️ Repository).
- [ ] **Alembic Migration:** Áp dụng công cụ quản lý lịch sử Database (để sau này thêm cột, sửa bảng không bị mất dữ liệu).
- [ ] **Phân Quyền (RBAC):** Xây dựng hệ thống quyền lực: `Admin` (quản trị viên) và `Teacher` (giáo viên bình thường).
- [ ] **Refresh Token:** Tự động giữ phiên đăng nhập, không bắt giáo viên gõ lại mật khẩu sau 30 phút.

---

## ☁️ GIAI ĐOẠN 4: DEPLOYMENT (HÀNH TRÌNH RA BIỂN LỚN)
*Mục tiêu: Đưa dự án lên mạng Internet 24/7.*

- [ ] **Đóng gói Backend (Docker):** Viết file `Dockerfile` để đóng gói toàn bộ code Python.
- [ ] **Deploy Backend:** Đưa máy chủ Python lên **Render.com** hoặc **Railway.app** (lấy đường link API chuẩn HTTPS).
- [ ] **Deploy Frontend:** Cấu hình biến `VITE_API_BASE_URL` trỏ về Render, sau đó đưa giao diện React lên **Vercel.com**.
- [ ] **Setup CORS:** Chỉ định cho phép duy nhất tên miền Vercel được phép nói chuyện với Backend Render (chống hacker).

---

## 💎 GIAI ĐOẠN 5: THƯƠNG HIỆU & ĐÁNH BÓNG (TÙY CHỌN)
*Mục tiêu: Đóng mác bản quyền của chính Thầy/Cô.*

- [ ] **Mua Tên Miền Riêng:** Lên GoDaddy hoặc Mắt Bão mua một tên miền (Ví dụ: `www.msvan-english.com` hoặc `teacherhub.edu.vn`).
- [ ] **Gắn Tên Miền vào Vercel:** Trỏ tên miền vừa mua về Vercel để xóa bỏ cái đuôi `.vercel.app`.
- [ ] **Bảo Mật SSL:** Bật chứng chỉ xanh HTTPS ổ khóa an toàn cho tên miền riêng.
- [ ] **Tích hợp Google Analytics:** Đo lường xem mỗi ngày có bao nhiêu học sinh/giáo viên vào website.

---
> 💡 **LỜI KHUYÊN CỦA CHUYÊN GIA:** 
> Thầy/Cô hãy lưu file này lại. Mỗi khi học xong một kiến thức mới, Thầy/Cô có thể quay lại đây tích dấu `[x]` vào ô tương ứng. Khi tất cả các ô đều được đánh dấu, Thầy/Cô chính thức trở thành một Full-Stack Developer chuyên nghiệp! 🎓

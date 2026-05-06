# Magic Whiteboard

Ứng dụng bảng vẽ cộng tác thời gian thực được xây dựng bằng React, Laravel và WebSockets.

## Công nghệ sử dụng
- **Frontend:** React + Vite
- **Backend:** Laravel (PHP)
- **WebSocket:** Laravel Reverb
- **Cơ sở dữ liệu:** MySQL
- **Container hóa:** Docker + Docker Compose

## Yêu cầu
- Đã cài đặt Docker Desktop và đang chạy
- Không cần XAMPP hay Node.js

## Hướng dẫn cài đặt & chạy

### 1. Clone repository
git clone https://github.com/DoQuocTrung06/GK_LTW_Advanced-IAM-Project
cd Advanced-IAM-Project

### 2. Khởi động ứng dụng
docker-compose up --build

### 3. Chờ tất cả dịch vụ sẵn sàng
Khi thấy đủ 4 dòng sau là thành công:
- `whiteboard_db` → Healthy
- `whiteboard_reverb` → Starting server on 0.0.0.0:8080
- `whiteboard_backend` → Server running on http://0.0.0.0:8000
- `whiteboard_frontend` → VITE ready

### 4. Mở trình duyệt
http://localhost:5173

## Tài khoản test
- Có thể tự tạo tài khoản bằng cách bấm vào sign up và nhận được email gửi otp 6 số để xác thực
- Đăng nhập bằng các tài khoản google
- Đăng nhập bằng các tài khoản Github
- 
- ## Tính năng
- Đăng nhập bằng Google & GitHub OAuth
- Xác thực hai yếu tố (2FA)
- Vẽ cộng tác thời gian thực (WebSocket)
- Phân quyền theo vai trò (Chủ phòng / Biên tập viên / Người xem)
- Chia sẻ bảng vẽ qua email
- Tự động lưu dữ liệu bảng vẽ

## Dừng ứng dụng
Nhấn `Ctrl+C` trong terminal, sau đó chạy: docker-compose down

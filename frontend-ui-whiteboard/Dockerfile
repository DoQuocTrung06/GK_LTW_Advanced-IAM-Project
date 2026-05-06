# Sử dụng môi trường Node.js phiên bản 18 (bản alpine cực nhẹ để tiết kiệm dung lượng)
FROM node:22-alpine

# Cài đặt thư viện làm việc mặc định bên trong container
WORKDIR /app

# Copy 2 file package.json và package-lock.json vào trước
# Lý do: Giúp Docker tận dụng cache, nếu code đổi mà thư viện không đổi thì nó không phải tải lại từ đầu
COPY package*.json ./

# Chạy lệnh cài đặt các thư viện React/Vite (tương đương với thư mục node_modules)
RUN npm install

# Copy toàn bộ code frontend của bạn (các file .js, .jsx, css...) vào container
COPY . .

# Khai báo cho Docker biết React/Vite sẽ chạy ở cổng 5173
EXPOSE 5173

# Lệnh khởi động Frontend
# Chú ý: Cần có "--host 0.0.0.0" để trình duyệt ở máy tính thật của bạn có thể truy cập được vào bên trong container
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
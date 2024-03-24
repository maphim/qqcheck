# Sử dụng image Node.js phiên bản LTS
FROM node:14

# Thiết lập thư mục làm việc trong container
WORKDIR /usr/src/app

# Sao chép tất cả các tệp từ thư mục dự án vào thư mục làm việc trong container
COPY . .

# Cài đặt các phụ thuộc
RUN npm install

# Mở cổng 3000 để kết nối với ứng dụng Express.js
EXPOSE 3000

# Khởi động ứng dụng khi container được chạy
CMD ["npm", "start"]

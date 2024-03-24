# Sử dụng image node phiên bản LTS
FROM node:14

# Tạo thư mục làm việc trong container
WORKDIR /usr/src/app

# Sao chép tất cả các file trong thư mục hiện tại vào thư mục làm việc
COPY . .

# Cài đặt các dependencies
RUN npm install

# Mở cổng 3000 cho ứng dụng Express.js
EXPOSE 3000

# Khởi động ứng dụng
CMD ["node", "index.js"]

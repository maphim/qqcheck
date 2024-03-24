# Sử dụng image node phiên bản LTS
FROM node:14

# Tạo thư mục làm việc trong container
WORKDIR /usr/src/app

# Sao chép file package.json và package-lock.json vào thư mục làm việc
COPY package*.json ./

# Cài đặt các dependencies
RUN npm install

# Sao chép mã nguồn của ứng dụng vào thư mục làm việc
COPY . .

# Mở cổng 3000 cho ứng dụng Express.js
EXPOSE 3000

# Khởi động ứng dụng
CMD ["node", "index.js"]

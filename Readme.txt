# Tạo package.json nếu chưa có
npm init -y

# Cài đặt tất cả thư viện cần thiết
npm install bootstrap@5.2.3 jquery@3.6.0 @fortawesome/fontawesome-free@6.4.0 owl.carousel@2.3.4 aos@2.3.1

# Sao chép các file từ node_modules vào thư mục libs
cp node_modules/bootstrap/dist/css/bootstrap.min.css libs/bootstrap/css/
cp node_modules/bootstrap/dist/js/bootstrap.bundle.min.js libs/bootstrap/js/
cp node_modules/jquery/dist/jquery.min.js libs/jquery/
cp node_modules/@fortawesome/fontawesome-free/css/all.min.css libs/fontawesome/css/
cp -r node_modules/@fortawesome/fontawesome-free/webfonts/* libs/fontawesome/webfonts/
cp node_modules/owl.carousel/dist/owl.carousel.min.js libs/owl-carousel/
cp node_modules/owl.carousel/dist/assets/owl.carousel.min.css libs/owl-carousel/
cp node_modules/owl.carousel/dist/assets/owl.theme.default.min.css libs/owl-carousel/
cp node_modules/aos/dist/aos.js libs/aos/
cp node_modules/aos/dist/aos.css libs/aos/

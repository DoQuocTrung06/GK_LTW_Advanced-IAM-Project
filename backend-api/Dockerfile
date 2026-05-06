# Sử dụng hình ảnh PHP chính thức với phiên bản 8.2
FROM php:8.2-fpm

# Cài đặt các phần phụ trợ hệ thống cần thiết cho Laravel và MySQL
RUN apt-get update && apt-get install -y \
    build-essential \
    libpng-dev \
    libjpeg62-turbo-dev \
    libfreetype6-dev \
    locales \
    zip \
    jpegoptim optipng pngquant gifsicle \
    vim \
    unzip \
    git \
    curl \
    libzip-dev \
    libonig-dev

# Xóa bộ nhớ cache của apt để giảm kích thước file
RUN apt-get clean && rm -rf /var/lib/apt/lists/*

# Cài đặt các extension PHP cần thiết để chạy Laravel và kết nối MySQL
RUN docker-php-ext-install pdo_mysql mbstring zip exif pcntl
RUN docker-php-ext-configure gd --with-freetype --with-jpeg
RUN docker-php-ext-install gd

# Cài đặt Composer (để quản lý thư viện PHP)
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Thiết lập thư mục làm việc bên trong container
WORKDIR /var/www

# Copy toàn bộ code từ thư mục backend-api trên máy bạn vào trong container
COPY . /var/www

# Chạy lệnh cài đặt các thư viện Laravel (vendor)
# Lưu ý: Lệnh này sẽ tự chạy khi Docker dựng (build)
RUN composer install --no-interaction --optimize-autoloader --no-dev

# Cấp quyền cho thư mục storage và bootstrap/cache để Laravel có thể ghi log/cache
RUN chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache

# Mở cổng 8000 để chúng ta có thể truy cập vào API
EXPOSE 8000

# Lệnh để khởi động server Laravel nội bộ
CMD php artisan migrate --force && php artisan serve --host=0.0.0.0 --port=8000
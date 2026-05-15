#!/bin/bash

if [ ! -f /var/www/vendor/autoload.php ]; then
    echo ">>> Vendor trống, đang chạy composer install..."
    composer install --no-interaction --optimize-autoloader --no-dev
fi

php artisan config:clear
php artisan cache:clear
php artisan view:clear
php artisan migrate --force


exec "$@"
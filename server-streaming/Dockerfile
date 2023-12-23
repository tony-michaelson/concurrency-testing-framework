FROM composer

RUN docker-php-ext-install pcntl

WORKDIR /app
COPY . /app

CMD ["bash", "start.sh"]
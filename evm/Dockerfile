# Используйте образ node, чтобы установить и запустить ваше приложение
FROM node:18

# Устанавливаем supervisord
RUN apt-get update && apt-get install -y supervisor
RUN mkdir -p /var/log/supervisor

# Устанавливаем рабочую директорию внутри контейнера
WORKDIR /app

# Копируем зависимости и файлы приложения
COPY package*.json ./
RUN npm install
COPY . .

# Указываем порт, который будет слушаться вашим приложением
EXPOSE 8545

# Копируем конфиг supervisord
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Запускаем supervisord, который управляет hardhat node и скриптами деплоя
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]

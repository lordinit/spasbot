# устанавливаем базовый образ для Node.js
FROM node:16-alpine

# создаем рабочую директорию
WORKDIR /app

# копируем package.json и package-lock.json
COPY package*.json ./

# устанавливаем зависимости проекта
RUN npm install

# копируем все файлы проекта в рабочую директорию
COPY . .

# объявляем порт, который будет использоваться контейнером
EXPOSE 3000

# запускаем приложение
CMD ["npm", "start"]
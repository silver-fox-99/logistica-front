# ---------- build ----------
FROM node:20-alpine AS builder
WORKDIR /app
ENV npm_config_loglevel=warn

# 1) Устанавливаем зависимости
COPY package.json package-lock.json* ./
RUN npm ci

# 2) Кладём env-файлы (ТОЛЬКО то, что готов показать миру)
#    Если у тебя другой файл — замени на .env.production или конкретные .env.*

 или: COPY .env ./.env        # если именно .env используешь для прод-сборки

# 3) Исходники и билд
COPY . .
RUN npm run build

# ---------- runtime ----------
FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK --interval=10s --timeout=3s --retries=5 CMD wget -qO- http://127.0.0.1/ >/dev/null 2>&1 || exit 1

# ---------- build ----------
FROM node:20-alpine AS builder
WORKDIR /app
ENV npm_config_loglevel=warn

# сначала только манифесты — кэшируем установку
COPY package.json package-lock.json* ./
RUN npm ci

# если используешь build-time env для Vite:
COPY .env ./.env
# или генерируй через ARG перед сборкой

# теперь исходники
COPY . .
RUN npm run build        # tsc -b && vite build -> создаст /app/dist

# ---------- runtime ----------
FROM node:20-alpine
WORKDIR /app
RUN npm i -g serve@14

# копируем только статический билд
COPY --from=builder /app/dist ./dist

EXPOSE 80
HEALTHCHECK --interval=10s --timeout=3s --retries=5 \
  CMD wget -qO- http://127.0.0.1/ >/dev/null 2>&1 || exit 1

CMD ["serve", "-s", "dist", "-l", "80"]

# ---------- build ----------
FROM node:20-alpine AS builder
WORKDIR /app

# НЕ ставим CI=true здесь
ENV NODE_ENV=production npm_config_loglevel=warn

COPY package.json package-lock.json* ./
#COPY scripts ./scripts
RUN npm ci --omit=dev

# Если нужны .env* — скопируй до билда
# COPY .env ./.env


COPY . .
RUN npm run build

# ---------- runtime ----------
FROM node:20-alpine
WORKDIR /app
RUN npm i -g serve@14
COPY --from=builder /app/build ./build
EXPOSE 80
HEALTHCHECK --interval=10s --timeout=3s --retries=5 \
  CMD wget -qO- http://127.0.0.1/ >/dev/null 2>&1 || exit 1
CMD ["serve", "-s", "build", "-l", "80"]

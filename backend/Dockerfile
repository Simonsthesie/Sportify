# =====================================================================
# Sportify Pro - Backend Dockerfile (multi-stage)
# =====================================================================

FROM node:20-slim AS deps
WORKDIR /app
RUN apt-get update -y && apt-get install -y openssl ca-certificates --no-install-recommends && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json* ./
COPY prisma ./prisma
RUN npm ci --no-audit --no-fund

FROM node:20-slim AS build
WORKDIR /app
RUN apt-get update -y && apt-get install -y openssl ca-certificates --no-install-recommends && rm -rf /var/lib/apt/lists/*
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:20-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production
RUN apt-get update -y && apt-get install -y openssl ca-certificates curl --no-install-recommends && rm -rf /var/lib/apt/lists/*

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY package.json ./

EXPOSE 4000

HEALTHCHECK --interval=15s --timeout=5s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:4000/health || exit 1

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/prisma/seed.js && node dist/src/server.js"]

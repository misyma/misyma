FROM node:20.14.0-alpine AS base

RUN apk update
RUN apk add --no-cache libc6-compat bash

WORKDIR /app

FROM base AS builder

RUN npm i -g turbo

COPY package*.json ./
COPY turbo.json ./
COPY apps/ ./apps
COPY tsconfig.json ./

RUN turbo prune --scope="@apps/scraper" --docker

FROM base AS installer

COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/package-lock.json ./package-lock.json
COPY tsconfig.json ./

RUN npm ci

COPY --from=builder /app/out/full/ .

RUN npm run build --filter="@apps/scraper"

FROM base AS runner

ENV NODE_ENV=production
ENV NODE_CONFIG_DIR=/app/apps/scraper/config

COPY package*.json ./
COPY --from=installer /app/apps/scraper/dist ./apps/scraper
COPY --from=installer /app/apps/scraper/config ./apps/scraper/config
COPY --from=installer /app/apps/scraper/package.json ./apps/scraper/package.json

RUN npm ci

USER node

CMD node apps/scraper/src/index.js

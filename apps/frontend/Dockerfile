FROM node:20.11.1-alpine AS base

RUN apk update
RUN apk add --no-cache libc6-compat bash

WORKDIR /app

FROM base AS builder

ARG APP_NAME

RUN npm i -g turbo

COPY package*.json ./
COPY turbo.json ./
COPY apps/ ./apps
COPY common/ ./common
COPY tsconfig.json ./

RUN turbo prune --scope="@apps/$APP_NAME" --docker

FROM base AS installer

ARG APP_NAME
ARG APPLICATION_VERSION

ENV APPLICATION_VERSION=$APPLICATION_VERSION
ENV CI=true

COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/package-lock.json ./package-lock.json
COPY tsconfig.json ./

RUN npm ci

COPY --from=builder /app/out/full/ .

RUN npm run build --filter="@apps/$APP_NAME"

FROM nginx as static

ARG DIR_NAME

ENV DIR_NAME=$DIR_NAME

COPY --from=installer /app/apps/${DIR_NAME}/nginx/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=installer /app/apps/${DIR_NAME}/nginx/.htpasswd /etc/nginx/conf.d/.htpasswd

COPY --from=installer /app/apps/${DIR_NAME}/dist /usr/share/nginx/html

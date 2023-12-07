# syntax=docker/dockerfile:1
FROM node:20.9.0-alpine AS base

RUN apk update
RUN apk add --no-cache libc6-compat bash

WORKDIR /app

FROM base AS builder
ARG APP_NAME

RUN npm i -g turbo

COPY package*.json ./
COPY turbo.json ./
COPY apps/ ./apps
# COPY common/ ./common
COPY tsconfig.json ./

RUN turbo prune --scope="@apps/$APP_NAME" --docker

FROM base AS installer

ARG APP_NAME

COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/package-lock.json ./package-lock.json
COPY tsconfig.json ./

RUN npm ci

COPY --from=builder /app/out/full/ .

RUN npm run build --filter="@apps/$APP_NAME"

FROM base AS runner

ARG DIR_NAME
ARG APPLICATION_VERSION

ENV DIR_NAME=$DIR_NAME
ENV APPLICATION_VERSION=$APPLICATION_VERSION
ENV NODE_ENV=production

COPY package*.json ./
COPY --from=installer /app/apps/${DIR_NAME}/dist ./apps/${DIR_NAME}
COPY --from=installer /app/apps/${DIR_NAME}/package.json ./apps/${DIR_NAME}/package.json

# COPY --from=installer /app/common/ ./common/.temp

# RUN for folder in /app/common/.temp/*; do \
#   package_name=$(basename $folder); \
#   mkdir -p /app/common/$package_name; \
#   cp -r $folder/dist /app/common/$package_name/dist; \
#   cp $folder/package.json /app/common/$package_name/package.json; \
#   done

# RUN rm -rf ./common/.temp

RUN npm ci

USER node

CMD [ "node apps/$DIR_NAME/src/index.js" ]

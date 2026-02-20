# DocFlow Backend - NestJS API
# Multi-stage build for smaller production image
# syntax=docker/dockerfile:1
# Use BuildKit for cache mounts: DOCKER_BUILDKIT=1 (default in Docker 23+)

# ---- Base ----
FROM node:20-alpine AS base
WORKDIR /app

# ---- Dependencies ----
FROM base AS deps
COPY package*.json ./
# Cache npm store between builds so installs are fast after the first run.
# Use npm install so build works when package-lock.json is out of sync; run `npm install` locally and commit lock file to refresh.
RUN --mount=type=cache,target=/root/.npm \
    npm install

# ---- Build ----
FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# ---- Production ----
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
# Backend listens on this port (overridable via PORT env)
ENV PORT=3000
EXPOSE 3000

# Copy package files, full node_modules (needed for migration/seed ts-node), dist, src, scripts, and tsconfig (for ts-node/seed)
COPY package*.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/src ./src
COPY --from=build /app/scripts ./scripts
COPY --from=build /app/tsconfig.json ./tsconfig.json
COPY --from=build /app/nest-cli.json ./nest-cli.json

# Entrypoint: wait for DB, run migrations, run seed, then start the app
COPY entrypoint.sh ./
# Strip Windows CRLF line endings so shebang works in Alpine
RUN sed -i 's/\r$//' entrypoint.sh && chmod +x entrypoint.sh

ENTRYPOINT ["/bin/sh", "./entrypoint.sh"]

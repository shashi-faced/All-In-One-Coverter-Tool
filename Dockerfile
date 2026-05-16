# Build stage for shared packages
FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@9.1.0 --activate
WORKDIR /app
COPY package.json pnpm-lock.yaml turbo.json ./
COPY packages ./packages

# Backend build
FROM base AS backend-build
WORKDIR /app
COPY apps/backend ./apps/backend
RUN pnpm install --frozen-lockfile
RUN pnpm --filter @convertforge/backend build
RUN pnpm --filter @convertforge/backend prisma:generate

# Frontend build
FROM base AS frontend-build
WORKDIR /app
COPY apps/frontend ./apps/frontend
RUN pnpm install --frozen-lockfile
RUN pnpm --filter @convertforge/frontend build

# Workers build
FROM base AS workers-build
WORKDIR /app
COPY apps/workers ./apps/workers
RUN pnpm install --frozen-lockfile
RUN pnpm --filter @convertforge/workers build

# Backend production image
FROM node:20-alpine AS backend
RUN corepack enable && corepack prepare pnpm@9.1.0 --activate
RUN apk add --no-cache ffmpeg imagemagick libreoffice pandoc ghostscript graphicsmagick poppler-utils fontconfig
WORKDIR /app
COPY --from=backend-build /app/apps/backend/dist ./dist
COPY --from=backend-build /app/apps/backend/prisma ./prisma
COPY --from=backend-build /app/apps/backend/package.json ./
COPY --from=backend-build /app/node_modules ./node_modules
COPY --from=backend-build /app/packages ./packages
EXPOSE 4000
CMD ["node", "dist/main"]

# Frontend production image
FROM node:20-alpine AS frontend
RUN corepack enable && corepack prepare pnpm@9.1.0 --activate
WORKDIR /app
COPY --from=frontend-build /app/apps/frontend/.next ./.next
COPY --from=frontend-build /app/apps/frontend/public ./public
COPY --from=frontend-build /app/apps/frontend/package.json ./
COPY --from=frontend-build /app/apps/frontend/next.config.js ./
COPY --from=frontend-build /app/node_modules ./node_modules
EXPOSE 3000
CMD ["pnpm", "start"]

# Workers production image
FROM node:20-alpine AS workers
RUN corepack enable && corepack prepare pnpm@9.1.0 --activate
RUN apk add --no-cache ffmpeg imagemagick libreoffice pandoc ghostscript graphicsmagick poppler-utils
WORKDIR /app
COPY --from=workers-build /app/apps/workers/dist ./dist
COPY --from=workers-build /app/apps/workers/package.json ./
COPY --from=workers-build /app/node_modules ./node_modules
COPY --from=workers-build /app/packages ./packages
CMD ["node", "dist/main.js"]

# Development image
FROM node:20-alpine AS development
RUN corepack enable && corepack prepare pnpm@9.1.0 --activate
RUN apk add --no-cache ffmpeg imagemagick libreoffice pandoc ghostscript graphicsmagick poppler-utils
WORKDIR /app
COPY . .
RUN pnpm install
CMD ["pnpm", "dev"]

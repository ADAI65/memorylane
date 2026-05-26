# Multi-stage Dockerfile for Railway deployment
# Build context: repository root (Railway sends the whole repo)

# ─── Build stage ───────────────────────────────────────────
FROM node:22-alpine AS builder

RUN npm install -g pnpm@9

WORKDIR /app

# Copy workspace config and root tsconfig
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml tsconfig.base.json ./

# Copy package.json for shared and api
COPY packages/shared/package.json packages/shared/
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/

# Install all dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY packages/shared/ packages/shared/
COPY apps/api/ apps/api/
COPY apps/web/ apps/web/

# Build shared first, then api
RUN pnpm --filter @memorylane/shared build
RUN pnpm --filter @memorylane/api build

# ─── Production stage ──────────────────────────────────────
FROM node:22-alpine AS runner

RUN npm install -g pnpm@9

WORKDIR /app

# Copy workspace config
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./

# Copy package.json for production install
COPY packages/shared/package.json packages/shared/
COPY apps/api/package.json apps/api/

# Install only production dependencies
RUN pnpm install --frozen-lockfile --prod

# Copy built output and preload script from builder
COPY --from=builder /app/packages/shared/dist/ packages/shared/dist/
COPY --from=builder /app/apps/api/dist/ apps/api/dist/
COPY --from=builder /app/apps/api/preload.cjs apps/api/preload.cjs

# Set environment
ENV NODE_ENV=production
ENV PORT=3001

EXPOSE 3001

CMD ["node", "apps/api/preload.cjs"]

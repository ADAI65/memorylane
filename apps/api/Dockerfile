# ─── Build stage ───────────────────────────────────────────
FROM node:22-alpine AS builder

RUN npm install -g pnpm@9

WORKDIR /app

# Copy workspace config
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/shared/package.json packages/shared/
COPY apps/api/package.json apps/api/

# Install dependencies (no devDeps for production)
RUN pnpm install --frozen-lockfile --prod=false

# Copy source code
COPY packages/shared/ packages/shared/
COPY apps/api/ apps/api/

# Build
RUN pnpm --filter @memorylane/shared build
RUN pnpm --filter @memorylane/api build

# ─── Production stage ──────────────────────────────────────
FROM node:22-alpine AS runner

RUN npm install -g pnpm@9

WORKDIR /app

# Copy workspace config and production node_modules
COPY package.json pnpm-workspace.yaml ./
COPY packages/shared/package.json packages/shared/
COPY apps/api/package.json apps/api/

RUN pnpm install --frozen-lockfile --prod

# Copy built output and preload script
COPY packages/shared/dist/ packages/shared/dist/
COPY apps/api/dist/ apps/api/dist/
COPY apps/api/preload.cjs apps/api/preload.cjs

# Set environment
ENV NODE_ENV=production
ENV PORT=3001

EXPOSE 3001

CMD ["node", "apps/api/preload.cjs"]

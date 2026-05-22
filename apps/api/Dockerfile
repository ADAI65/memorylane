# ─── Build stage ───────────────────────────────────────────
FROM node:20-alpine AS builder

RUN corepack enable && corepack prepare pnpm@9 --activate

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
FROM node:20-alpine AS runner

RUN corepack enable && corepack prepare pnpm@9 --activate

WORKDIR /app

# Copy workspace config and production node_modules
COPY package.json pnpm-workspace.yaml ./
COPY packages/shared/package.json packages/shared/
COPY apps/api/package.json apps/api/

RUN pnpm install --frozen-lockfile --prod

# Copy built output
COPY packages/shared/dist/ packages/shared/dist/
COPY apps/api/dist/ apps/api/dist/

# Set environment
ENV NODE_ENV=production
ENV PORT=3001

EXPOSE 3001

CMD ["node", "apps/api/dist/index.js"]

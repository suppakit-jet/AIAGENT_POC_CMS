# Base image: node:20-alpine
FROM node:20-alpine AS builder

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy root workspace and backend package definitions
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY backend/package.json ./backend/
COPY backend/prisma ./backend/prisma/

# Install dependencies (frozen-lockfile)
RUN pnpm install --frozen-lockfile

# Copy backend source code
COPY backend/ ./backend/

# Generate Prisma Client & Build
WORKDIR /app/backend
RUN npx prisma generate
RUN pnpm build

# Stage 2: Production Runner
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY backend/package.json ./backend/
COPY backend/prisma ./backend/prisma/

# Install production dependencies only
RUN pnpm install --prod --frozen-lockfile

COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/backend/node_modules/.prisma ./backend/node_modules/.prisma

# Security: Non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

EXPOSE 3000

WORKDIR /app/backend
CMD ["node", "dist/main.js"]

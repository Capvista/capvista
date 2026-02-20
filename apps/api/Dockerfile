FROM node:20-slim AS base
RUN npm install -g pnpm@8.12.0

# Install dependencies
FROM base AS deps
WORKDIR /app
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/api/package.json apps/api/
COPY packages/database/package.json packages/database/
RUN pnpm install --frozen-lockfile

# Generate Prisma client and build
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=deps /app/packages/database/node_modules ./packages/database/node_modules
COPY . .
RUN cd packages/database && npx prisma generate
RUN cd apps/api && pnpm build

# Production image
FROM node:20-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8080

# Copy compiled API
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/package.json ./

# Copy API runtime dependencies (express, cors, helmet, etc.)
COPY --from=builder /app/apps/api/node_modules ./node_modules

# Copy the database package (runtime source for @capvista/database)
COPY --from=builder /app/packages/database ./packages/database

# Copy generated Prisma client
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Link @capvista/database so require("@capvista/database") resolves
RUN mkdir -p node_modules/@capvista && \
    ln -s /app/packages/database node_modules/@capvista/database

EXPOSE 8080
CMD ["node", "dist/index.js"]

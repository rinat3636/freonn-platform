# syntax=docker/dockerfile:1
FROM node:22-slim AS builder
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@10.4.1 --activate

COPY package.json pnpm-lock.yaml ./
COPY patches ./patches
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm build

FROM node:22-slim AS runner
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@10.4.1 --activate

ENV NODE_ENV=production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/drizzle ./drizzle
COPY --from=builder /app/drizzle.config.ts ./
COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-lock.yaml ./
COPY --from=builder /app/patches ./patches

RUN pnpm install --prod --frozen-lockfile

EXPOSE 3000
VOLUME ["/app/uploads"]
CMD ["node", "dist/index.js"]

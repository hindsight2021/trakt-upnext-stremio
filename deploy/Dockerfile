FROM node:24-alpine AS builder

RUN corepack enable

WORKDIR /app

COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY tsconfig.base.json tsconfig.json ./
COPY lib/ ./lib/
COPY artifacts/api-server/ ./artifacts/api-server/
COPY artifacts/setup/ ./artifacts/setup/

RUN pnpm install --frozen-lockfile

RUN pnpm --filter @workspace/setup run build
RUN pnpm --filter @workspace/api-server run build


FROM node:24-alpine AS runner

WORKDIR /app

COPY --from=builder /app/artifacts/api-server/dist ./dist
COPY --from=builder /app/artifacts/setup/dist/public ./dist/public

ENV NODE_ENV=production
ENV PORT=7000

EXPOSE 7000

CMD ["node", "--enable-source-maps", "./dist/index.mjs"]

FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@latest --activate

# --- Build stage ---
FROM base AS build
WORKDIR /app

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml* ./
COPY backend/package.json backend/
COPY frontend/package.json frontend/

RUN pnpm install --no-frozen-lockfile

COPY backend/ backend/
COPY frontend/ frontend/

RUN cd frontend && pnpm run build

# --- Production stage ---
FROM base AS production
WORKDIR /app

COPY --from=build /app/pnpm-workspace.yaml /app/package.json ./
COPY --from=build /app/backend/package.json backend/
COPY --from=build /app/frontend/package.json frontend/
COPY --from=build /app/backend/ backend/
COPY --from=build /app/frontend/dist backend/frontend/dist

RUN pnpm install --no-frozen-lockfile --prod

EXPOSE 5000

ENV NODE_ENV=production

CMD ["sh", "-c", "cd backend && npx concurrently \"node cluster.js\" \"node message-worker-process.js\""]

FROM node:20-alpine

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml* ./
COPY backend/package.json backend/
COPY frontend/package.json frontend/

RUN pnpm install --frozen-lockfile

COPY backend/ backend/
COPY frontend/ frontend/

RUN cd frontend && pnpm run build

EXPOSE 5000

ENV NODE_ENV=production

CMD ["sh", "-c", "cd backend && npx concurrently \"node cluster.js\" \"node message-worker-process.js\""]

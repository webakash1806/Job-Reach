# syntax=docker/dockerfile:1
# One Dockerfile, two images:
#   docker build --target web    -> Next.js dashboard (port 3000)
#   docker build --target worker -> background sender + IMAP reply checker

FROM node:22-alpine AS base
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# ---------- web ----------
FROM base AS web
ENV NODE_ENV=production PORT=3000 HOSTNAME=0.0.0.0
RUN addgroup -S app && adduser -S app -G app
COPY --from=build --chown=app:app /app/.next/standalone ./
COPY --from=build --chown=app:app /app/.next/static ./.next/static
COPY --from=build --chown=app:app /app/public ./public
# Chrome extension source, zipped per user by /api/extension.
# docker compose passes it in; with plain docker build add: --build-context extension=../extension
COPY --from=extension --chown=app:app . ./extension
USER app
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s CMD wget -qO- http://127.0.0.1:3000/login >/dev/null || exit 1
CMD ["node", "server.js"]

# ---------- worker ----------
FROM base AS worker
ENV NODE_ENV=production
RUN addgroup -S app && adduser -S app -G app
COPY --from=deps --chown=app:app /app/node_modules ./node_modules
COPY --chown=app:app package.json tsconfig.json ./
COPY --chown=app:app src/lib ./src/lib
COPY --chown=app:app worker ./worker
USER app
CMD ["npx", "tsx", "worker/index.ts"]

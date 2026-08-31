# ---------- Stage 1: build ----------
# Installs ALL dependencies (including dev tools), then prunes dev
# dependencies back out once any build step is done. This stage itself
# is discarded after copying its output into Stage 2.
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build --if-present
RUN npm prune --omit=dev


# ---------- Stage 2: production runtime ----------
# Starts fresh from a slim base and copies over only the pruned
# node_modules and application source from the builder stage.
FROM node:20-alpine AS runtime

RUN apk add --no-cache curl

WORKDIR /app

RUN addgroup -S appgroup && adduser -S appuser -G appgroup

ENV NODE_ENV=production

COPY --from=builder --chown=appuser:appgroup /app ./

USER appuser

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:5000/api/health || exit 1

CMD ["node", "server.js"]

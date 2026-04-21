# ── Stage 1: Build React frontend ────────────────────────────────
FROM node:20-alpine AS frontend-build

WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci
COPY client/ ./
RUN npm run build

# ── Stage 2: Backend + built frontend ────────────────────────────
FROM node:20-alpine AS final

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

# Copy built frontend from Stage 1
COPY --from=frontend-build /app/client/dist ./client/dist

EXPOSE 3000
CMD ["node", "server.js"]
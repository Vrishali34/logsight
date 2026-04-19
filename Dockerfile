# ── Build stage ───────────────────────────────────────────────────
FROM node:20-alpine AS base

# Set working directory inside the container
WORKDIR /app

# Copy package files first (Docker layer caching — only reinstalls
# dependencies when package.json changes, not on every code change)
COPY package*.json ./

# Install production dependencies only
RUN npm ci --omit=dev

# Copy the rest of the source code
COPY . .

# ── Runtime ───────────────────────────────────────────────────────
# Expose the port Express listens on
EXPOSE 3000

# Start the server
CMD ["node", "server.js"]
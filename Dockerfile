# Stage 1: Build
FROM node:22-alpine AS builder

# Install build dependencies for native modules (better-sqlite3)
RUN apk add --no-cache python3 make g++

WORKDIR /usr/src/app

COPY package*.json ./
COPY yarn.lock ./

# Install ALL dependencies including devDependencies for native compilation
RUN yarn install --frozen-lockfile

# Stage 2: Production
FROM node:22-alpine

# Install runtime dependencies (tzdata for timezone support)
RUN apk add --no-cache tzdata

# Create necessary directories and set permissions for the non-root 'node' user
RUN mkdir -p /tmp/actual /actual/taxes && \
    chown -R node:node /tmp/actual /actual/taxes

WORKDIR /usr/src/app

# Copy node_modules from builder
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY package*.json ./

# Copy application source
COPY app/ .

# Use the non-root user provided by the alpine image
USER node

EXPOSE 49160

CMD [ "node", "index.js" ]

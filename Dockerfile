# Stage 1: Build
FROM node:22-bookworm AS builder

# Install build dependencies for native modules (better-sqlite3)
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/app

COPY package*.json ./
COPY yarn.lock ./

# 1. Install all dependencies (to build native modules)
RUN yarn install --frozen-lockfile

# 2. Prune devDependencies to keep only production libraries
RUN yarn install --production --ignore-scripts --prefer-offline

# Stage 2: Production (Distroless)
FROM gcr.io/distroless/nodejs22-debian12

WORKDIR /usr/src/app

# Copy ONLY the production node_modules
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY package*.json ./
COPY app/ .

EXPOSE 49160

# Use the 'nonroot' user (UID 65532) for maximum security
USER 65532

CMD [ "index.js" ]

# Stage 1: Build
FROM node:22-bookworm AS builder

# Install build dependencies for native modules (better-sqlite3)
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/app

COPY package*.json ./
COPY yarn.lock ./

# Install ALL dependencies including devDependencies for native compilation
RUN yarn install --frozen-lockfile

# Stage 2: Production (Distroless)
FROM gcr.io/distroless/nodejs22-debian12

WORKDIR /usr/src/app

# Copy node_modules from builder
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY package*.json ./

# Copy application source
COPY app/ .

# The Actual SDK will store data in /tmp/actual, which is writable in Distroless
# The app handles tax file reading from its volume mount.

EXPOSE 49160

# Use the 'nonroot' user (UID 65532) for maximum security
USER 65532

# In Distroless, the entrypoint is 'node' by default, 
# so we just provide the script path.
CMD [ "index.js" ]

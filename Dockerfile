# Stage 1: Build
FROM node:18-alpine AS builder
WORKDIR /app

# Copy package files first for caching
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Run the blog build script
RUN node scripts/build-blog.js

# Stage 2: Serve
FROM nginx:alpine

# Copy the entire app directory (including generated 'blog' folder) to Nginx root
COPY --from=builder /app /usr/share/nginx/html

# Copy custom Nginx config
COPY nginx.conf /etc/nginx/nginx.conf

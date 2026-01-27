# Stage 1: Build
FROM node:20-alpine AS builder
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

# Copy only static output to Nginx root
COPY --from=builder /app/index.html /usr/share/nginx/html/index.html
COPY --from=builder /app/assets /usr/share/nginx/html/assets
COPY --from=builder /app/sections /usr/share/nginx/html/sections
COPY --from=builder /app/public /usr/share/nginx/html/public
COPY --from=builder /app/blog /usr/share/nginx/html/blog
COPY --from=builder /app/privacy /usr/share/nginx/html/privacy
COPY --from=builder /app/terms /usr/share/nginx/html/terms
COPY --from=builder /app/robots.txt /usr/share/nginx/html/robots.txt
COPY --from=builder /app/sitemap.xml /usr/share/nginx/html/sitemap.xml
COPY --from=builder /app/rss.xml /usr/share/nginx/html/rss.xml

# Copy custom Nginx config
COPY nginx.conf /etc/nginx/nginx.conf

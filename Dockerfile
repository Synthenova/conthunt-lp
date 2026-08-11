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
COPY --from=builder /app/about /usr/share/nginx/html/about
COPY --from=builder /app/alex /usr/share/nginx/html/alex
COPY --from=builder /app/authors /usr/share/nginx/html/authors
COPY --from=builder /app/editorial /usr/share/nginx/html/editorial
COPY --from=builder /app/elena /usr/share/nginx/html/elena
COPY --from=builder /app/lamrin /usr/share/nginx/html/lamrin
COPY --from=builder /app/maya /usr/share/nginx/html/maya
COPY --from=builder /app/zach-sanders /usr/share/nginx/html/zach-sanders
COPY --from=builder /app/robots.txt /usr/share/nginx/html/robots.txt
COPY --from=builder /app/llms.txt /usr/share/nginx/html/llms.txt
COPY --from=builder /app/sitemap.xml /usr/share/nginx/html/sitemap.xml
COPY --from=builder /app/rss.xml /usr/share/nginx/html/rss.xml

# Copy custom Nginx config
COPY nginx.conf /etc/nginx/nginx.conf

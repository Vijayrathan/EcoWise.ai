# Multi-stage Dockerfile for EcoWise AI frontend (Vite + React)
# NOTE: Platform (linux/amd64) is set at build time via `docker buildx --platform`

# ---------- Build stage ----------
FROM node:20-alpine AS build

# Set working directory
WORKDIR /app

# Build-time API URL
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Log the API URL for debugging
RUN echo "Using API URL: $VITE_API_URL"

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy the rest of the frontend source
COPY . .

# Build the app for production
RUN npm run build

# ---------- Runtime stage ----------
# Use a small Nginx image to serve the static files
FROM nginx:1.27-alpine AS runtime

# Copy built assets from the build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy a basic Nginx config to support SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose the port Nginx listens on
EXPOSE 8080

# Nginx runs as PID 1 by default
CMD ["nginx", "-g", "daemon off;"]

FROM node:20 AS build
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml ./
RUN pnpm install 

# Copy source code
COPY . .

# Accept build arguments
ARG VITE_BASE_URL
ARG VITE_SERVER_URL
ARG VITE_STRIPE_PUBLISHABLE_KEY
ARG VITE_GOOGLE_CLIENT_ID

# Set environment variables for build
ENV VITE_BASE_URL=$VITE_BASE_URL
ENV VITE_SERVER_URL=$VITE_SERVER_URL
ENV VITE_STRIPE_PUBLISHABLE_KEY=$VITE_STRIPE_PUBLISHABLE_KEY
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID

# Build the application with environment variables
RUN pnpm build

FROM nginx:alpine
WORKDIR /usr/share/nginx/html

RUN rm -rf ./*

COPY --from=build /app/dist . 

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

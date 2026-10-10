FROM node:20-alpine

WORKDIR /app

# Copy package manifests
COPY package*.json ./

# Install production dependencies
RUN npm ci --omit=dev

# Copy application code
COPY . .

# Default environment & port for CapRover
ENV NODE_ENV=production
ENV PORT=80

EXPOSE 80

CMD ["node", "src/index.js"]

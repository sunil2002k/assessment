FROM node:22-alpine
WORKDIR /app

# Dependencies first so this layer is cached until package files change
COPY package*.json ./
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

COPY tsconfig.json vitest.config.ts ./
COPY src ./src
COPY tests ./tests
RUN npm run build

ENV NODE_ENV=production
EXPOSE 3000
USER node

# Migrations + idempotent seed run on every start, then the API
CMD ["sh", "-c", "node dist/db/init.js && node dist/server.js"]

# Development stage
FROM node:18-alpine AS development

WORKDIR /app

COPY package*.json ./
COPY .npmrc ./

RUN npm ci --only=development

COPY . .

EXPOSE 3001

CMD ["npm", "run", "dev"]

# Builder stage
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY .npmrc ./

RUN npm ci

COPY . .

RUN npm run build

# Production stage
FROM node:18-alpine AS production

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
COPY .npmrc ./

RUN npm ci --only=production

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/src/database ./src/database

USER node

EXPOSE 3001

CMD ["node", "dist/server.js"]
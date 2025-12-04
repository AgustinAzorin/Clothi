# Development stage
FROM node:18-alpine AS development

WORKDIR /app

# Copiar solo package.json
COPY package*.json ./

# Instalar dependencias (incluyendo dev para desarrollo)
RUN npm ci

# Copiar el código
COPY . .

EXPOSE 3001

CMD ["npm", "run", "dev"]

# Builder stage (para producción)
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./

# Instalar todas las dependencias
RUN npm ci

COPY . .

# Construir la aplicación
RUN npm run build

# Production stage
FROM node:18-alpine AS production

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./

# Instalar solo dependencias de producción
RUN npm install

# Copiar lo construido desde la etapa builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/src/database ./src/database

# Cambiar a usuario no-root por seguridad
USER node

EXPOSE 3001

CMD ["node", "dist/server.js"]
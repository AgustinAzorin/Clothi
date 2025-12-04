# Clothi API - Dockerfile para Render.com
# Este archivo construye SOLO la API (sin docker-compose)

FROM node:18-alpine

WORKDIR /app

# 1. Copiar package.json de la raíz
COPY package*.json ./

# 2. Copiar package.json de la API
COPY apps/api/package*.json ./apps/api/

# 3. Instalar dependencias de la raíz (si hay)
RUN npm ci --only=production || true

# 4. Instalar dependencias de la API
WORKDIR /app/apps/api
RUN npm ci --only=production

# 5. Copiar código de la API
WORKDIR /app
COPY apps/api ./apps/api

# 6. Instalar sequelize-cli globalmente para migraciones
RUN npm install -g sequelize-cli

# 7. Crear directorio para uploads
RUN mkdir -p /app/apps/api/uploads

# 8. Puerto y variables
EXPOSE 3001
ENV PORT=3001
ENV NODE_ENV=production

# 9. Comando para Render
WORKDIR /app/apps/api
CMD ["sh", "-c", "npx sequelize-cli db:migrate && node src/server.js"]
# Dockerfile para Render - VERSIÓN CORREGIDA
FROM node:18-alpine

WORKDIR /app

# 1. Copiar SOLO lo necesario de la API
COPY apps/api/package*.json ./package.json

# 2. Instalar dependencias de producción
RUN npm ci --only=production

# 3. Copiar código de la API
COPY apps/api/src ./src
COPY apps/api/uploads ./uploads            

# 4. Instalar sequelize-cli GLOBALMENTE
RUN npm install -g sequelize-cli

# 5. Variables de entorno
ENV NODE_ENV=production
ENV PORT=3001
EXPOSE 3001

# 6. Comando CORREGIDO
CMD ["sh", "-c", "npx sequelize-cli db:migrate && node src/server.js"]
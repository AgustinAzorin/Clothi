# Dockerfile en RAÍZ del proyecto
FROM node:18-alpine

WORKDIR /app

# 1. Copiar package.json de la raíz
COPY package*.json ./

# 2. Instalar dependencias de producción
RUN npm ci --only=production

# 3. Copiar código fuente
COPY src/ ./apps/api/src/
# 4. Instalar sequelize-cli globalmente
RUN npm install -g sequelize-cli

# 5. Puerto
EXPOSE 3001
ENV PORT=3001
ENV NODE_ENV=production

# 6. Comando para producción
CMD ["sh", "-c", "npx sequelize-cli db:migrate && node src/server.js"]
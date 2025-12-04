FROM node:18-alpine

WORKDIR /app

# 1. Copiar package.json de la raíz
COPY package*.json ./
COPY apps/api/package*.json ./apps/api/

# 2. Instalar TODAS las dependencias (incluyendo devDependencies)
# Porque necesitamos sequelize-cli para migraciones
RUN npm ci

# 3. Copiar código
COPY . .

# 4. Instalar sequelize-cli globalmente (para migraciones)
RUN npm install -g sequelize-cli

# 5. Puerto
EXPOSE 3001
ENV PORT=3001
ENV NODE_ENV=production

# 6. Comando CORREGIDO para producción
WORKDIR /app/apps/api
CMD ["sh", "-c", "npx sequelize-cli db:migrate && node src/server.js"]
# Dockerfile para monorepo en Render
FROM node:18-alpine

WORKDIR /app

# Copiar SOLO lo necesario de la API
COPY apps/api/package*.json ./package.json

# Instalar dependencias
RUN npm ci --only=production

# Copiar código de la API
COPY apps/api/src ./src
COPY apps/api/uploads ./uploads

# Instalar sequelize-cli
RUN npm install -g sequelize-cli

# Variables
ENV NODE_ENV=production
ENV PORT=3001
EXPOSE 3001

# Comando
CMD ["sh", "-c", "npx sequelize-cli db:migrate && node src/server.js"]
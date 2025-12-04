# Dockerfile (en la raíz)
FROM node:18-alpine

WORKDIR /app

# Copiar solo package.json para instalar deps
COPY package*.json ./
COPY apps/api/package*.json ./apps/api/

RUN npm install

# Copiar el resto del código
COPY . .

ENV NODE_ENV=production

# Exponer puerto de la API
EXPOSE 3000

# Iniciar el servicio principal
CMD ["node", "apps/api/src/server.js"]

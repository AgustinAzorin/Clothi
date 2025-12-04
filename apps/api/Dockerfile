# Development stage
FROM node:18-alpine AS development

WORKDIR /app

# Copiar solo package.json
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el código
COPY . .

EXPOSE 3001

CMD ["npm", "run", "dev"]

# Production stage
FROM node:18-alpine AS production

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./

# Instalar solo dependencias de producción
RUN npm ci --only=production

# Copiar el código
COPY . .

# Cambiar a usuario no-root por seguridad
USER node

EXPOSE 3001

CMD ["node", "src/server.js"]
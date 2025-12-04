# apps/api/Dockerfile - Para desarrollo local
FROM node:18-alpine

WORKDIR /app

# Copiar package.json de la API
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar código
COPY . .

# Puerto y comando
EXPOSE 3001
CMD ["npm", "run", "start"]
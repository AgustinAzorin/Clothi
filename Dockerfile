FROM node:18-alpine

WORKDIR /app

# 1. Copiamos package.json y package-lock.json
COPY package*.json ./

# 2. Instalamos TODAS las dependencias (dev incluidas para sequelize-cli)
RUN npm install

# 3. Copiamos el código fuente al WORKDIR
COPY . .

# 4. Instalamos sequelize-cli global
RUN npm install -g sequelize-cli

# 5. Puerto y variables
ENV NODE_ENV=production
ENV PORT=3001
EXPOSE 3001

# 6. Ejecutar migraciones (la CLI ya está global)
CMD ["sh", "-c", "sequelize-cli db:migrate && node src/server.js"]

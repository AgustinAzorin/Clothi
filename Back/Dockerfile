# Dockerfile (raíz)
FROM node:20-alpine

# Crear directorio de trabajo
WORKDIR /app

# Copiar package.json del Auth Service (y otros si agregas más microservicios)
COPY auth_service/package*.json ./src/auth_service/

# Instalar dependencias
RUN cd auth_service && npm install

# Copiar todo el código
COPY . .

# Exponer el puerto del Auth Service
EXPOSE 3001

# Copiar y ejecutar start.sh
COPY start.sh .
RUN chmod +x start.sh

CMD ["./start.sh"]

# Clothi Root Dockerfile - Para Render.com
# Este archivo construye TODO el monorepo

FROM node:18-alpine AS builder

WORKDIR /app

# 1. Copiar archivos de configuración del monorepo
COPY package*.json ./
COPY .npmrc ./

# 2. Copiar configuración de workspaces
COPY apps/api/package*.json ./apps/api/
COPY apps/web/package*.json ./apps/web/  # Si existe

# 3. Instalar dependencias RAÍZ
RUN npm ci

# 4. Instalar dependencias de cada workspace
RUN npm run install --workspace=apps/api
# RUN npm run install --workspace=apps/web  # Cuando exista

# 5. Copiar código fuente
COPY . .

# 6. Construir API
WORKDIR /app/apps/api
RUN npm run build || echo "No build script, continuando..."

# 7. Stage de producción
FROM node:18-alpine AS production

WORKDIR /app

ENV NODE_ENV=production

# 8. Copiar solo lo necesario para producción
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/apps/api/package*.json ./apps/api/

# 9. Instalar solo producción en raíz
RUN npm ci --only=production --workspaces

# 10. Copiar código construido
COPY --from=builder /app/apps/api ./apps/api
COPY --from=builder /app/apps/api/node_modules ./apps/api/node_modules

# 11. Variables para Render
EXPOSE 3001
ENV PORT=3001

# 12. Comando para Render (solo API)
WORKDIR /app/apps/api
CMD ["node", "src/server.js"]
FROM node:20-alpine

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar código fuente
COPY . .

# Construir la aplicación (las variables VITE_ se inyectan aquí)
RUN npm run build

# Exponer puerto (Railway lo asigna dinámicamente)
EXPOSE 4173

# Usar el puerto dinámico de Railway
CMD ["sh", "-c", "npm run preview -- --host 0.0.0.0 --port ${PORT:-4173}"]

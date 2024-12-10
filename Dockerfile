# Etapa 1: Construir la aplicación
FROM node:16-alpine as build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
RUN npm run build

# Etapa 2: Servir la aplicación
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html

# Configurar Nginx para usar el puerto 3000
RUN sed -i 's/listen       80;/listen 3000;/' /etc/nginx/conf.d/default.conf

EXPOSE 3000
CMD ["nginx", "-g", "daemon off;"]

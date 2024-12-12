# Etapa 1: Construir la aplicación
FROM node:16-alpine as build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
RUN npm run build

# Etapa 2: Servir la aplicación con Nginx
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf  
RUN sed -i 's/listen       80;/listen 8080;/' /etc/nginx/conf.d/default.conf
# Exponer el puerto esperado por Google Cloud Run
EXPOSE 8080

# Comando para iniciar Nginx
CMD ["nginx", "-g", "daemon off;"]

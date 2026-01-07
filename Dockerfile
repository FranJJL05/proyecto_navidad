# Paso 1: Usar una imagen base ligera de Nginx (Alpine Linux)
# Alpine es muy seguro porque tiene lo mínimo necesario.
FROM nginx:alpine

# Paso 2: Copiar nuestros archivos de la página web al servidor dentro del contenedor
# Copiamos todo el contenido de la carpeta actual (.) a la carpeta pública de Nginx
COPY . /usr/share/nginx/html

# Paso 3: Exponer el puerto 80 (el estándar web)
EXPOSE 80

# Paso 4: El comando para iniciar Nginx viene por defecto en la imagen,
# así que no hace falta escribir CMD, se iniciará solo.
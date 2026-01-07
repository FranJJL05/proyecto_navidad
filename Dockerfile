# 1. Usamos la imagen base ligera
FROM nginx:alpine

# 2. SEGURIDAD: Copiamos configuración personalizada de Nginx (Opcional, pero recomendada)
# Si no tienes configuración extra, usamos la por defecto pero ajustamos permisos.

# 3. Copiamos los archivos de la web
COPY . /usr/share/nginx/html

# 4. SEGURIDAD: Configurar permisos para que el usuario 'nginx' (no root) pueda tocar lo necesario
# Nginx necesita escribir en /var/cache y /var/run, así que le damos permiso
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    chown -R nginx:nginx /etc/nginx/conf.d
RUN touch /var/run/nginx.pid && \
    chown -R nginx:nginx /var/run/nginx.pid

# 5. SEGURIDAD: Cambiamos al usuario 'nginx' (NO ROOT)
USER nginx

# 6. Exponemos el puerto 8080 (los usuarios no root no pueden usar el 80)
EXPOSE 8080

# 7. Cambiamos la configuración de Nginx para escuchar en el 8080 en vez del 80
# Esto es un truco rápido para evitar crear un archivo nginx.conf aparte
RUN sed -i 's/listen  80;/listen 8080;/' /etc/nginx/conf.d/default.conf

# El comando de arranque es automático
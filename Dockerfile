# 1. Imagen base
FROM nginx:alpine

# 2. Copiamos la web
COPY . /usr/share/nginx/html

# 3. SEGURIDAD: Permisos y Configuración automática
# En lugar de copiar un archivo externo, lo creamos aquí mismo para asegurar que es perfecto.
# Creamos una configuración que escucha en el puerto 8080.
RUN echo 'server { listen 8080; location / { root /usr/share/nginx/html; index index.html index.htm; } }' > /etc/nginx/conf.d/default.conf

# 4. Ajustamos permisos para el usuario 'nginx'
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    chown -R nginx:nginx /etc/nginx/conf.d
RUN touch /var/run/nginx.pid && \
    chown -R nginx:nginx /var/run/nginx.pid

# 5. Cambiamos al usuario seguro
USER nginx

# 6. Exponemos el puerto 8080
EXPOSE 8080
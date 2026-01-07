# 1. Imagen base
FROM nginx:alpine

# 2. Copiamos la web
COPY . /usr/share/nginx/html

# 3. SEGURIDAD: Permisos para usuario no-root
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    chown -R nginx:nginx /etc/nginx/conf.d
RUN touch /var/run/nginx.pid && \
    chown -R nginx:nginx /var/run/nginx.pid

# 4. SEGURIDAD: Cambiar puerto 80 a 8080 (ESTA ES LA CLAVE)
# Usamos una expresión regular que traga cualquier espacio para que no falle
RUN sed -i 's/listen.*80;/listen 8080;/' /etc/nginx/conf.d/default.conf

# 5. Cambiar a usuario seguro
USER nginx

# 6. Exponer puerto
EXPOSE 8080
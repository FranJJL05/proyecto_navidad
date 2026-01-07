# 1. Imagen base
FROM nginx:alpine

# 2. Copiamos la web
COPY . /usr/share/nginx/html

# 3. NUEVO: Copiamos nuestra configuración segura de Nginx (Puerto 8080)
COPY default.conf /etc/nginx/conf.d/default.conf

# 4. SEGURIDAD: Permisos para usuario no-root
# Le damos propiedad de todo al usuario 'nginx'
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    chown -R nginx:nginx /etc/nginx/conf.d
RUN touch /var/run/nginx.pid && \
    chown -R nginx:nginx /var/run/nginx.pid

# 5. Cambiar a usuario seguro (no root)
USER nginx

# 6. Exponer puerto 8080
EXPOSE 8080
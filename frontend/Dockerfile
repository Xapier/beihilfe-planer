FROM nginx:alpine

# Kopiere die App-Dateien
COPY app /usr/share/nginx/html

# Kopiere nginx Config
COPY docker/nginx.conf /etc/nginx/nginx.conf

# Port
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

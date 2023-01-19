FROM nginx:1.23.2-alpine

COPY ./public/ /usr/share/nginx/html

COPY ./entrypoint/add_env.sh /docker-entrypoint.d/add_env.sh
RUN chmod +x /docker-entrypoint.d/add_env.sh
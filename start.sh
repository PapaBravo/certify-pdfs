docker-compose -f ./deployment/docker-compose.yml --env-file ./deployment/.env up \
--build --force-recreate --remove-orphans --renew-anon-volumes
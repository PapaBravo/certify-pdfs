# Introduction

For architecture, see [architecture documentation](doc/architecture.adoc)

# Running

The system can be tested with [docker-compose](https://docs.docker.com/compose/) or  deployed to a kubernetes cluster (tested with [microk8s](https://microk8s.io/)). See below.

## Before Startup
Generate a new key pair with 

```sh
openssl ecparam -name prime256v1 -genkey -noout -out ./deployment/certify-pdfs/secrets/ec256-key-pair.pem
openssl ec -in ./deployment/secrets/ec256-key-pair.pem -pubout -out ./deployment/certify-pdfs/secrets/ec256-public.pem
cat ./deployment/certify-pdfs/secrets/ec256-key-pair.pem | base64 -w 0 > ./deployment/certify-pdfs/secrets/ec256-key-pair.pem.base64
cat ./deployment/certify-pdfs/secrets/ec256-public.pem | base64 -w 0 > ./deployment/certify-pdfs/secrets/ec256-public.pem.base64
```
and add the base64 parts to the `deployments/.env`.

## Start with docker-compose
Using docker-compose, the whole system can be started with 

```sh
sh ./start.sh
```

## Kubernetes / Helm

```sh
# run once to install dependencies
cd deployment/
helm dependency update ./certify-pdfs

# deploy locally (repeat after changing code)
sh deploy.sh
```

### Inspect and manually test

```sh
# Dashboard
microk8s dashboard-proxy
# Logging Proxy
microk8s.kubectl port-forward -n kube-system service/kibana-logging 8181:5601

# Minio Dashboard
microk8s kubectl port-forward $(microk8s kubectl get pods -o=name | grep certify-pdfs-minio-[^p]) 9001:9001

# Minio values
microk8s kubectl port-forward $(microk8s kubectl get pods -o=name | grep certify-pdfs-minio-[^p]) 9000:9000

# Certifier API
microk8s kubectl port-forward $(microk8s kubectl get pods -o=name | grep certify-pdfs-api ) 8080:8080

# client
microk8s kubectl port-forward $(microk8s kubectl get pods -o=name | grep cI think I ertify-pdfs-client ) 8084:80
```

## Automated Testing
```sh
cd deployment/
helm test certify-pdfs --logs
```
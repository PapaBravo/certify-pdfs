docker build -t localhost:32000/certify-api ../api
docker push localhost:32000/certify-api
docker build -t localhost:32000/certify-renderer ../renderer
docker push localhost:32000/certify-renderer
docker build -t localhost:32000/certify-client ../client
docker push localhost:32000/certify-client
helm upgrade --install certify-pdfs ./certify-pdfs
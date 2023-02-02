docker build -t localhost:32000/certify-api ../api
docker push localhost:32000/certify-api
docker build -t localhost:32000/certify-renderer ../renderer
docker push localhost:32000/certify-renderer
docker build -t localhost:32000/certify-client ../client
docker push localhost:32000/certify-client
docker build -t localhost:32000/certify-test ../test
docker push localhost:32000/certify-test
helm upgrade --install certify-pdfs ./certify-pdfs
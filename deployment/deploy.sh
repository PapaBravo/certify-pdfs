docker build -t localhost:32000/certify-api ../api
docker push localhost:32000/certify-api
helm upgrade --install certify-pdfs ./certify-pdfs
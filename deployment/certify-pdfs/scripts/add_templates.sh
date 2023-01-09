echo "add templates script is running"
echo "connecting to $MINIO_HOST"
mc alias set minio http://$MINIO_HOST:9000/ $MINIO_USER $MINIO_PASSWORD
ls /data/templates/
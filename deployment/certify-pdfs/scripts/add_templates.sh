echo "post install job connecting to $MINIO_HOST"
mc alias set minio http://$MINIO_HOST:$MINIO_PORT/ $MINIO_USER $MINIO_PASSWORD
mc od if=/data/templates/template.html of=minio/templates/ticket
mc anonymous set download minio/results
const config = {
    context: {
        resultUrl: process.env.RESULT_URL || 'http://localhost:9000/results/',
        verificationUrl: process.env.VERIFICATION_URL || 'http://localhost:8081/verification.html?token=',
        publicSignKey: Buffer.from(process.env.SIGN_PUBLIC_KEY, 'base64').toString('utf8'),
        privateSignKey: Buffer.from(process.env.SIGN_PRIVATE_KEY, 'base64').toString('utf8')
    },
    redis: {
        user: process.env.REDIS_USER || 'default',
        password: process.env.REDIS_PASSWORD || 'sOmE_sEcUrE_pAsS',
        host: process.env.REDIS_HOST || 'redis',
        port: +process.env.REDIS_PORT || 6379,
        queueKey: process.env.REDIS_QUEUE || 'queue'
    },
    minio: {
        user: process.env.MINIO_USER || 'minioadmin',
        password: process.env.MINIO_PASSWORD || 'minioadmin',
        host: process.env.MINIO_HOST || 'minio',
        port: +process.env.MINIO_PORT || 9000,

        resultBucketName: process.env.MINIO_RESULT_BUCKET || 'results',
        templateBucketName: process.env.MINIO_TEMPLATE_BUCKET || 'templates'
    }
};

module.exports = {
    config
};
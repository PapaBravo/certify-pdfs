const config = {
    app: {
        port: process.env.PORT || '8080',
        allowedOrigins: process.env.ORIGINS ? process.env.ORIGINS.split(',') : ['http://localhost:8081']
    },
    redis: {
        user: process.env.REDIS_USER || 'default',
        password: process.env.REDIS_PASSWORD || 'sOmE_sEcUrE_pAsS',
        host: process.env.REDIS_HOST || 'redis',
        port: process.env.REDIS_PORT || '6379',
        queueKey: process.env.REDIS_QUEUE || 'queue',
        jobsKeyPrefix: process.env.REDIS_JOB_PREFIX || 'jobs:'
    },
    context: {
        publicSignKey: Buffer.from(process.env.SIGN_PUBLIC_KEY, 'base64').toString('utf8')
    }
};

module.exports = {
    config
};
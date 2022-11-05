'use strict';

const { createClient } = require('redis');

const redisConfig = {
    username: 'default',
    password: 'sOmE_sEcUrE_pAsS',
    socket: {
        host: 'redis',
        port: '6379'
    }
}

const redis = createClient(redisConfig);

async function main() {
    try {
        await redis.connect();
        console.log('renderer connected to redis');

        await redis.subscribe('__keyevent@0__:set', (message, channel) => {
            console.log('renderer', channel, message);
        });

    } catch (err) {
        console.error('Renderer failed to connect to redis', err);
    }
}

main();
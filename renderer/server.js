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

async function getNextJob() {
    console.log('Waiting for next job');
    const { element: jobID } = await redis.BRPOP('queue', 0);
    console.log('Found job id', jobID);

    const jobKey = `jobs:${jobID}`;

    const jobDetails = await redis.json.get(jobKey, '$');
    console.log('Received job details', jobDetails);

    await redis.json.set(jobKey, '$.status', "RENDERING");

    //TODO: render document here

    return getNextJob();
}

async function main() {
    try {
        await redis.connect();
        console.log('renderer connected to redis');

        // await redis.subscribe('__keyevent@0__:set', (message, channel) => {
        //     console.log('renderer', channel, message);

    } catch (err) {
        console.error('Renderer failed to connect to redis', err);
    }

    await getNextJob();
}

main();
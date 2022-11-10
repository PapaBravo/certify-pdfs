'use strict';

const { createClient } = require('redis');
const Minio = require('minio');
const process = require('process');

const redisConfig = {
    username: 'default',
    password: 'sOmE_sEcUrE_pAsS',
    socket: {
        host: 'redis',
        port: '6379'
    }
}

const minioClient = new Minio.Client({
    endPoint: 'minio',
    port: 9000,
    useSSL: false,
    accessKey: 'minioadmin',
    secretKey: 'minioadmin'
})

function log(message, level) {

    const result = `${new Date().toISOString()} - ${`Service` + process.env.SERVICE_ID} - ${message}`;

    if (level === 'error') {
        console.error(result)
    } else {
        console.log(result);
    }
}

const redis = createClient(redisConfig);

async function getNextJob() {
    log('Waiting for next job');
    const { element: jobID } = await redis.BRPOP('queue', 0);
    log('Found job id ' + jobID);

    const jobKey = `jobs:${jobID}`;

    const jobDetails = await redis.json.get(jobKey, '$');
    log('Received job details');

    await redis.json.set(jobKey, '$.status', "RENDERING");

    //TODO: render document here
    await new Promise((resolve) => setTimeout(resolve, 5000));
    minioClient.putObject('results', jobID, JSON.stringify(jobDetails), (err) => {
        if (err) {
            console.error('Could not put object', err);
        }
    });

    getNextJob();
}

async function main() {
    try {
        await redis.connect();
        log('renderer connected to redis');

        // await redis.subscribe('__keyevent@0__:set', (message, channel) => {
        //     console.log('renderer', channel, message);

    } catch (err) {
        console.error('Renderer failed to connect to redis', err);
    }

    await getNextJob();
}

main();
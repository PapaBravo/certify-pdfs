const logger = require('./logger');
const { ObjectStorage } = require('./objectStorage');
const { KeyValueStore } = require('./keyValueStore');
const { renderDocument } = require('./documentHandler');
const { config } = require('./config');

const TEMPLATE_BUCKET = config.minio.templateBucketName;
const RESULT_BUCKET = config.minio.resultBucketName;

async function handleJob(jobID) {
    const keyValueStore = await KeyValueStore.getInstance();
    const objectStore = await ObjectStorage.getInstance();
    const jobKey = `jobs:${jobID}`;

    const jobDetails = await keyValueStore.getJSON(jobKey);
    logger.info('Received job details for ' + jobID);

    await keyValueStore.setJSON(jobKey, {status: "RENDERING"});
    let template = await objectStore.getObject(TEMPLATE_BUCKET, jobDetails.documentKey);
    template = template.toString('utf8');
    let document = await renderDocument(template, JSON.parse(jobDetails.claim));
    const objInfo = await objectStore.putObject(RESULT_BUCKET, jobID + '.pdf', document);

    await keyValueStore.setJSON(
        [jobKey, jobKey],
        [{status: "DONE"}, {pdfUrl: config.context.resultUrl + jobID + '.pdf'}]
    );

    logger.info('wrote job result to store %o', objInfo);
}

function getNextJob() {
    logger.info('Waiting for next job');

    KeyValueStore.getInstance()
        .then(keyValueStore => keyValueStore.pop(config.redis.queueKey))
        .then(({ element: jobID }) => handleJob(jobID))
        .then(getNextJob);
}

module.exports = {
    getNextJob
}
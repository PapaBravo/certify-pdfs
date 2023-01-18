const { ObjectStorage } = require('./objectStorage');
const { KeyValueStore } = require('./keyValueStore');
const { renderDocument } = require('./documentHandler');
const { config } = require('./config');

const TEMPLATE_BUCKET = config.minio.templateBucketName;
const RESULT_BUCKET = config.minio.resultBucketName;

async function handleJob(jobID) {
    const keyStore = await KeyValueStore.getInstance();
    const objectStore = await ObjectStorage.getInstance();
    const jobKey = `jobs:${jobID}`;

    const jobDetails = await keyStore.getJSON(jobKey);
    console.log('Received job details for ' + jobID);

    await keyStore.setJSON(jobKey, {status: "RENDERING"});
    let template = await objectStore.getObject(TEMPLATE_BUCKET, jobDetails.documentKey);
    template = template.toString('utf8');
    let document = await renderDocument(template, JSON.parse(jobDetails.claim));
    const objInfo = await objectStore.putObject(RESULT_BUCKET, jobID + '.pdf', document);

    await keyStore.setJSON(
        [jobKey, jobKey],
        [{status: "DONE"}, {pdfUrl: config.context.resultUrl + jobID + '.pdf'}]
    );

    console.log('wrote job result to store', objInfo);
}

function getNextJob() {
    console.log('Waiting for next job');

    KeyValueStore.getInstance()
        .then(keyStore => keyStore.pop(config.redis.queueKey))
        .then(({ element: jobID }) => handleJob(jobID))
        .then(getNextJob);
}

module.exports = {
    getNextJob
}
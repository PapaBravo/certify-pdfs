const { ObjectStorage } = require('./objectStorage');
const { KeyValueStore } = require('./keyValueStore');
const { renderDocument } = require('./documentHandler');

async function getNextJob() {

    console.log('Waiting for next job');
    const keyStore = await KeyValueStore.getInstance();
    const objectStore = await ObjectStorage.getInstance();

    const { element: jobID } = await keyStore.pop('queue');
    console.log('Found job id ' + jobID);

    const jobKey = `jobs:${jobID}`;

    const jobDetails = await keyStore.getJSON(jobKey, '$');
    console.log('Received job details');

    await keyStore.setJSON(jobKey, '$.status', "RENDERING");


    await new Promise((resolve) => setTimeout(resolve, 5000));
    //TODO: Add template download here
    let document = await renderDocument('Hello, {{claim.firstName}}!', JSON.parse(jobDetails.claim));
    await objectStore.putObject('results', jobID, document);

    getNextJob();
}

module.exports = {
    getNextJob
}
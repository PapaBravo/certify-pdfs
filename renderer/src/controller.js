const { ObjectStorage } = require('./objectStorage');
const { KeyValueStore } = require('./keyValueStore');


async function getNextJob() {
    
    console.log('Waiting for next job');
    const keyStore = await KeyValueStore.getInstance();
    const objectStore = await ObjectStorage.getInstance();

    const { element: jobID } = await keyStore.pop('queue');
    console.log('Found job id ' + jobID);

    const jobKey = `jobs:${jobID}`;

    const jobDetails = keyStore.getJSON(jobKey, '$');
    console.log('Received job details');

    await keyStore.setJSON(jobKey, '$.status', "RENDERING");

    //TODO: render document here
    await new Promise((resolve) => setTimeout(resolve, 5000));

    await objectStore.putObject('results', jobID, JSON.stringify(jobDetails));

    getNextJob();
}

module.exports = {
    getNextJob
}
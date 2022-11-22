const { ObjectStorage } = require('./objectStorage');
const { KeyValueStore } = require('./keyValueStore');
const { renderDocument } = require('./documentHandler');

async function handleJob(jobID) {
    const keyStore = await KeyValueStore.getInstance();
    const objectStore = await ObjectStorage.getInstance();
    const jobKey = `jobs:${jobID}`;

    const jobDetails = await keyStore.getJSON(jobKey, '$');
    console.log('Received job details for ' + jobID);

    await keyStore.setJSON(jobKey, '$.status', "RENDERING");
    let template = await objectStore.getObject('templates', jobDetails.documentKey);
    template = template.toString('utf8');
    let document = await renderDocument(template, JSON.parse(jobDetails.claim));
    const objInfo = await objectStore.putObject('results', jobID + '.pdf', document);

    await keyStore.setJSON(
        [jobKey, jobKey], 
        ['$.status', '$.pdfUrl'], 
        ["DONE", `http://localhost:9000/results/${jobID}.pdf`]
    );

    console.log('wrote job result to store', objInfo);
}

function getNextJob() {
    console.log('Waiting for next job');

    KeyValueStore.getInstance()
        .then(keyStore => keyStore.pop('queue'))
        .then(({ element: jobID }) => handleJob(jobID))
        .then(getNextJob);
}

module.exports = {
    getNextJob
}
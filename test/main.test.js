const axios = require('axios');

const BASE_URL = process.env.API_URL;
const TEST_CLAIM = {
    firstName: 'First',
    lastName: 'Last'
}

const SIGN_REQUEST_BODY = {
    claim: JSON.stringify(TEST_CLAIM),
    documentKey: 'ticket'
}

async function pollJobStatusUntilDone(jobID, backoff) {
    if (!backoff) backoff = 1000;
    let job;
    for (let i = 0; i < 5; i++) {
        await new Promise(resolve => setTimeout(resolve, backoff));
        let { data } = await axios.get(`${BASE_URL}/job/${jobID}`);
        job = data;
        if (job.status === 'DONE') return job;
    }
    throw new Error('Not done before timeout');
}

test('env variables are here', () => {
    expect(process.env.API_URL).toBeDefined()
});

test('sign endpoint responds', async () => {

    let { status, data } = await axios.post(`${BASE_URL}/sign`, SIGN_REQUEST_BODY);

    expect(status).toBe(200);
    let jobID = data.jobID;
    expect(jobID).toMatch(/^\w{8}-\w{4}-\w{4}-\w{4}-\w{12}$/);
});

test('eventually renders', async () => {
    let results = [];

    for (let i = 0; i < 3; i++) {
        results.push(await axios.post(`${BASE_URL}/sign`, SIGN_REQUEST_BODY));
    }

    let jobID = results[2].data.jobID;
    let { data: { status: jobStatus } } = await axios.get(`${BASE_URL}/job/${jobID}`);
    expect(jobStatus).toBe('WAITING');

    await expect(pollJobStatusUntilDone(jobID)).resolves.toHaveProperty('status', 'DONE')
});

test('server verification', async () => {
    let { data: { jobID } } = await axios.post(`${BASE_URL}/sign`, SIGN_REQUEST_BODY);

    let { pdfUrl } = await pollJobStatusUntilDone(jobID);
    //TODO: extract signature and check via /verify
})
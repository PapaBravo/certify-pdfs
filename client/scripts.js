const BASE_URL = 'http://localhost:8080/api/v1';

async function sendRequest(path, data) {
    let response = await fetch(`${BASE_URL}${path}`, {
        method: data ? "POST" : "GET",
        body: data ? JSON.stringify(data) : undefined,
        headers: {
            'Content-Type': data ? 'application/json' : undefined
        }
    });
    let status = response.status;
    response = await response.json();
    return { status, body: response };
}

async function getJobStatus(jobID, backoff) {
    if (!backoff) backoff = 100;
    let { body: job } = await sendRequest(`/job/${jobID}`);
    renderJob(job, jobID);

    if (backoff > 5 * 60 * 1000) {
        console.log('Giving up job status requests for', jobID);
        return;
    }

    if (job.status !== 'DONE') {
        setTimeout(() => getJobStatus(jobID, backoff * 2), backoff);
    }
}

async function requestDocumentClick() {
    const data = {
        "claim": "{\"firstName\": \"First\", \"lastName\": \"Last\"}",
        "documentKey": "ticket"
    };

    let { body: { jobID } } = await sendRequest('/sign', data);
    await getJobStatus(jobID);
}

function renderJob(job, jobID) {
    document.getElementById('td_jobid').textContent = jobID;
    document.getElementById('td_status').textContent = job.status;
    if (job.pdfUrl) {
        document.getElementById('td_url')
            .innerHTML = `<a href="${job.pdfUrl}">Document</a>`;
    }
}
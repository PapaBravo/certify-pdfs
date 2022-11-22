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
    let container = document.getElementById(`result_${jobID}`);
    if (!container) {
        container = document.createElement('div');
        let results = document.getElementById('results');
        results.appendChild(container);
    }

    container.classList = "result";
    container.id = "result_" + jobID;
    container.setAttribute("data-status", job.status);
    let html = `
<table>
    <tbody>
    <tr>
        <th>JobID</th>
        <td class="result_id">${jobID}</td>
    </tr>
    <tr>
        <th>Status</th>
        <td>${job.status}</td>
    </tr>
    <tr>
        <th>URL</th>
        <td>${job.pdfUrl ? `<a href="${job.pdfUrl}">Document</a>` : ''}</td>
    </tr>
    </tbody>
</table>`;
    container.innerHTML = html;
}